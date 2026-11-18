// Script desechable de medición de la IA de Umbral (rama spike/medicion-ia).
// Uso: ver README.md. No es código de la aplicación.
//
//   tsx medir.ts --seco [--escenario esperado|invencion-c4|fallos] [--solo id1,id2]
//   tsx medir.ts --real [--solo id1,id2]     (llamadas reales; solo configuraciones aprobadas)
//   tsx medir.ts --modelos                   (lista los modelos disponibles con la clave)

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { cargarAjustes, cargarCasos, cargarCatalogo, cargarPrecios, RAIZ } from './src/datos.ts';
import {
  ejecutar,
  entradaEstimada,
  esquemasPorTipo,
  peorCasoLlamadaUsd,
  prepararEntradas,
} from './src/ejecucion.ts';
import { informeMarkdown, resumir } from './src/informe.ts';
import { crearCliente, ErrorFatal, ESCENARIOS, type Escenario } from './src/llamada.ts';
import { INSTRUCCIONES_SISTEMA, VERSION_PROMPT } from './src/prompt.ts';
import type { RegistroLlamada } from './src/tipos.ts';

function argumento(nombre: string): string | undefined {
  const i = process.argv.indexOf(nombre);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function fechaHoraMadrid(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
}

async function listarModelos(): Promise<void> {
  const cliente = crearCliente(cargarAjustes());
  console.log('Modelos disponibles con esta clave (API de modelos):\n');
  for await (const m of cliente.models.list()) {
    const e = m.capabilities?.effort;
    const niveles = e?.supported
      ? (['low', 'medium', 'high', 'xhigh', 'max'] as const).filter((n) => e[n]?.supported).join(', ')
      : 'sin esfuerzo';
    const so = m.capabilities?.structured_outputs?.supported ? 'sí' : 'no';
    console.log(`- ${m.id} (${m.display_name}); esfuerzo: ${niveles}; salida estructurada: ${so}`);
  }
}

async function main(): Promise<void> {
  const modoSeco = process.argv.includes('--seco');
  const modoReal = process.argv.includes('--real');
  if (process.argv.includes('--modelos')) return listarModelos();
  if (modoSeco === modoReal) {
    console.error('Indica un modo: --seco (simulado, sin gasto), --real (llamadas reales) o --modelos.');
    process.exit(2);
  }

  const ajustes = cargarAjustes();
  const catalogo = cargarCatalogo();
  const casos = cargarCasos(catalogo, ajustes.fechaReferencia);
  const precios = cargarPrecios();

  const escenario = (argumento('--escenario') ?? 'esperado') as Escenario;
  if (modoSeco && !ESCENARIOS.includes(escenario)) {
    console.error(`Escenario desconocido: ${escenario}. Opciones: ${ESCENARIOS.join(', ')}`);
    process.exit(2);
  }

  let configuraciones = ajustes.configuraciones;
  const solo = argumento('--solo')?.split(',').map((s) => s.trim());
  if (solo) {
    const desconocidas = solo.filter((id) => !configuraciones.some((c) => c.id === id));
    if (desconocidas.length) {
      console.error(`Configuraciones desconocidas: ${desconocidas.join(', ')}`);
      process.exit(2);
    }
    configuraciones = configuraciones.filter((c) => solo.includes(c.id));
  }
  if (modoReal) {
    const sinAprobar = configuraciones.filter((c) => !c.aprobada);
    if (solo && sinAprobar.length) {
      console.error(`Sin aprobar en configuraciones.json: ${sinAprobar.map((c) => c.id).join(', ')}`);
      process.exit(2);
    }
    configuraciones = configuraciones.filter((c) => c.aprobada);
    if (configuraciones.length === 0) {
      console.error('No hay configuraciones aprobadas en configuraciones.json («aprobada»: true). No se llama a la API.');
      process.exit(2);
    }
  }

  // Sin clave, el modo real termina aquí, antes de crear nada.
  const cliente = modoReal ? crearCliente(ajustes) : undefined;

  // Previsión antes de empezar.
  const entradas = prepararEntradas(casos, catalogo, ajustes);
  const llamadas = configuraciones.length * casos.length * ajustes.ejecucionesPorCaso;
  const peorTotal = configuraciones.reduce(
    (suma, cfg) =>
      suma +
      entradas.reduce(
        (s, e) => s + ajustes.ejecucionesPorCaso * peorCasoLlamadaUsd(precios, cfg, entradaEstimada(e.mensaje), ajustes),
        0,
      ),
    0,
  );
  console.log(`Modo ${modoReal ? 'REAL (llamadas a la API, con gasto)' : `en seco (escenario «${escenario}»)`}`);
  console.log(`Configuraciones: ${configuraciones.map((c) => c.id).join(', ')}`);
  console.log(
    `Llamadas previstas: ${llamadas}. Peor caso teórico (todas las salidas en max_tokens): ${peorTotal.toFixed(2)} USD; ` +
      `el script para antes de superar ${ajustes.limiteGastoUsd} USD estimados.\n`,
  );

  // Carpeta de resultados.
  const fechaHora = fechaHoraMadrid();
  const carpeta = path.join(
    RAIZ,
    'resultados',
    `${modoSeco ? 'seco-' : ''}${fechaHora.replace(' ', '_').replace(/:/g, '-')}`,
  );
  mkdirSync(carpeta, { recursive: true });
  const esquemas = esquemasPorTipo(catalogo);
  writeFileSync(
    path.join(carpeta, 'entrada.json'),
    JSON.stringify(
      {
        modo: modoReal ? 'real' : 'seco',
        escenario: modoSeco ? escenario : undefined,
        versionPrompt: VERSION_PROMPT,
        instruccionesSistema: INSTRUCCIONES_SISTEMA,
        ajustes: { ...ajustes, configuraciones },
        precios,
        esquemas: { INCIDENCIA: esquemas.INCIDENCIA.formato, CAMBIO: esquemas.CAMBIO.formato },
        mensajes: Object.fromEntries(entradas.map((e) => [e.caso.id, { reglasNoCumplidas: e.reglasNoCumplidas, mensaje: e.mensaje }])),
      },
      null,
      2,
    ),
  );
  const rutaLlamadas = path.join(carpeta, 'llamadas.json');
  const acumuladas: RegistroLlamada[] = [];
  const guardar = () => writeFileSync(rutaLlamadas, JSON.stringify(acumuladas, null, 2));

  let resultado;
  let errorFatal: string | null = null;
  try {
    resultado = await ejecutar({
      modo: modoReal ? 'real' : 'seco',
      escenario,
      cliente,
      configuraciones,
      casos,
      catalogo,
      ajustes,
      precios,
      alRegistrar: (r) => {
        acumuladas.push(r);
        guardar(); // se guarda tras cada llamada, por si el script se corta
      },
      avisar: (m) => console.log(m),
    });
  } catch (e) {
    if (!(e instanceof ErrorFatal)) throw e;
    errorFatal = e.message;
    resultado = { registros: acumuladas, detenida: `Error que impide seguir: ${e.message}`, gastoEstimadoUsd: NaN };
  }
  guardar();

  const resumenes = resumir(configuraciones, resultado.registros, casos, ajustes);
  const informe = informeMarkdown({
    modo: modoReal ? 'real' : 'seco',
    escenario,
    fechaHora,
    ajustes,
    precios,
    resumenes,
    detenida: resultado.detenida,
    gastoEstimadoUsd: resultado.gastoEstimadoUsd,
  });
  writeFileSync(path.join(carpeta, 'informe.md'), informe);

  console.log('');
  if (resultado.detenida) console.log(resultado.detenida);
  for (const r of resumenes) {
    console.log(
      `${r.cfg.id}: aciertos ${(r.porcentaje * 100).toFixed(1)} %, invenciones ${r.invenciones.length}, ` +
        `inválidas ${r.invalidas.length}, cumple: ${r.cumple ? 'sí' : 'no'}`,
    );
  }
  console.log(`\nResultados en ${path.relative(process.cwd(), carpeta) || carpeta}`);
  if (errorFatal) process.exit(1);
}

main().catch((e) => {
  if (e instanceof ErrorFatal) {
    console.error(e.message);
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
});
