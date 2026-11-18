// Esquema de salida completo del modo autor (docs/producto.md 7.5), generado desde las definiciones:
// campos, preguntas, título y coherencia. La medición solo puntúa los campos.

import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { DefinicionRegla } from './tipos.ts';

/** Longitudes máximas (6.9 y 6.4); se comprueban al validar, no van en el esquema (7.5). */
export const LONGITUD_MAXIMA = 2000;
export const LONGITUD_MAXIMA_TITULO = 120;

/**
 * { campos?, preguntas?, titulo?, coherencia? }, con todas las propiedades opcionales salvo
 * coherencia.hayContradiccion, y todos los objetos estrictos (additionalProperties: false).
 * OPCION es una enumeración con los valores de la definición.
 */
export function esquemaSalidaAutor(defs: DefinicionRegla[]) {
  const forma: Record<string, z.ZodType> = {};
  for (const d of defs) {
    forma[d.campoClave] =
      d.comprobacion === 'OPCION'
        ? z.enum(d.opciones as [string, ...string[]]).optional()
        : z.string().optional();
  }
  return z.strictObject({
    campos: z.strictObject(forma).optional(),
    preguntas: z.array(z.string()).optional(),
    titulo: z.string().optional(),
    coherencia: z
      .strictObject({ hayContradiccion: z.boolean(), explicacion: z.string().optional() })
      .optional(),
  });
}

export type EsquemaSalidaAutor = ReturnType<typeof esquemaSalidaAutor>;

/** Formato de salida estructurada que se envía a la API (JSON Schema generado por el SDK). */
export function formatoSalida(esquema: EsquemaSalidaAutor): {
  type: 'json_schema';
  schema: Record<string, unknown>;
} {
  return { type: 'json_schema', schema: zodOutputFormat(esquema).schema };
}

/** Lo que no se puntúa pero se guarda en llamadas.json. */
export interface OtrasSalidas {
  preguntas?: string[];
  titulo?: string;
  coherencia?: { hayContradiccion: boolean; explicacion?: string };
}

export type Validacion =
  | { ok: true; campos: Record<string, string>; otras: OtrasSalidas }
  | { ok: false; detalle: string };

const largo = (s: string) => [...s.trim()].length;

/**
 * Valida la respuesta como lo haría el backend: JSON, esquema estricto (clave desconocida, tipo
 * erróneo u opción fuera de lista invalidan todo) y longitudes máximas. Devuelve los campos
 * recortados; una cadena vacía o solo con espacios equivale a campo sin rellenar.
 */
export function validarRespuesta(texto: string, esquema: EsquemaSalidaAutor): Validacion {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch (e) {
    return { ok: false, detalle: `JSON no válido: ${(e as Error).message}` };
  }
  const r = esquema.safeParse(datos);
  if (!r.success) {
    const problemas = r.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('; ');
    return { ok: false, detalle: `No cumple el esquema: ${problemas}` };
  }
  const campos: Record<string, string> = {};
  for (const [clave, valor] of Object.entries((r.data.campos ?? {}) as Record<string, string>)) {
    if (largo(valor) > LONGITUD_MAXIMA) {
      return { ok: false, detalle: `El campo ${clave} supera ${LONGITUD_MAXIMA} caracteres` };
    }
    if (valor.trim() !== '') campos[clave] = valor.trim();
  }
  const { preguntas, titulo, coherencia } = r.data;
  if (titulo !== undefined && largo(titulo) > LONGITUD_MAXIMA_TITULO) {
    return { ok: false, detalle: `El título supera ${LONGITUD_MAXIMA_TITULO} caracteres` };
  }
  if (preguntas?.some((p) => largo(p) > LONGITUD_MAXIMA)) {
    return { ok: false, detalle: `Una pregunta supera ${LONGITUD_MAXIMA} caracteres` };
  }
  if (coherencia?.explicacion !== undefined && largo(coherencia.explicacion) > LONGITUD_MAXIMA) {
    return { ok: false, detalle: `La explicación de coherencia supera ${LONGITUD_MAXIMA} caracteres` };
  }
  const otras: OtrasSalidas = {};
  if (preguntas !== undefined) otras.preguntas = preguntas;
  if (titulo !== undefined) otras.titulo = titulo;
  if (coherencia !== undefined) otras.coherencia = coherencia;
  return { ok: true, campos, otras };
}
