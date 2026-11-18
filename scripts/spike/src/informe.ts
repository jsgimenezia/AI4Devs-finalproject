// Resumen por configuración, criterio de decisión de docs/producto.md 12.2 e informe en Markdown.

import { VERSION_PROMPT } from './prompt.ts';
import type { Ajustes, Caso, Configuracion, MotivoInvalida, Precios, RegistroLlamada } from './tipos.ts';

// Criterio fijado el 18 de noviembre de 2026 (cuestión 24). No depende de configuraciones.json.
export const CRITERIO = {
  aciertosMinimos: 0.7,
  tiempoMaximoMs: 60_000,
  costeMedioMaximoUsd: 0.05,
} as const;

export interface ResumenConfiguracion {
  cfg: Configuracion;
  llamadasPrevistas: number;
  llamadas: number;
  completa: boolean;
  aciertos: number;
  campos: number;
  porcentaje: number;
  invenciones: { caso: string; ejecucion: number; campo: string; valor: string }[];
  valoresSinEsperado: { caso: string; ejecucion: number; campo: string; valor: string }[];
  invalidas: { caso: string; ejecucion: number; motivo: MotivoInvalida; detalle: string }[];
  tiempoMaximoMs: number;
  tiempoMedioMs: number;
  costeMedioUsd: number | null;
  costeTotalUsd: number;
  llamadasSinCoste: number;
  tokensEntradaMedios: number | null;
  tokensSalidaMedios: number | null;
  hayTokensCache: boolean;
  fallosPorCampo: Record<string, number>;
  condicion1: boolean;
  condicion2: boolean;
  condicion3: boolean;
  cumple: boolean;
}

