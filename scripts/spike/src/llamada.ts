// Llamada al modelo: real (API de Anthropic) o simulada (modo en seco).

import Anthropic from '@anthropic-ai/sdk';
import type { Ajustes, Caso, Configuracion, Precio, ResultadoLlamada } from './tipos.ts';

/** Error que hace parar la medición entera (clave, permisos, modelo o petición mal formada). */
export class ErrorFatal extends Error {}

const ESTADOS_FATALES = new Set([400, 401, 402, 403, 404]);

/** Cliente que solo usa ANTHROPIC_API_KEY (no perfiles ni otros tokens del entorno). */
export function crearCliente(ajustes: Ajustes): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new ErrorFatal(
      'Falta la variable de entorno ANTHROPIC_API_KEY. Defínela en tu shell antes de ejecutar (ver README.md).',
    );
  }
  return new Anthropic({
    apiKey,
    authToken: null,
    timeout: ajustes.esperaMaximaMs,
    maxRetries: ajustes.reintentos,
  });
}

/**
 * Una llamada completa en modo autor (campos, preguntas, título y coherencia), sin streaming. La espera máxima es total, reintentos incluidos:
 * un AbortController corta la llamada al llegar a esperaMaximaMs, aunque el SDK esté reintentando.
 * Sin `thinking` (los tres modelos propuestos usan razonamiento adaptativo por defecto) y sin
 * `fallbacks`: un rechazo debe contarse como rechazo, no resolverse con otro modelo.
 */
export async function llamarReal(
  cliente: Anthropic,
  cfg: Configuracion,
  ajustes: Ajustes,
  sistema: string,
  mensaje: string,
  formato: { type: 'json_schema'; schema: Record<string, unknown> },
): Promise<ResultadoLlamada> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), ajustes.esperaMaximaMs);
  const inicio = performance.now();
  const base = {
    textoRespuesta: null,
    stopReason: null,
    tokensEntrada: null,
    tokensSalida: null,
    tokensCacheEscritura: null,
    tokensCacheLectura: null,
  };
  try {
    const r = await cliente.messages.create(
      {
        model: cfg.modelo,
        max_tokens: ajustes.maxTokens,
        system: sistema,
        messages: [{ role: 'user', content: mensaje }],
        output_config: { effort: cfg.esfuerzo, format: formato },
      },
      { signal: controlador.signal, timeout: ajustes.esperaMaximaMs, maxRetries: ajustes.reintentos },
    );
    const tiempoMs = performance.now() - inicio;
    const texto = r.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const resultado: ResultadoLlamada = {
      textoRespuesta: texto,
      stopReason: r.stop_reason,
      tokensEntrada: r.usage.input_tokens,
      tokensSalida: r.usage.output_tokens,
      tokensCacheEscritura: r.usage.cache_creation_input_tokens ?? null,
      tokensCacheLectura: r.usage.cache_read_input_tokens ?? null,
      tiempoMs,
      fallo: null,
    };
    if (r.stop_reason === 'refusal') {
      resultado.fallo = {
        motivo: 'RECHAZO',
        detalle: `stop_reason refusal${r.stop_details ? `: ${JSON.stringify(r.stop_details)}` : ''}`,
      };
    } else if (r.stop_reason === 'max_tokens') {
      resultado.fallo = { motivo: 'TRUNCADA', detalle: `Se alcanzó max_tokens (${ajustes.maxTokens})` };
    }
    return resultado;
  } catch (e) {
    const tiempoMs = performance.now() - inicio;
    if (e instanceof Anthropic.APIUserAbortError || e instanceof Anthropic.APIConnectionTimeoutError) {
      return { ...base, tiempoMs, fallo: { motivo: 'TIEMPO_AGOTADO', detalle: 'Sin respuesta en el tiempo máximo' } };
    }
    if (e instanceof Anthropic.APIConnectionError) {
      return { ...base, tiempoMs, fallo: { motivo: 'ERROR', detalle: `Fallo de conexión: ${e.message}` } };
    }
    if (e instanceof Anthropic.APIError) {
      if (e.status !== undefined && ESTADOS_FATALES.has(e.status)) {
        throw new ErrorFatal(`La API respondió ${e.status} (${e.type ?? 'sin tipo'}): ${e.message}`);
      }
      return { ...base, tiempoMs, fallo: { motivo: 'ERROR', detalle: `API ${e.status ?? '?'}: ${e.message}` } };
    }
    return { ...base, tiempoMs, fallo: { motivo: 'ERROR', detalle: String(e) } };
  } finally {
    clearTimeout(temporizador);
  }
}

