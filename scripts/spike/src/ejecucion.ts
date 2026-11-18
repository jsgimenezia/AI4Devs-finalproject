// Bucle de medición: configuraciones x casos x ejecuciones, con protección de gasto.

import type Anthropic from '@anthropic-ai/sdk';
import { evaluarRegla } from './comprobaciones.ts';
import { definicionesDe } from './datos.ts';
import { esquemaSalidaAutor, formatoSalida, validarRespuesta } from './esquema.ts';
import { costeUsd, type Escenario, llamarReal, llamarSimulada } from './llamada.ts';
import { construirMensaje, INSTRUCCIONES_SISTEMA } from './prompt.ts';
import { puntuar } from './puntuacion.ts';
import type {
  Ajustes,
  Caso,
  Configuracion,
  DefinicionRegla,
  Precios,
  RegistroLlamada,
  TipoPeticion,
} from './tipos.ts';

export interface EntradaPreparada {
  caso: Caso;
  defs: DefinicionRegla[];
  reglasNoCumplidas: string[];
  mensaje: string;
}

/** Entrada de cada caso: valores actuales vacíos y reglas que no se cumplen con ellos. */
export function prepararEntradas(casos: Caso[], catalogo: DefinicionRegla[], ajustes: Ajustes): EntradaPreparada[] {
  return casos.map((caso) => {
    const defs = definicionesDe(catalogo, caso.tipo);
    const valoresActuales: Record<string, string> = Object.fromEntries(defs.map((d) => [d.campoClave, '']));
    // Con todos los campos vacíos, las reglas con condición quedan «no aplica» (6.5) y no se listan.
    const reglasNoCumplidas = defs
      .filter((d) => evaluarRegla(d, valoresActuales, ajustes.fechaReferencia) === 'NO_CUMPLE')
      .map((d) => d.codigo);
    const mensaje = construirMensaje(caso, defs, valoresActuales, reglasNoCumplidas, ajustes);
    return { caso, defs, reglasNoCumplidas, mensaje };
  });
}

export function esquemasPorTipo(catalogo: DefinicionRegla[]) {
  const tipos: TipoPeticion[] = ['INCIDENCIA', 'CAMBIO'];
  return Object.fromEntries(
    tipos.map((t) => {
      const esquema = esquemaSalidaAutor(definicionesDe(catalogo, t));
      return [t, { esquema, formato: formatoSalida(esquema) }];
    }),
  ) as Record<TipoPeticion, { esquema: ReturnType<typeof esquemaSalidaAutor>; formato: ReturnType<typeof formatoSalida> }>;
}

export interface OpcionesEjecucion {
  modo: 'real' | 'seco';
  escenario?: Escenario;
  cliente?: Anthropic;
  configuraciones: Configuracion[];
  casos: Caso[];
  catalogo: DefinicionRegla[];
  ajustes: Ajustes;
  precios: Precios;
  alRegistrar?: (r: RegistroLlamada) => void;
  avisar?: (mensaje: string) => void;
}

export interface ResultadoEjecucion {
  registros: RegistroLlamada[];
  /** Motivo de parada anticipada, o null si terminó. */
  detenida: string | null;
  /** Gasto estimado: coste real de las llamadas con tokens y peor caso de las que no los tienen. */
  gastoEstimadoUsd: number;
}

export function peorCasoLlamadaUsd(precios: Precios, cfg: Configuracion, tokensEntrada: number, ajustes: Ajustes): number {
  return costeUsd(precios.modelos[cfg.modelo]!, tokensEntrada, ajustes.maxTokens);
}

/** Estimación prudente de tokens de entrada antes de tener una medida real (~2 caracteres por token). */
export function entradaEstimada(mensaje: string): number {
  return Math.ceil((INSTRUCCIONES_SISTEMA.length + mensaje.length) / 2);
}

