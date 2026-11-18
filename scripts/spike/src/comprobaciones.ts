// Comprobaciones de docs/producto.md 6.5, con los valores iniciales de 6.9.

import type { DefinicionRegla } from './tipos.ts';

const MIN_CARACTERES_POR_DEFECTO = 10;
const VALORES_RELLENO = ['n/a', 'na', '-', '.', '?', 'tbd', 'xxx', 'pendiente'];

/** Minúsculas y sin acentos, para comparar con listas. */
export function normalizar(valor: string): string {
  return valor.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function cumpleTexto(valor: string, minCaracteres = MIN_CARACTERES_POR_DEFECTO): boolean {
  const recortado = valor.trim();
  return [...recortado].length >= minCaracteres && !VALORES_RELLENO.includes(normalizar(recortado));
}

/** Al menos un número escrito con dígitos (entero o decimal, con o sin %). */
export function cumpleCifra(valor: string): boolean {
  return /\d/.test(valor);
}

export function esFechaValida(valor: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
  );
}

/** Fecha válida AAAA-MM-DD; con noFutura, no posterior a la fecha de referencia (AAAA-MM-DD). */
export function cumpleFecha(valor: string, fechaReferencia: string, noFutura: boolean): boolean {
  const v = valor.trim();
  if (!esFechaValida(v)) return false;
  return !noFutura || v <= fechaReferencia;
}

export function cumpleEnlace(valor: string): boolean {
  try {
    const url = new URL(valor.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function cumpleOpcion(valor: string, opciones: string[]): boolean {
  return opciones.includes(valor.trim());
}

/** ¿El valor cumple la comprobación de la regla? Un valor vacío nunca cumple. */
export function cumple(def: DefinicionRegla, valor: string, fechaReferencia: string): boolean {
  if (valor.trim() === '') return false;
  switch (def.comprobacion) {
    case 'TEXTO':
      return cumpleTexto(valor, def.minCaracteres);
    case 'CIFRA':
      return cumpleCifra(valor);
    case 'FECHA_ABSOLUTA':
      return cumpleFecha(valor, fechaReferencia, def.noFutura ?? false);
    case 'ENLACE':
      return cumpleEnlace(valor);
    case 'OPCION':
      return cumpleOpcion(valor, def.opciones ?? []);
  }
}

export type ResultadoRegla = 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA';

/** Resultado de una regla con unos valores (aplicabilidad de 6.5). */
export function evaluarRegla(
  def: DefinicionRegla,
  valores: Record<string, string>,
  fechaReferencia: string,
): ResultadoRegla {
  if (def.aplicaSi) {
    const valorCondicion = (valores[def.aplicaSi.campo] ?? '').trim();
    if (valorCondicion !== def.aplicaSi.valor) return 'NO_APLICA';
  }
  return cumple(def, valores[def.campoClave] ?? '', fechaReferencia) ? 'CUMPLE' : 'NO_CUMPLE';
}
