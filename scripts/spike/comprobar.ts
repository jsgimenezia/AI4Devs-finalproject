// Comprobaciones del propio script en modo en seco, sin llamadas a la API ni gasto.
// Uso: npm run comprobar. Termina con código 1 si alguna falla.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cumpleCifra, cumpleEnlace, cumpleFecha, cumpleTexto, evaluarRegla } from './src/comprobaciones.ts';
import { cargarAjustes, cargarCasos, cargarCatalogo, cargarPrecios, definicionesDe, RAIZ } from './src/datos.ts';
import { ejecutar, esquemasPorTipo, prepararEntradas } from './src/ejecucion.ts';
import { validarRespuesta } from './src/esquema.ts';
import { elegir, resumir } from './src/informe.ts';
import type { Escenario } from './src/llamada.ts';

let fallos = 0;
async function prueba(nombre: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`ok   ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`FALLO ${nombre}\n     ${(e as Error).message.split('\n').join('\n     ')}`);
  }
}

const ajustes = cargarAjustes();
const catalogo = cargarCatalogo();
const casos = cargarCasos(catalogo, ajustes.fechaReferencia);
const precios = cargarPrecios();
const configuraciones = ajustes.configuraciones;
const N = ajustes.ejecucionesPorCaso;
const camposPorEjecucion = casos.reduce((s, c) => s + definicionesDe(catalogo, c.tipo).length, 0);
const camposTotales = camposPorEjecucion * N;

async function medirSeco(escenario: Escenario) {
  const r = await ejecutar({ modo: 'seco', escenario, configuraciones, casos, catalogo, ajustes, precios });
  return { ...r, resumenes: resumir(configuraciones, r.registros, casos, ajustes) };
}

await prueba('comprobaciones de 6.5', () => {
  assert.equal(cumpleTexto('El buscador'), true);
  assert.equal(cumpleTexto('corto'), false);
  assert.equal(cumpleTexto('pendiente', 3), false);
  assert.equal(cumpleCifra('4,8 s'), true);
  assert.equal(cumpleCifra('unos cuantos'), false);
  assert.equal(cumpleFecha('2026-11-03', '2026-11-18', true), true);
  assert.equal(cumpleFecha('2026-11-19', '2026-11-18', true), false);
  assert.equal(cumpleFecha('2026-02-30', '2026-11-18', false), false);
  assert.equal(cumpleFecha('anteayer', '2026-11-18', false), false);
  assert.equal(cumpleEnlace('https://metricas.example/busqueda-carga'), true);
  assert.equal(cumpleEnlace('ftp://x.example'), false);
  const rc06 = catalogo.find((r) => r.codigo === 'RC-06')!;
  assert.equal(evaluarRegla(rc06, {}, ajustes.fechaReferencia), 'NO_APLICA');
  assert.equal(evaluarRegla(rc06, { tiene_metrica: 'SI' }, ajustes.fechaReferencia), 'NO_CUMPLE');
});

await prueba('entrada: reglas no cumplidas sin las condicionales («no aplica»)', () => {
  const entradas = prepararEntradas(casos, catalogo, ajustes);
  const e2 = entradas.find((e) => e.caso.id === 'E2')!;
  assert.deepEqual(e2.reglasNoCumplidas, ['RC-01', 'RC-02', 'RC-03', 'RC-04', 'RC-05', 'RC-08', 'RC-09', 'RC-11']);
  const e1 = entradas.find((e) => e.caso.id === 'E1')!;
  assert.equal(e1.reglasNoCumplidas.length, 12);
  assert.match(e1.mensaje, /<texto>Desde anteayer/);
});

await prueba('instrucciones: ninguna secuencia de 3 palabras ni fecha de los casos aparece en src/prompt.ts', () => {
  const normalizar = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^\p{L}\p{N}/]+/gu, ' ').trim();
  const archivo = ` ${normalizar(readFileSync(path.join(RAIZ, 'src', 'prompt.ts'), 'utf8'))} `;
  const halladas = new Set<string>();
  for (const c of casos) {
    for (const t of [c.titulo, c.texto]) {
      const palabras = normalizar(t).split(' ');
      for (let i = 0; i + 3 <= palabras.length; i++) {
        const trio = palabras.slice(i, i + 3).join(' ');
        if (archivo.includes(` ${trio} `)) halladas.add(`${c.id}: «${trio}»`);
      }
      for (const fecha of t.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) ?? []) {
        if (archivo.includes(fecha)) halladas.add(`${c.id}: fecha ${fecha}`);
      }
    }
  }
  for (const expresion of ['anteayer', 'semana pasada', '2026-11-03']) {
    if (archivo.includes(normalizar(expresion))) halladas.add(`expresión «${expresion}»`);
  }
  assert.deepEqual([...halladas], []);
});

/** Propiedades fuera de «required» en todo el esquema (límite de la API: 24 por petición). */
function opcionales(s: any): number {
  if (!s || typeof s !== 'object') return 0;
  let n = 0;
  if (s.properties) {
    const requeridas = new Set<string>(s.required ?? []);
    for (const [k, v] of Object.entries(s.properties)) n += (requeridas.has(k) ? 0 : 1) + opcionales(v);
  }
  if (s.items) n += opcionales(s.items);
  return n;
}

await prueba('esquema completo 7.5: campos, preguntas, título y coherencia; additionalProperties false', () => {
  const { INCIDENCIA, CAMBIO } = esquemasPorTipo(catalogo);
  for (const [tipo, numCampos, { formato }] of [['INCIDENCIA', 12, INCIDENCIA], ['CAMBIO', 11, CAMBIO]] as const) {
    const s = formato.schema as any;
    assert.deepEqual(Object.keys(s.properties), ['campos', 'preguntas', 'titulo', 'coherencia'], tipo);
    assert.equal(s.additionalProperties, false);
    assert.ok(!s.required || s.required.length === 0, 'la raíz no debe tener propiedades obligatorias');
    const campos = s.properties.campos;
    assert.equal(campos.additionalProperties, false);
    assert.ok(!campos.required || campos.required.length === 0, 'campos no debe tener propiedades obligatorias');
    assert.equal(Object.keys(campos.properties).length, numCampos);
    assert.deepEqual(s.properties.preguntas, { type: 'array', items: { type: 'string' } });
    assert.deepEqual(s.properties.titulo, { type: 'string' });
    const coh = s.properties.coherencia;
    assert.equal(coh.additionalProperties, false);
    assert.deepEqual(coh.required, ['hayContradiccion']);
    assert.equal(coh.properties.hayContradiccion.type, 'boolean');
    assert.ok(opcionales(s) <= 24, `${tipo}: ${opcionales(s)} propiedades opcionales`);
  }
  assert.deepEqual((INCIDENCIA.formato.schema as any).properties.campos.properties.continua.enum, ['SI', 'NO', 'DESCONOCIDO']);
});

await prueba('validación: clave desconocida, opción fuera de lista y longitud invalidan', () => {
  const { esquema } = esquemasPorTipo(catalogo).INCIDENCIA;
  assert.equal(validarRespuesta('{"campos":{"continua":"SI"}}', esquema).ok, true);
  const completa = validarRespuesta(
    '{"campos":{"continua":"SI"},"preguntas":["¿Qué pantalla?"],"titulo":"Un título","coherencia":{"hayContradiccion":true,"explicacion":"El título habla de otra cosa"}}',
    esquema,
  );
  assert.ok(completa.ok && completa.otras.titulo === 'Un título' && completa.otras.preguntas?.length === 1);
  assert.equal(validarRespuesta('{"coherencia":{}}', esquema).ok, false);
  assert.equal(validarRespuesta('{"coherencia":{"hayContradiccion":false,"motivo":"x"}}', esquema).ok, false);
  assert.equal(validarRespuesta('{"preguntas":"una"}', esquema).ok, false);
  assert.equal(validarRespuesta(`{"titulo":"${'t'.repeat(121)}"}`, esquema).ok, false);
  assert.equal(validarRespuesta('{"campos":{"prioridad":"alta"}}', esquema).ok, false);
  assert.equal(validarRespuesta('{"campos":{"continua":"Si"}}', esquema).ok, false);
  assert.equal(validarRespuesta('{"otro":1}', esquema).ok, false);
  assert.equal(validarRespuesta('{"campos":{"observacion":"' + 'x'.repeat(2001) + '"}}', esquema).ok, false);
  assert.equal(validarRespuesta('no es json', esquema).ok, false);
  const v = validarRespuesta('{"campos":{"observacion":"   ","urgencia":" Alta "}}', esquema);
  assert.ok(v.ok && !('observacion' in v.campos) && v.campos.urgencia === 'Alta');
  assert.deepEqual(validarRespuesta('{}', esquema), { ok: true, campos: {}, otras: {} });
});

await prueba('seco «esperado»: 100 % de aciertos y cero invenciones en cada configuración', async () => {
  const { resumenes, detenida } = await medirSeco('esperado');
  assert.equal(detenida, null);
  for (const r of resumenes) {
    assert.equal(r.campos, camposTotales);
    assert.equal(r.aciertos, camposTotales, `${r.cfg.id}: ${r.aciertos}/${r.campos}`);
    assert.equal(r.porcentaje, 1);
    assert.equal(r.invenciones.length, 0);
    assert.equal(r.invalidas.length, 0);
    assert.equal(r.cumple, true);
  }
  assert.ok(elegir(resumenes) !== null);
  // Las salidas que no se puntúan se guardan en el registro.
  const reg = (await medirSeco('esperado')).registros[0]!;
  assert.equal(reg.otrasSalidas?.titulo, casos[0]!.titulo);
  assert.equal(reg.otrasSalidas?.coherencia?.hayContradiccion, false);
});

await prueba('seco «invencion-c4»: una invención en C4 (valor_actual) por configuración', async () => {
  const { resumenes } = await medirSeco('invencion-c4');
  for (const r of resumenes) {
    assert.deepEqual(r.invenciones, [{ caso: 'C4', ejecucion: 1, campo: 'valor_actual', valor: '12 %' }]);
    assert.equal(r.aciertos, camposTotales - 1);
    assert.equal(r.condicion1, false);
    assert.equal(r.condicion2, true);
    assert.equal(r.cumple, false);
  }
  assert.equal(elegir(resumenes), null);
});

await prueba('seco «fallos»: inválidas, tiempo agotado y fecha relativa inventada', async () => {
  const { resumenes } = await medirSeco('fallos');
  for (const r of resumenes) {
    assert.deepEqual(
      r.invalidas.map((i) => `${i.caso}#${i.ejecucion}:${i.motivo}`).sort(),
      ['C3#2:TIEMPO_AGOTADO', 'C6#1:RECHAZO', 'E2#3:ESQUEMA_INVALIDO'],
    );
    assert.deepEqual(r.invenciones, [{ caso: 'E1', ejecucion: 1, campo: 'fecha_inicio', valor: '2026-11-16' }]);
    // Fallos: 12 (C3) + 11 (E2) + 11 (C6) campos de las inválidas + 1 invención.
    assert.equal(r.aciertos, camposTotales - (12 + 11 + 11 + 1));
    assert.equal(r.llamadasSinCoste, 1);
    assert.equal(r.condicion3, false);
    assert.equal(r.cumple, false);
  }
});

await prueba('protección de gasto: para antes de superar el límite', async () => {
  const r = await ejecutar({
    modo: 'seco',
    escenario: 'esperado',
    configuraciones,
    casos,
    catalogo,
    ajustes: { ...ajustes, limiteGastoUsd: 0.2 },
    precios,
  });
  assert.ok(r.detenida !== null, 'debería detenerse');
  assert.ok(r.gastoEstimadoUsd <= 0.2);
  assert.ok(r.registros.length < configuraciones.length * casos.length * N);
});

console.log(fallos === 0 ? '\nTodas las comprobaciones pasan.' : `\n${fallos} comprobaciones fallan.`);
process.exit(fallos === 0 ? 0 : 1);