export async function ejecutar(op: OpcionesEjecucion): Promise<ResultadoEjecucion> {
  const { ajustes, precios } = op;
  const avisar = op.avisar ?? (() => {});
  for (const cfg of op.configuraciones) {
    if (!precios.modelos[cfg.modelo]) throw new Error(`precios.json no tiene precio para ${cfg.modelo}`);
  }
  if (op.modo === 'real' && !op.cliente) throw new Error('Modo real sin cliente');

  const entradas = prepararEntradas(op.casos, op.catalogo, ajustes);
  const esquemas = esquemasPorTipo(op.catalogo);
  const registros: RegistroLlamada[] = [];
  const entradaMedida = new Map<string, number>();
  let gasto = 0;

  for (const cfg of op.configuraciones) {
    const precio = precios.modelos[cfg.modelo]!;
    for (const e of entradas) {
      for (let ejecucion = 1; ejecucion <= ajustes.ejecucionesPorCaso; ejecucion++) {
        const tokensPrevistos = entradaMedida.get(`${cfg.modelo}|${e.caso.id}`) ?? entradaEstimada(e.mensaje);
        const peorCaso = peorCasoLlamadaUsd(precios, cfg, tokensPrevistos, ajustes);
        if (gasto + peorCaso > ajustes.limiteGastoUsd) {
          return {
            registros,
            gastoEstimadoUsd: gasto,
            detenida:
              `Protección de gasto: llevamos ${gasto.toFixed(4)} USD estimados y la siguiente llamada ` +
              `(${cfg.id}, ${e.caso.id}, ejecución ${ejecucion}) podría costar hasta ${peorCaso.toFixed(4)} USD, ` +
              `lo que superaría el límite de ${ajustes.limiteGastoUsd} USD. Medición detenida.`,
          };
        }

        const { esquema, formato } = esquemas[e.caso.tipo];
        const r =
          op.modo === 'real'
            ? await llamarReal(op.cliente!, cfg, ajustes, INSTRUCCIONES_SISTEMA, e.mensaje, formato)
            : llamarSimulada(op.escenario ?? 'esperado', e.caso, ejecucion, ajustes, INSTRUCCIONES_SISTEMA, e.mensaje);

        let fallo = r.fallo;
        let respuesta: Record<string, string> | null = null;
        let otrasSalidas: RegistroLlamada['otrasSalidas'] = null;
        if (!fallo) {
          const v = validarRespuesta(r.textoRespuesta ?? '', esquema);
          if (v.ok) {
            respuesta = v.campos;
            otrasSalidas = v.otras;
          } else fallo = { motivo: 'ESQUEMA_INVALIDO', detalle: v.detalle };
        }
        const p = puntuar(e.caso, e.defs, respuesta, ajustes.fechaReferencia);
        const coste =
          r.tokensEntrada !== null && r.tokensSalida !== null
            ? costeUsd(precio, r.tokensEntrada, r.tokensSalida)
            : null;
        if (r.tokensEntrada !== null) entradaMedida.set(`${cfg.modelo}|${e.caso.id}`, r.tokensEntrada);
        gasto += coste ?? peorCaso;

        const registro: RegistroLlamada = {
          configuracion: cfg.id,
          modelo: cfg.modelo,
          esfuerzo: cfg.esfuerzo,
          caso: e.caso.id,
          ejecucion,
          valida: fallo === null,
          motivoInvalida: fallo?.motivo ?? null,
          detalleInvalida: fallo?.detalle ?? null,
          stopReason: r.stopReason,
          respuesta,
          otrasSalidas,
          respuestaBruta: r.textoRespuesta,
          aciertos: p.aciertos,
          invenciones: p.invenciones,
          valoresSinEsperado: p.valoresSinEsperado,
          tokensEntrada: r.tokensEntrada,
          tokensSalida: r.tokensSalida,
          tokensCacheEscritura: r.tokensCacheEscritura,
          tokensCacheLectura: r.tokensCacheLectura,
          tiempoMs: Math.round(r.tiempoMs),
          costeUsd: coste,
        };
        registros.push(registro);
        op.alRegistrar?.(registro);
        const nAciertos = Object.values(p.aciertos).filter(Boolean).length;
        avisar(
          `${cfg.id} ${e.caso.id} #${ejecucion}: ${fallo ? `INVÁLIDA (${fallo.motivo})` : 'válida'}, ` +
            `aciertos ${nAciertos}/${e.defs.length}, invenciones ${p.invenciones.length}, ` +
            `${(r.tiempoMs / 1000).toFixed(1)} s, ${coste === null ? 'coste desconocido' : `${coste.toFixed(4)} USD`}` +
            ` (acumulado estimado ${gasto.toFixed(4)} USD)`,
        );
      }
    }
  }
  return { registros, detenida: null, gastoEstimadoUsd: gasto };
}
