// Carga y validación de los archivos de datos del script.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cumple, esFechaValida } from './comprobaciones.ts';
import type {
  Ajustes,
  Caso,
  DefinicionRegla,
  Esfuerzo,
  Precios,
  TipoPeticion,
} from './tipos.ts';

/** Directorio scripts/spike/. */
export const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const TIPOS: TipoPeticion[] = ['INCIDENCIA', 'CAMBIO'];
const ESFUERZOS: Esfuerzo[] = ['low', 'medium', 'high', 'xhigh', 'max'];

function leerJson<T>(nombre: string): T {
  return JSON.parse(readFileSync(path.join(RAIZ, nombre), 'utf8')) as T;
}

function fallar(mensaje: string): never {
  throw new Error(mensaje);
}

export function cargarCatalogo(): DefinicionRegla[] {
  const { reglas } = leerJson<{ reglas: DefinicionRegla[] }>('catalogo.json');
  const codigos = new Set<string>();
  const claves = new Set<string>();
  for (const r of reglas) {
    if (!TIPOS.includes(r.tipoPeticion)) fallar(`catalogo.json: tipo desconocido en ${r.codigo}`);
    if (codigos.has(r.codigo)) fallar(`catalogo.json: código repetido ${r.codigo}`);
    codigos.add(r.codigo);
    const clave = `${r.tipoPeticion}|${r.campoClave}`;
    if (claves.has(clave)) fallar(`catalogo.json: clave repetida ${clave}`);
    claves.add(clave);
    if (r.comprobacion === 'OPCION' && !(r.opciones && r.opciones.length > 0)) {
      fallar(`catalogo.json: ${r.codigo} es OPCION sin opciones`);
    }
  }
  return reglas;
}

export function definicionesDe(catalogo: DefinicionRegla[], tipo: TipoPeticion): DefinicionRegla[] {
  return catalogo.filter((r) => r.tipoPeticion === tipo);
}

/**
 * Carga los casos y comprueba que cada valor esperado no vacío cumple su propia comprobación,
 * para que un error en los datos no se confunda con un fallo de la IA.
 */
export function cargarCasos(catalogo: DefinicionRegla[], fechaReferencia: string): Caso[] {
  const { casos } = leerJson<{ casos: Caso[] }>('casos.json');
  const ids = new Set<string>();
  for (const c of casos) {
    if (ids.has(c.id)) fallar(`casos.json: id repetido ${c.id}`);
    ids.add(c.id);
    if (!TIPOS.includes(c.tipo)) fallar(`casos.json: tipo desconocido en ${c.id}`);
    if (!c.titulo.trim() || !c.texto.trim()) fallar(`casos.json: ${c.id} sin título o sin texto`);
    const defs = definicionesDe(catalogo, c.tipo);
    const clavesTipo = new Set(defs.map((d) => d.campoClave));
    for (const clave of Object.keys(c.esperado)) {
      if (!clavesTipo.has(clave)) fallar(`casos.json: ${c.id} tiene una clave desconocida: ${clave}`);
    }
    for (const d of defs) {
      const valor = (c.esperado[d.campoClave] ?? '').trim();
      c.esperado[d.campoClave] = valor;
      if (valor !== '' && !cumple(d, valor, fechaReferencia)) {
        fallar(`casos.json: el esperado de ${c.id}.${d.campoClave} no cumple su comprobación ${d.comprobacion}`);
      }
    }
  }
  return casos;
}

export function cargarAjustes(): Ajustes {
  const a = leerJson<Ajustes>('configuraciones.json');
  if (!(a.maxTokens > 0)) fallar('configuraciones.json: maxTokens debe ser positivo');
  if (!(a.esperaMaximaMs > 0)) fallar('configuraciones.json: esperaMaximaMs debe ser positivo');
  if (a.reintentos !== 0 && a.reintentos !== 1) fallar('configuraciones.json: reintentos debe ser 0 o 1');
  if (!(a.ejecucionesPorCaso >= 1)) fallar('configuraciones.json: ejecucionesPorCaso debe ser al menos 1');
  if (!(a.limiteGastoUsd > 0)) fallar('configuraciones.json: limiteGastoUsd debe ser positivo');
  if (!esFechaValida(a.fechaReferencia)) fallar('configuraciones.json: fechaReferencia no es AAAA-MM-DD');
  const ids = new Set<string>();
  for (const c of a.configuraciones) {
    if (ids.has(c.id)) fallar(`configuraciones.json: id repetido ${c.id}`);
    ids.add(c.id);
    if (!ESFUERZOS.includes(c.esfuerzo)) fallar(`configuraciones.json: esfuerzo desconocido en ${c.id}`);
    if (typeof c.aprobada !== 'boolean') fallar(`configuraciones.json: falta «aprobada» en ${c.id}`);
  }
  return a;
}

export function cargarPrecios(): Precios {
  return leerJson<Precios>('precios.json');
}
