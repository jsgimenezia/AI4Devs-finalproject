# Umbral

Umbral es una herramienta web para que un equipo de desarrollo reciba peticiones
completas: comprueba con reglas deterministas lo que falta, pregunta al solicitante
y, cuando está completa, la pasa a un revisor. Una IA opcional ayuda con sugerencias
pero nunca decide. Es un proyecto académico individual.

La fuente de verdad del producto es `docs/producto.md`. Léelo antes de cualquier tarea
y no lo contradigas. Si algo que te piden choca con él, dilo y pregunta.

## Fase actual: solo documentación

- No escribas código de la aplicación (ni backend, ni frontend, ni migraciones).
  Los fragmentos ilustrativos dentro de la documentación sí están permitidos.
- Excepción: el script desechable de medición de la IA en `scripts/spike/`. Solo se
  escribe en la rama `spike/medicion-ia`, nunca en `feature/entrega-1-JSG`, que es solo
  documentación: si la rama actual no es `spike/medicion-ia`, no toques `scripts/spike/`.
  No cuenta como código de la aplicación. Usa solo casos ficticios y lee la clave de la
  variable de entorno `ANTHROPIC_API_KEY`, nunca del repositorio.
- Los entregables son `readme.md` y `prompts.md`, en la raíz, con los nombres y en el
  orden de sus plantillas. No los renombres ni cambies el índice. Puedes escribir
  directamente en ellos.
- `docs/` guarda material de apoyo. El `readme.md` debe poder leerse sin él.

## Idioma y estilo

- Escribe en castellano. Los identificadores técnicos y los nombres de campos del
  modelo van tal cual están en `docs/producto.md`.
- Diagramas en Mermaid. Tablas solo cuando comparan varias cosas.
- Sé concreto y no rellenes: si una sección no tiene contenido real, di que está
  pendiente en lugar de inventarlo.

## Reglas de trabajo

- No inventes decisiones. Lo que falte en `docs/producto.md` se marca como cuestión
  abierta o se pregunta; nunca se da por resuelto.
- No afirmes que algo funciona, está probado o está desplegado si no lo has comprobado.
  Distingue siempre entre «previsto» y «verificado».
- Todos los ejemplos de peticiones son ficticios y neutros. No uses datos reales de
  ninguna empresa ni persona, ni nombres de sectores concretos.
- Nunca escribas claves, contraseñas ni tokens, ni siquiera de ejemplo con aspecto real.
  Única excepción: las contraseñas de prueba de los usuarios ficticios de los datos de
  demostración (sección 13 de `docs/producto.md`), que solo valen en local.

## Git

- No ejecutes `git add`, `commit`, `push`, `switch`, `checkout`, `rebase` ni nada que
  cambie el repositorio. Solo lectura (`status`, `diff`, `log`, `show`).
- El autor hace los commits. Si crees que algo merece un commit, sugiere el mensaje.
- Rama de trabajo: `feature/entrega-1-JSG`, y `spike/medicion-ia` solo para el script de
  medición. No cambies de rama: lo hace el autor.

## Registro de prompts

- Si existe `.claude/prompt-log.md`, ahí se guardan los prompts que lanza el autor.
  Es un archivo local, no versionado. No lo edites.
- `prompts.md` se rellena después con una selección de esos prompts, tal cual se
  lanzaron, indicando herramienta, modelo y ajustes humanos. Máximo 3 por sección.

## Al terminar una tarea

Informa de qué has cambiado, qué has comprobado y cómo, y qué no has podido comprobar.
