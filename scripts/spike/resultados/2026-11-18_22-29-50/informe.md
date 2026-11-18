# Medición de la IA de Umbral (modo autor)

- Fecha y hora: 2026-11-18 22:29:50 (Europe/Madrid)
- Versión del prompt: `spike-autor-2`
- Fecha de referencia: 2026-11-18 (Europe/Madrid)
- Ajustes: max_tokens 8000; espera máxima 60 s por llamada, reintentos incluidos; reintentos del SDK 1; 3 ejecuciones por caso; sin streaming
- Alcance: cada llamada pide la salida completa del modo autor (campos, preguntas, título y coherencia, 7.5). **Solo se puntúan los campos; los tokens, el tiempo y el coste son los de la llamada completa del modo autor**, que es lo que mide la condición (3).
- Precios: https://platform.claude.com/docs/en/about-claude/pricing (tabla «Model pricing», columnas «Base input tokens» y «Output tokens»), consultados el 2026-11-18
- Gasto estimado total: 0,3249 USD (límite del script: 3 USD)

## Resumen

Criterio (12.2): (1) cero invenciones en CIFRA y FECHA_ABSOLUTA; (2) al menos un 70 % de aciertos; (3) ninguna llamada por encima de 60 s y coste medio por llamada de 0,05 USD como máximo. Una configuración incompleta no cumple.

| Configuración | Modelo | Esfuerzo | Llamadas | Aciertos | Invenciones | Inválidas | T. máx. | T. medio | Coste medio | (1) | (2) | (3) | Cumple |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sonnet-5-5-low | `claude-sonnet-5-5` | low | 18/18 | 87,9 % | 0 | 0 | 3,6 s | 2,7 s | 0,0084 USD | sí | sí | sí | **sí** |
| sonnet-5-5-medium | `claude-sonnet-5-5` | medium | 18/18 | 87,4 % | 0 | 0 | 3,8 s | 2,7 s | 0,0085 USD | sí | sí | sí | **sí** |
| haiku-5-5-low | `claude-haiku-5-5` | low | 18/18 | 88,9 % | 0 | 0 | 3 s | 2,6 s | 0,0005 USD | sí | sí | sí | **sí** |
| haiku-5-5-medium | `claude-haiku-5-5` | medium | 18/18 | 88,9 % | 0 | 0 | 6,4 s | 4,2 s | 0,0007 USD | sí | sí | sí | **sí** |

## Decisión

Configuración elegida: **haiku-5-5-low** (`claude-haiku-5-5`, esfuerzo low), la más barata de las que cumplen, con un coste medio de 0,0005 USD por llamada.

## Detalle por configuración

### sonnet-5-5-low

- Llamadas: 18 de 18
- Aciertos: 182 de 207 campos (87,9 %)
- Tiempo: máximo 3,6 s, medio 2,7 s
- Coste: medio 0,0084 USD por llamada, total 0,1505 USD
- Tokens medios: 2753 de entrada, 285 de salida
- Condiciones: (1) sí, (2) sí, (3) sí; criterio completo: **sí**

Invenciones (CIFRA y FECHA_ABSOLUTA): ninguna.

Respuestas inválidas: ninguna.

Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): 
- E1, ejecución 1, `comparativa`: «Desde anteayer por la tarde las solicitudes completadas bajan cada día, mientras las iniciadas suben.»
- E1, ejecución 2, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas, mientras sube el de las iniciadas.»
- E1, ejecución 3, `comparativa`: «Desde anteayer por la tarde las solicitudes completadas bajan cada día y las iniciadas suben.»

Fallos por campo (en 3 ejecuciones): 
`C4.detectado_por` 3 · `C6.alcance` 3 · `C6.urgencia` 3 · `E1.comparativa` 3 · `E1.detectado_por` 3 · `E2.actor` 3 · `E2.alcance` 3 · `E2.tiene_metrica` 3 · `E1.continua` 1

### sonnet-5-5-medium

- Llamadas: 18 de 18
- Aciertos: 181 de 207 campos (87,4 %)
- Tiempo: máximo 3,8 s, medio 2,7 s
- Coste: medio 0,0085 USD por llamada, total 0,1536 USD
- Tokens medios: 2753 de entrada, 303 de salida
- Condiciones: (1) sí, (2) sí, (3) sí; criterio completo: **sí**

Invenciones (CIFRA y FECHA_ABSOLUTA): ninguna.

