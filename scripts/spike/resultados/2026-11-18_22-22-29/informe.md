# Medición de la IA de Umbral (modo autor)

- Fecha y hora: 2026-11-18 22:22:29 (Europe/Madrid)
- Versión del prompt: `spike-autor-2`
- Fecha de referencia: 2026-11-18 (Europe/Madrid)
- Ajustes: max_tokens 8000; espera máxima 60 s por llamada, reintentos incluidos; reintentos del SDK 1; 3 ejecuciones por caso; sin streaming
- Alcance: cada llamada pide la salida completa del modo autor (campos, preguntas, título y coherencia, 7.5). **Solo se puntúan los campos; los tokens, el tiempo y el coste son los de la llamada completa del modo autor**, que es lo que mide la condición (3).
- Precios: https://platform.claude.com/docs/en/about-claude/pricing (tabla «Model pricing», columnas «Base input tokens» y «Output tokens»), consultados el 2026-11-18
- Gasto estimado total: 0,3373 USD (límite del script: 3 USD)

## Resumen

Criterio (12.2): (1) cero invenciones en CIFRA y FECHA_ABSOLUTA; (2) al menos un 70 % de aciertos; (3) ninguna llamada por encima de 60 s y coste medio por llamada de 0,05 USD como máximo. Una configuración incompleta no cumple.

| Configuración | Modelo | Esfuerzo | Llamadas | Aciertos | Invenciones | Inválidas | T. máx. | T. medio | Coste medio | (1) | (2) | (3) | Cumple |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opus-5-5-low | `claude-opus-5-5` | low | 18/18 | 91,8 % | 0 | 0 | 33,5 s | 6,8 s | 0,0187 USD | sí | sí | sí | **sí** |

## Decisión

Configuración elegida: **opus-5-5-low** (`claude-opus-5-5`, esfuerzo low), la más barata de las que cumplen, con un coste medio de 0,0187 USD por llamada.

## Detalle por configuración

### opus-5-5-low

- Llamadas: 18 de 18
- Aciertos: 190 de 207 campos (91,8 %)
- Tiempo: máximo 33,5 s, medio 6,8 s
- Coste: medio 0,0187 USD por llamada, total 0,3373 USD
- Tokens medios: 2753 de entrada, 387 de salida
- Condiciones: (1) sí, (2) sí, (3) sí; criterio completo: **sí**

Invenciones (CIFRA y FECHA_ABSOLUTA): ninguna.

Respuestas inválidas: ninguna.

Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): 
- E1, ejecución 1, `comparativa`: «Desde anteayer por la tarde el número de solicitudes completadas baja cada día, mientras el de iniciadas sube.»
- E1, ejecución 2, `comparativa`: «Desde anteayer por la tarde el número de solicitudes completadas baja cada día y el de iniciadas sube»
- E1, ejecución 3, `comparativa`: «Desde anteayer por la tarde el número de solicitudes completadas baja cada día, mientras el de iniciadas sube.»
- C4, ejecución 2, `comparativa`: «Ocurre desde la actualización de la semana pasada.»

Fallos por campo (en 3 ejecuciones): 
`C6.alcance` 3 · `E1.comparativa` 3 · `E2.alcance` 3 · `E2.tiene_metrica` 3 · `C4.detectado_por` 2 · `E1.continua` 2 · `C4.comparativa` 1

## Limitaciones

- Con 6 casos, un solo campo mueve varios puntos del porcentaje; sirve para decidir en este MVP, no como garantía de calidad (12.2).
- En TEXTO, CIFRA y ENLACE la métrica comprueba la forma, no el contenido: una cifra puesta en el campo equivocado cuenta como acierto si el campo esperaba una cifra.
- La salida del modelo puede variar entre ejecuciones; el resultado no es un criterio de aprobado.
- El coste es el de la llamada completa del modo autor (campos, preguntas, título y coherencia), con los tokens de entrada y salida de cada llamada y los precios de precios.json; las llamadas sin tokens (tiempo agotado o error) no entran en la media.
- Las preguntas, el título y la coherencia no se puntúan; quedan en llamadas.json («otrasSalidas») para revisarlos a mano.
