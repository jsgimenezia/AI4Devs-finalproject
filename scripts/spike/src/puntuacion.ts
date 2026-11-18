// Métrica de relleno de docs/producto.md 12.2.

import { cumple } from './comprobaciones.ts';
import type { Caso, DefinicionRegla } from './tipos.ts';

export interface Puntuacion {
  aciertos: Record<string, boolean>;
  invenciones: { campo: string; valor: string }[];
  valoresSinEsperado: { campo: string; valor: string }[];
}

/**
 * - OPCION y FECHA_ABSOLUTA: acierto si coincide exactamente con el esperado.
 * - TEXTO, CIFRA y ENLACE con esperado no vacío: acierto si la propuesta cumple su comprobación.
 * - Esperado vacío: acierto solo si la propuesta también está vacía.
 * - Esperado no vacío y propuesta vacía: fallo.
 * - Invención: esperado vacío en CIFRA o FECHA_ABSOLUTA y la IA propone un valor.
 * - Respuesta inválida o fuera de tiempo (respuesta = null): fallo en todos los campos, sin invenciones.
 */
export function puntuar(
  caso: Caso,
  defs: DefinicionRegla[],
  respuesta: Record<string, string> | null,
  fechaReferencia: string,
): Puntuacion {
  const aciertos: Record<string, boolean> = {};
  const invenciones: Puntuacion['invenciones'] = [];
  const valoresSinEsperado: Puntuacion['valoresSinEsperado'] = [];

  for (const d of defs) {
    const clave = d.campoClave;
    if (respuesta === null) {
      aciertos[clave] = false;
      continue;
    }
    const esperado = (caso.esperado[clave] ?? '').trim();
    const propuesta = (respuesta[clave] ?? '').trim();

    if (esperado === '') {
      aciertos[clave] = propuesta === '';
      if (propuesta !== '') {
        if (d.comprobacion === 'CIFRA' || d.comprobacion === 'FECHA_ABSOLUTA') {
          invenciones.push({ campo: clave, valor: propuesta });
        } else {
          valoresSinEsperado.push({ campo: clave, valor: propuesta });
        }
      }
    } else if (propuesta === '') {
      aciertos[clave] = false;
    } else if (d.comprobacion === 'OPCION' || d.comprobacion === 'FECHA_ABSOLUTA') {
      aciertos[clave] = propuesta === esperado;
    } else {
      aciertos[clave] = cumple(d, propuesta, fechaReferencia);
    }
  }
  return { aciertos, invenciones, valoresSinEsperado };
}
