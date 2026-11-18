# Script de medición de la IA (desechable)

Mide qué modelo y qué esfuerzo usar en el modo autor de Umbral (relleno de campos) con el
subconjunto de evaluación y el criterio de decisión de `docs/producto.md` (12.2). Vive solo en la
rama `spike/medicion-ia` y no es código de la aplicación. Todos los casos son ficticios.

Cada llamada pide la salida completa del modo autor (campos, preguntas, título y coherencia, 7.5).
Solo se puntúan los campos; los tokens, el tiempo y el coste son los de la llamada completa.

## Archivos

- `casos.json`: los 6 casos con sus valores esperados.
- `catalogo.json`: las reglas de 6.2 y 6.3 (campos, etiquetas, comprobaciones y opciones).
- `configuraciones.json`: ajustes (max_tokens, espera, reintentos, límite de gasto, fecha de
  referencia) y configuraciones (modelo y esfuerzo). En modo real solo se ejecutan las que tienen
  `"aprobada": true`.
- `precios.json`: precios por millón de tokens, con su fuente y fecha de consulta.
- `medir.ts`: el script. `comprobar.ts`: comprobaciones del propio script en modo en seco.
- `resultados/<fecha y hora>/`: `llamadas.json` (cada llamada), `informe.md` y `entrada.json`
  (instrucciones, esquemas y mensajes enviados).

## Instalar

Probado con Node.js 24.

```bash
cd scripts/spike
npm install
```

## Modo en seco (sin clave y sin gasto)

Sustituye la llamada por respuestas simuladas para probar la validación, la puntuación y el informe.

```bash
npm run seco                                  # escenario «esperado»: 100 % y cero invenciones
npm run seco -- --escenario invencion-c4      # una cifra inventada en C4
npm run seco -- --escenario fallos            # inválidas, tiempo agotado y una fecha inventada
npm run comprobar                             # comprueba los tres escenarios y sale con error si algo falla
```

## Modo real (llamadas a la API, con gasto)

1. Define la clave solo en tu shell, sin guardarla en ningún archivo. Por ejemplo, en bash,
   `read -rs ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY` y pega la clave (no se muestra ni
   queda en el historial).
2. Comprueba qué modelos tienes disponibles (no genera tokens):

   ```bash
   npm run modelos
   ```

3. Marca como `"aprobada": true` en `configuraciones.json` las configuraciones que quieras medir.
4. Ejecuta, todas las aprobadas o solo algunas:

   ```bash
   npm run medir
   npm run medir -- --solo haiku-5-5-low        # p. ej., una prueba corta primero
   ```

5. Al terminar, `unset ANTHROPIC_API_KEY`.

Protección de gasto: antes de cada llamada, el script suma el coste ya estimado y el peor caso de
la siguiente llamada (todas sus salidas en `max_tokens`); si superaría `limiteGastoUsd` (3 USD),
para, lo dice y deja el informe con lo medido. Las llamadas sin tokens (tiempo agotado o error)
cuentan con su peor caso. Una respuesta 400, 401, 402, 403 o 404 de la API detiene la medición,
porque se repetiría en todas las llamadas.