Respuestas inválidas: ninguna.

Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): 
- E1, ejecución 1, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas, mientras sube el de las iniciadas.»
- E1, ejecución 2, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas, mientras sube el de las iniciadas.»
- E1, ejecución 3, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas, mientras sube el de las iniciadas.»

Fallos por campo (en 3 ejecuciones): 
`C4.detectado_por` 3 · `C6.alcance` 3 · `C6.urgencia` 3 · `E1.comparativa` 3 · `E1.continua` 3 · `E1.detectado_por` 3 · `E2.alcance` 3 · `E2.tiene_metrica` 3 · `E2.actor` 2

### haiku-5-5-low

- Llamadas: 18 de 18
- Aciertos: 184 de 207 campos (88,9 %)
- Tiempo: máximo 3 s, medio 2,6 s
- Coste: medio 0,0005 USD por llamada, total 0,0086 USD
- Tokens medios: 2753 de entrada, 400 de salida
- Condiciones: (1) sí, (2) sí, (3) sí; criterio completo: **sí**

Invenciones (CIFRA y FECHA_ABSOLUTA): ninguna.

Respuestas inválidas: ninguna.

Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): 
- E1, ejecución 2, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas.»
- E1, ejecución 3, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas.»
- E1, ejecución 3, `alcance`: «Solicitudes del proceso de solicitudes (completadas e iniciadas).»
- C4, ejecución 1, `urgencia`: «Varios clientes se han quejado.»
- C4, ejecución 2, `urgencia`: «Varios clientes se han quejado.»
- C4, ejecución 3, `urgencia`: «Varios clientes se han quejado.»
- C6, ejecución 1, `actor`: «Usuarios que utilizan el buscador.»

Fallos por campo (en 3 ejecuciones): 
`C4.detectado_por` 3 · `C4.urgencia` 3 · `C6.alcance` 3 · `E1.continua` 3 · `E2.alcance` 3 · `E2.tiene_metrica` 3 · `E1.comparativa` 2 · `C6.actor` 1 · `E1.alcance` 1 · `E1.detectado_por` 1

### haiku-5-5-medium

- Llamadas: 18 de 18
- Aciertos: 184 de 207 campos (88,9 %)
- Tiempo: máximo 6,4 s, medio 4,2 s
- Coste: medio 0,0007 USD por llamada, total 0,0122 USD
- Tokens medios: 2753 de entrada, 810 de salida
- Condiciones: (1) sí, (2) sí, (3) sí; criterio completo: **sí**

Invenciones (CIFRA y FECHA_ABSOLUTA): ninguna.

Respuestas inválidas: ninguna.

Otros campos con esperado vacío y valor propuesto (ya cuentan como fallo): 
- E1, ejecución 1, `comparativa`: «Desde anteayer por la tarde, cada día baja el número de solicitudes completadas.»
- E1, ejecución 2, `comparativa`: «Desde anteayer por la tarde, baja cada día.»
- E1, ejecución 3, `comparativa`: «Desde anteayer por la tarde baja cada día el número de solicitudes completadas.»
- E1, ejecución 3, `alcance`: «Solicitudes (proceso de completar solicitudes).»

Fallos por campo (en 3 ejecuciones): 
`C4.detectado_por` 3 · `C6.alcance` 3 · `E1.comparativa` 3 · `E1.continua` 3 · `E2.alcance` 3 · `E2.tiene_metrica` 3 · `C4.alcance` 1 · `C4.cambios_periodo` 1 · `E1.alcance` 1 · `E1.detectado_por` 1 · `E2.actor` 1

## Limitaciones

- Con 6 casos, un solo campo mueve varios puntos del porcentaje; sirve para decidir en este MVP, no como garantía de calidad (12.2).
- En TEXTO, CIFRA y ENLACE la métrica comprueba la forma, no el contenido: una cifra puesta en el campo equivocado cuenta como acierto si el campo esperaba una cifra.
- La salida del modelo puede variar entre ejecuciones; el resultado no es un criterio de aprobado.
- El coste es el de la llamada completa del modo autor (campos, preguntas, título y coherencia), con los tokens de entrada y salida de cada llamada y los precios de precios.json; las llamadas sin tokens (tiempo agotado o error) no entran en la media.
- Las preguntas, el título y la coherencia no se puntúan; quedan en llamadas.json («otrasSalidas») para revisarlos a mano.