function media(valores: number[]): number | null {
  return valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function resumir(
  configuraciones: Configuracion[],
  registros: RegistroLlamada[],
  casos: Caso[],
  ajustes: Ajustes,
): ResumenConfiguracion[] {
  return configuraciones.map((cfg) => {
    const propios = registros.filter((r) => r.configuracion === cfg.id);
    const llamadasPrevistas = casos.length * ajustes.ejecucionesPorCaso;
    let aciertos = 0;
    let campos = 0;
    const fallosPorCampo: Record<string, number> = {};
    for (const r of propios) {
      for (const [campo, ok] of Object.entries(r.aciertos)) {
        campos++;
        if (ok) aciertos++;
        else fallosPorCampo[`${r.caso}.${campo}`] = (fallosPorCampo[`${r.caso}.${campo}`] ?? 0) + 1;
      }
    }
    const conCoste = propios.filter((r) => r.costeUsd !== null);
    const costes = conCoste.map((r) => r.costeUsd!);
    const tiempos = propios.map((r) => r.tiempoMs);
    const invalidas = propios
      .filter((r) => !r.valida)
      .map((r) => ({ caso: r.caso, ejecucion: r.ejecucion, motivo: r.motivoInvalida!, detalle: r.detalleInvalida ?? '' }));
    const invenciones = propios.flatMap((r) => r.invenciones.map((i) => ({ caso: r.caso, ejecucion: r.ejecucion, ...i })));
    const valoresSinEsperado = propios.flatMap((r) =>
      r.valoresSinEsperado.map((i) => ({ caso: r.caso, ejecucion: r.ejecucion, ...i })),
    );
    const porcentaje = campos === 0 ? 0 : aciertos / campos;
    const tiempoMaximoMs = tiempos.length ? Math.max(...tiempos) : 0;
    const costeMedioUsd = media(costes);
    const completa = propios.length === llamadasPrevistas;

    const condicion1 = invenciones.length === 0;
    const condicion2 = porcentaje >= CRITERIO.aciertosMinimos;
    const condicion3 =
      tiempoMaximoMs <= CRITERIO.tiempoMaximoMs &&
      !invalidas.some((i) => i.motivo === 'TIEMPO_AGOTADO') &&
      costeMedioUsd !== null &&
      costeMedioUsd <= CRITERIO.costeMedioMaximoUsd;

    return {
      cfg,
      llamadasPrevistas,
      llamadas: propios.length,
      completa,
      aciertos,
      campos,
      porcentaje,
      invenciones,
      valoresSinEsperado,
      invalidas,
      tiempoMaximoMs,
      tiempoMedioMs: media(tiempos) ?? 0,
      costeMedioUsd,
      costeTotalUsd: costes.reduce((a, b) => a + b, 0),
      llamadasSinCoste: propios.length - conCoste.length,
      tokensEntradaMedios: media(conCoste.map((r) => r.tokensEntrada!)),
      tokensSalidaMedios: media(conCoste.map((r) => r.tokensSalida!)),
      hayTokensCache: propios.some((r) => (r.tokensCacheEscritura ?? 0) > 0 || (r.tokensCacheLectura ?? 0) > 0),
      fallosPorCampo,
      condicion1,
      condicion2,
      condicion3,
      cumple: completa && condicion1 && condicion2 && condicion3,
    };
  });
}

/** La más barata (coste medio por llamada) de las que cumplen; en empate, la primera de la lista. */
export function elegir(resumenes: ResumenConfiguracion[]): ResumenConfiguracion | null {
  const candidatas = resumenes.filter((r) => r.cumple);
  if (candidatas.length === 0) return null;
  return candidatas.reduce((mejor, r) => (r.costeMedioUsd! < mejor.costeMedioUsd! ? r : mejor));
}

// ---------------------------------------------------------------------------------------------
// Markdown

const pct = (x: number) => `${(x * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;
const seg = (ms: number) => `${(ms / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} s`;
const usd = (x: number | null) =>
  x === null ? '—' : `${x.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USD`;
const sn = (b: boolean) => (b ? 'sí' : 'no');
const celda = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

export interface DatosInforme {
  modo: 'real' | 'seco';
  escenario?: string;
  fechaHora: string;
  ajustes: Ajustes;
  precios: Precios;
  resumenes: ResumenConfiguracion[];
  detenida: string | null;
  gastoEstimadoUsd: number;
}

export function informeMarkdown(d: DatosInforme): string {
  const l: string[] = [];
  const elegida = elegir(d.resumenes);
  l.push(`# Medición de la IA de Umbral (modo autor)`);
  l.push('');
  if (d.modo === 'seco') {
    l.push(
      `> **Modo en seco (escenario «${d.escenario}»).** Respuestas simuladas: este informe prueba la puntuación y el informe, **no mide ningún modelo**.`,
    );
    l.push('');
  }
  l.push(`- Fecha y hora: ${d.fechaHora} (Europe/Madrid)`);
  l.push(`- Versión del prompt: \`${VERSION_PROMPT}\``);
  l.push(`- Fecha de referencia: ${d.ajustes.fechaReferencia} (${d.ajustes.zonaHoraria})`);
  l.push(
    `- Ajustes: max_tokens ${d.ajustes.maxTokens}; espera máxima ${seg(d.ajustes.esperaMaximaMs)} por llamada, reintentos incluidos; reintentos del SDK ${d.ajustes.reintentos}; ${d.ajustes.ejecucionesPorCaso} ejecuciones por caso; sin streaming`,
  );
  l.push(
    '- Alcance: cada llamada pide la salida completa del modo autor (campos, preguntas, título y coherencia, 7.5). **Solo se puntúan los campos; los tokens, el tiempo y el coste son los de la llamada completa del modo autor**, que es lo que mide la condición (3).',
  );
  l.push(`- Precios: ${d.precios.fuente}, consultados el ${d.precios.fechaConsulta}`);
  l.push(`- Gasto estimado total: ${usd(d.gastoEstimadoUsd)} (límite del script: ${d.ajustes.limiteGastoUsd} USD)`);
  if (d.detenida) l.push(`- **Medición incompleta.** ${d.detenida}`);
  l.push('');
  l.push('## Resumen');
  l.push('');
  l.push(
    'Criterio (12.2): (1) cero invenciones en CIFRA y FECHA_ABSOLUTA; (2) al menos un 70 % de aciertos; (3) ninguna llamada por encima de 60 s y coste medio por llamada de 0,05 USD como máximo. Una configuración incompleta no cumple.',
  );
  l.push('');
  l.push('| Configuración | Modelo | Esfuerzo | Llamadas | Aciertos | Invenciones | Inválidas | T. máx. | T. medio | Coste medio | (1) | (2) | (3) | Cumple |');
  l.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of d.resumenes) {
    l.push(
      `| ${r.cfg.id} | \`${r.cfg.modelo}\` | ${r.cfg.esfuerzo} | ${r.llamadas}/${r.llamadasPrevistas} | ${pct(r.porcentaje)} | ${r.invenciones.length} | ${r.invalidas.length} | ${seg(r.tiempoMaximoMs)} | ${seg(r.tiempoMedioMs)} | ${usd(r.costeMedioUsd)} | ${sn(r.condicion1)} | ${sn(r.condicion2)} | ${sn(r.condicion3)} | **${sn(r.cumple)}** |`,
    );
  }
  l.push('');
  l.push('## Decisión');
  l.push('');
  l.push(
    elegida
      ? `Configuración elegida: **${elegida.cfg.id}** (\`${elegida.cfg.modelo}\`, esfuerzo ${elegida.cfg.esfuerzo}), la más barata de las que cumplen, con un coste medio de ${usd(elegida.costeMedioUsd)} por llamada.`
      : '**Ninguna cumple.**',
  );
  l.push('');
  l.push('## Detalle por configuración');
  for (const r of d.resumenes) {
    l.push('');
    l.push(`### ${r.cfg.id}`);
    l.push('');
    l.push(`- Llamadas: ${r.llamadas} de ${r.llamadasPrevistas}${r.completa ? '' : ' (incompleta)'}`);
    l.push(`- Aciertos: ${r.aciertos} de ${r.campos} campos (${pct(r.porcentaje)})`);
    l.push(`- Tiempo: máximo ${seg(r.tiempoMaximoMs)}, medio ${seg(r.tiempoMedioMs)}`);
    l.push(
      `- Coste: medio ${usd(r.costeMedioUsd)} por llamada, total ${usd(r.costeTotalUsd)}` +
        (r.llamadasSinCoste ? ` (llamadas sin tokens, no incluidas: ${r.llamadasSinCoste})` : ''),
    );
    if (r.tokensEntradaMedios !== null) {
      l.push(`- Tokens medios: ${Math.round(r.tokensEntradaMedios)} de entrada, ${Math.round(r.tokensSalidaMedios!)} de salida`);
    }
    if (r.hayTokensCache) l.push('- Aviso: hubo tokens de caché; el coste calculado no los incluye.');
    l.push(`- Condiciones: (1) ${sn(r.condicion1)}, (2) ${sn(r.condicion2)}, (3) ${sn(r.condicion3)}; criterio completo: **${sn(r.cumple)}**`);
    l.push('');
    l.push(`Invenciones (CIFRA y FECHA_ABSOLUTA): ${r.invenciones.length === 0 ? 'ninguna.' : ''}`);
    for (const i of r.invenciones) l.push(`- ${i.caso}, ejecución ${i.ejecucion}, \`${i.campo}\`: «${celda(i.valor)}»`);
    l.push('');
    l.push(`Respuestas inválidas: ${r.invalidas.length === 0 ? 'ninguna.' : ''}`);
    for (const i of r.invalidas) l.push(`- ${i.caso}, ejecución ${i.ejecucion}: ${i.motivo}. ${celda(i.detalle)}`);
    l.push('');
    l.push(
      `Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): ${r.valoresSinEsperado.length === 0 ? 'ninguno.' : ''}`,
    );
    for (const i of r.valoresSinEsperado) l.push(`- ${i.caso}, ejecución ${i.ejecucion}, \`${i.campo}\`: «${celda(i.valor)}»`);
    const fallos = Object.entries(r.fallosPorCampo).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    l.push('');
    l.push(`Fallos por campo (en ${d.ajustes.ejecucionesPorCaso} ejecuciones): ${fallos.length === 0 ? 'ninguno.' : ''}`);
    if (fallos.length) l.push(fallos.map(([k, n]) => `\`${k}\` ${n}`).join(' · '));
  }
  l.push('');
  l.push('## Limitaciones');
  l.push('');
  l.push('- Con 6 casos, un solo campo mueve varios puntos del porcentaje; sirve para decidir en este MVP, no como garantía de calidad (12.2).');
  l.push('- En TEXTO, CIFRA y ENLACE la métrica comprueba la forma, no el contenido: una cifra puesta en el campo equivocado cuenta como acierto si el campo esperaba una cifra.');
  l.push('- La salida del modelo puede variar entre ejecuciones; el resultado no es un criterio de aprobado.');
  l.push('- El coste es el de la llamada completa del modo autor (campos, preguntas, título y coherencia), con los tokens de entrada y salida de cada llamada y los precios de precios.json; las llamadas sin tokens (tiempo agotado o error) no entran en la media.');
  l.push('- Las preguntas, el título y la coherencia no se puntúan; quedan en llamadas.json («otrasSalidas») para revisarlos a mano.');
  return l.join('\n') + '\n';
}