// ---------------------------------------------------------------------------------------------
// Modo en seco

export const ESCENARIOS = ['esperado', 'invencion-c4', 'fallos'] as const;
export type Escenario = (typeof ESCENARIOS)[number];

/**
 * Respuestas simuladas, deterministas, para probar validación, puntuación e informe sin gastar.
 * - esperado: cada respuesta trae exactamente los valores esperados.
 * - invencion-c4: igual, pero la ejecución 1 de C4 inventa valor_actual (CIFRA).
 * - fallos: E1 ej. 1 inventa fecha_inicio a partir de «anteayer»; C3 ej. 2 agota el tiempo;
 *   E2 ej. 3 devuelve una clave desconocida; C6 ej. 1 es un rechazo.
 */
export function llamarSimulada(
  escenario: Escenario,
  caso: Caso,
  ejecucion: number,
  ajustes: Ajustes,
  sistema: string,
  mensaje: string,
): ResultadoLlamada {
  const campos: Record<string, string> = Object.fromEntries(
    Object.entries(caso.esperado).filter(([, v]) => v !== ''),
  );
  const tokensEntrada = Math.ceil((sistema.length + mensaje.length) / 3);
  const tiempoMs = 1000 + 100 * ejecucion;
  const ok = (cuerpo: unknown, stopReason = 'end_turn'): ResultadoLlamada => {
    const texto = JSON.stringify(cuerpo);
    return {
      textoRespuesta: texto,
      stopReason,
      tokensEntrada,
      tokensSalida: 300 + Math.ceil(texto.length / 3),
      tokensCacheEscritura: 0,
      tokensCacheLectura: 0,
      tiempoMs,
      fallo: null,
    };
  };

  // Salida completa del modo autor: campos, preguntas, título y coherencia.
  const completa = (c: Record<string, string>) => ({
    campos: c,
    preguntas: ['¿Desde cuándo ocurre exactamente?'],
    titulo: caso.titulo,
    coherencia: { hayContradiccion: false },
  });

  if (escenario === 'invencion-c4' && caso.id === 'C4' && ejecucion === 1) {
    return ok(completa({ ...campos, valor_actual: '12 %' }));
  }
  if (escenario === 'fallos') {
    if (caso.id === 'E1' && ejecucion === 1) return ok(completa({ ...campos, fecha_inicio: '2026-11-16' }));
    if (caso.id === 'C3' && ejecucion === 2) {
      return {
        textoRespuesta: null,
        stopReason: null,
        tokensEntrada: null,
        tokensSalida: null,
        tokensCacheEscritura: null,
        tokensCacheLectura: null,
        tiempoMs: ajustes.esperaMaximaMs + 1,
        fallo: { motivo: 'TIEMPO_AGOTADO', detalle: 'Simulado' },
      };
    }
    if (caso.id === 'E2' && ejecucion === 3) return ok(completa({ ...campos, prioridad: 'alta' }));
    if (caso.id === 'C6' && ejecucion === 1) {
      const r = ok({}, 'refusal');
      r.fallo = { motivo: 'RECHAZO', detalle: 'Simulado' };
      return r;
    }
  }
  return ok(completa(campos));
}

// ---------------------------------------------------------------------------------------------
// Coste

/** Coste en USD con los precios por millón de tokens; aplica el tramo largo si existe. */
export function costeUsd(precio: Precio, tokensEntrada: number, tokensSalida: number): number {
  const tramo =
    precio.umbralLargo && tokensEntrada > precio.umbralLargo.tokensEntrada ? precio.umbralLargo : precio;
  return (tokensEntrada * tramo.entrada + tokensSalida * tramo.salida) / 1_000_000;
}
