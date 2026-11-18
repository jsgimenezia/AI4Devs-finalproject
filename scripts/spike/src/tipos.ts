// Tipos del script de medición. Desechable: no es código de la aplicación.

export type TipoPeticion = 'INCIDENCIA' | 'CAMBIO';
export type Comprobacion = 'TEXTO' | 'CIFRA' | 'FECHA_ABSOLUTA' | 'ENLACE' | 'OPCION';
export type Esfuerzo = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface DefinicionRegla {
  codigo: string;
  tipoPeticion: TipoPeticion;
  campoClave: string;
  etiqueta: string;
  comprobacion: Comprobacion;
  opciones?: string[];
  aplicaSi?: { campo: string; valor: string };
  noFutura?: boolean;
  minCaracteres?: number;
  severidad: 'OBLIGATORIA' | 'RECOMENDADA';
}

export interface Caso {
  id: string;
  tipo: TipoPeticion;
  titulo: string;
  texto: string;
  esperado: Record<string, string>;
}

export interface Configuracion {
  id: string;
  modelo: string;
  esfuerzo: Esfuerzo;
  aprobada: boolean;
}

export interface Ajustes {
  maxTokens: number;
  esperaMaximaMs: number;
  reintentos: 0 | 1;
  ejecucionesPorCaso: number;
  limiteGastoUsd: number;
  fechaReferencia: string;
  zonaHoraria: string;
  configuraciones: Configuracion[];
}

export interface Precio {
  entrada: number;
  salida: number;
  umbralLargo?: { tokensEntrada: number; entrada: number; salida: number };
}

export interface Precios {
  fuente: string;
  fechaConsulta: string;
  moneda: string;
  unidad: string;
  modelos: Record<string, Precio>;
}

export type MotivoInvalida =
  | 'RECHAZO'
  | 'TRUNCADA'
  | 'ESQUEMA_INVALIDO'
  | 'TIEMPO_AGOTADO'
  | 'ERROR';

/** Lo que devuelve una llamada (real o simulada) antes de validar y puntuar. */
export interface ResultadoLlamada {
  textoRespuesta: string | null;
  stopReason: string | null;
  tokensEntrada: number | null;
  tokensSalida: number | null;
  tokensCacheEscritura: number | null;
  tokensCacheLectura: number | null;
  tiempoMs: number;
  fallo: { motivo: MotivoInvalida; detalle: string } | null;
}

/** Una fila de llamadas.json. */
export interface RegistroLlamada {
  configuracion: string;
  modelo: string;
  esfuerzo: Esfuerzo;
  caso: string;
  ejecucion: number;
  valida: boolean;
  motivoInvalida: MotivoInvalida | null;
  detalleInvalida: string | null;
  stopReason: string | null;
  /** Campos propuestos tras validar y recortar; null si la respuesta es inválida. */
  respuesta: Record<string, string> | null;
  /** Preguntas, título y coherencia de la respuesta válida (no se puntúan); null si es inválida. */
  otrasSalidas: {
    preguntas?: string[];
    titulo?: string;
    coherencia?: { hayContradiccion: boolean; explicacion?: string };
  } | null;
  /** Texto devuelto por el modelo, tal cual. */
  respuestaBruta: string | null;
  aciertos: Record<string, boolean>;
  /** Campos CIFRA o FECHA_ABSOLUTA con esperado vacío y valor propuesto. */
  invenciones: { campo: string; valor: string }[];
  /** Otros campos con esperado vacío y valor propuesto (informativo; ya cuentan como fallo). */
  valoresSinEsperado: { campo: string; valor: string }[];
  tokensEntrada: number | null;
  tokensSalida: number | null;
  tokensCacheEscritura: number | null;
  tokensCacheLectura: number | null;
  tiempoMs: number;
  costeUsd: number | null;
}
