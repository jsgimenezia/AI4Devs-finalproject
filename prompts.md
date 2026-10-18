# Registro de uso de IA — Umbral

Este archivo recoge una **selección** de los prompts más representativos de la fase de documentación (17 y 18 de octubre de 2026), con un máximo de 3 por sección.

## Notas generales

- **Herramientas y modelos:**
  - **Claude Code, app de escritorio**, modelo `claude-sonnet-5-5` con esfuerzo `high`, durante toda la sesión de documentación. El autor intentó cambiar a Opus a mitad de la sesión, pero la transcripción muestra que el cambio no llegó a aplicarse: todos los mensajes del asistente figuran con `claude-sonnet-5-5`.
  - **Gemini**, en una conversación independiente, solo para generar la idea inicial y, más tarde, revisar el documento de producto. El autor indica que el modelo era «Gemini 4 Argon»; no se ha podido comprobar.
- **Fidelidad:** los prompts están copiados **tal cual**, con sus erratas. Cuando un prompt contenía datos personales o de trabajo del autor, esos fragmentos se han sustituido por `[… omitido por privacidad]`. Los textos pegados de otro agente se han sustituido por `[… omitido por extensión]`.
- **Qué falta:** las secciones 2.3, 2.6, 4, 5, 6 y 7 se rellenarán al redactar esas partes del `readme.md`. Los prompts de esa fase se registran automáticamente con un hook (`.claude/hooks/log-prompt.sh`).
- **Dónde está el resultado:** el documento de producto resultante está en [`docs/producto.md`](docs/producto.md).

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Prompts transversales: preparación del repositorio y del flujo de trabajo](#8-prompts-transversales-preparación-del-repositorio-y-del-flujo-de-trabajo)

---

## 1. Descripción general del producto

**Prompt 1: buscar la idea** (Gemini)

> Estoy buscando un proyecto de fin de máster para implementar usando inteligencia artificial. Tiene que ser un proyecto que resuelva un problema personal o profesional y que tenga un backend y un frontend. Dame ideas de cosas que pueda hacer como proyecto.

- **Resultado:** una lista de ideas de proyecto.
- **Ajuste humano:** las ideas eran demasiado grandes para el tiempo disponible; el siguiente prompt las acota.

**Prompt 2: acotar al contexto y a las 30 horas** (Gemini)

> actualmente soy [… omitido por privacidad] y responsable de un equipo de desarrollo. Por acotar un poco tengo que tener un primer mvp funcional en 30 horas, así que algunas de las opciones que has propuesto veo complicado tener algo que funcione en 30 horas

- **Resultado:** una lista reducida. El autor eligió la opción 2 con un tercer mensaje («me gusta mucho la opción 2, desarróllala»), que Gemini desarrolló como un **validador de peticiones de cambio** para equipos de desarrollo. Esa idea se llevó después a la sesión de Claude Code.
- **Ajuste humano:** el autor aportó su contexto profesional y el límite de horas, y descartó las opciones que no cabían.

**Prompt 3: obligar a que la herramienta sea genérica** (Claude Code)

> solo una cosa que tenemos que tener en cuenta, aunque yo trabaje en [… omitido por privacidad] la herramienta debe ser agnóstica y debe servir para cualquier tipo de vertical, por lo que no debe tener nada específico de mi trabajo (por ejemplo [… omitido por privacidad] es un ejemplo de incidencia, pero no hay que hacer ninguna referencia a [… omitido por privacidad] ni a nada que tenga que ver con mi trabajo). Confirma que esto es así y que todo está planteado para que sea genérico

- **Resultado:** el asistente no se limitó a confirmarlo: buscó en el documento y encontró referencias al sector del autor en los ejemplos, en la descripción del contexto y en dos reglas. Dijo que **no** era genérico y propuso los cambios, que se aplicaron en la versión 0.2.
- **Ajuste humano:** el autor detectó el riesgo y exigió una comprobación en lugar de una afirmación. Un mensaje posterior aclaró qué significaba «vertical» (equipos que desarrollan software de cualquier sector), y se mantuvo un ejemplo de inicio de sesión por ser aplicable a casi cualquier sistema.

---

## 2. Arquitectura del sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1: MVP con cimientos**

> ten una cosa en cuenta, el proyecto en el máster son 30 horas pero eso no quiere decir que no pueda dedicar más tiempo para terminar el producto. lo que hay que entregar en el máster es un mvp del producto que quepa en 30 horas por lo que lo importante es que toda la base esté desde el principio aunque dejemos funcionalidades fuera del mvp que se añadan después.

- **Resultado:** se separaron los **cimientos** (decisiones caras de cambiar con datos ya guardados) de las **funcionalidades** (se pueden añadir después). Esa regla quedó en la sección 4.4 del documento de producto y guió decisiones como el aislamiento por equipo, el versionado de peticiones o el campo de periodicidad.
- **Ajuste humano:** el autor cambió el criterio de «recortar para que quepa» por «dejar la base lista».

**Prompt 2: revisión adversarial por otro agente**

> te paso un análisis del documento, analizalo y dime si con esta información cambiarías algo. No de doy mi opinión de momento para no influirte, dame la tuya y luego intercambiamos opiniones.
>
> [… omitido por extensión: análisis del documento de producto elaborado por otro agente]

- **Resultado:** Claude Code contrastó el análisis punto por punto. Aceptó cambios (reglas y vocabulario de términos vagos como configuración tipada tras una interfaz en lugar de tablas, las sugerencias de IA guardadas dentro del análisis, un paquete de esquemas compartido entre backend y frontend y el proveedor simulado como modo por defecto), discrepó de otros (la afirmación de que sobraría tiempo, y varias referencias a una «defensa ante un tribunal» que no figuran en el enunciado) y señaló qué no había mencionado el análisis.
- **Ajuste humano:** el autor pidió la opinión del asistente **antes** de dar la suya, para no influirle, y no aceptó el análisis externo tal cual.

**Prompt 3: aceptar el cambio exigiendo una condición**

> estoy bastante de acuerdo contigo, ha inventado lo de defender el proyecto ante un tribunal ya que no tiene ningún dato sobre lo que hay que hacer en el proyecto. No me convencía lo de llevar las reglas al código, pero con los datos que me has dado creo que si llevas razón en que a nivel del MVP no se va a notar nada, si tienes claro que hacer ese cambio después no va a doler lo quitamos del mvp

- **Resultado:** las reglas salieron de la base de datos en el MVP. Como condición, se escribieron cuatro requisitos verificables con tests (códigos estables, copia de la regla en cada resultado, acceso solo a través de una interfaz, formularios derivados de las definiciones) para que el paso posterior a tablas fuera un cambio localizado.
- **Ajuste humano:** el autor identificó que el otro agente había inventado un dato y no aceptó un cambio de diseño sin que se justificara su coste futuro.

### **2.2. Descripción de componentes principales:**

**Prompt 1: elegir el stack**

> ando bastante perdido con el punto 3. Hace mucho tiempo que no desarrollo, pero creo que lo mejor sería utilizar php y/o javascript con cualquier framework porque son tecnologías altamente demandadas en el mercado. Teniendo en cuenta las salidas profesionales y que todo el desarrollo se va a realizar con IA sin escribir ni una línea de código, cuál crees que sería el mejor stack para el proyecto independientemente del proyecto que sea? Haga lo que haga va a tener un backend, un frontend y un almacén de datos, así que dime cuál crees que puede ser el mejor stack para el proyecto de forma que me sirva para aprender y poder hacer proyectos reales en el futuro

- **Resultado:** recomendación de TypeScript en todo el proyecto: React con Vite, NestJS y PostgreSQL con Prisma, con motivos (un solo lenguaje, los tipos protegen del código generado por IA) y con la condición que cambiaría la recomendación (un entorno laboral de PHP).
- **Ajuste humano:** el autor aportó los criterios (salidas profesionales, desarrollo íntegro con IA, aprendizaje) y aceptó la recomendación.

**Prompt 2: proveedor de IA**

> 1. 7 días me parece correcto para evitar bloqueos aunque puedan pasar cosas sin aprobación cruzada, es el precio a pagar.
> 2. El proveedor de IA va a ser anthropic. Dime cómo funcionaría en este caso el proveedor externo y qué necesitaríamos.
> 3. De momento pon unos valores genéricos que tengan sentido, si hay que afinarlo lo haremos en la implementación
> 4. Las dudas nos las voy a enviar de momento, vamos a esperar a ver si se resuelven con las siguientes entregas.

- **Resultado:** antes de contestar, Claude Code consultó la referencia actualizada de la API de Anthropic (modelos, precios y salida estructurada) y describió el flujo con el SDK oficial de TypeScript, la salida estructurada con esquema y el proveedor simulado para pruebas. El modelo y el esfuerzo se dejaron para decidir **midiendo** con los ejemplos. Los valores genéricos pasaron a la sección 6.9 del documento.
- **Ajuste humano:** el autor fijó el proveedor y dejó explícito que los valores se afinarían al implementar.

**Prompt 3: alternativa gratuita**

> una cosa respecto al modelo, hay alguna forma de montar el mvp con un modelo gratuito de cualquier proveedor?

- **Resultado:** búsqueda de opciones (Ollama local, Gemini, Groq, OpenRouter), con la advertencia de que las fuentes eran de terceros y discrepaban. El asistente recomendó, y el autor eligió, **mantener solo Anthropic** en el MVP y dejar las demás en el roadmap.
- **Ajuste humano:** decisión del autor tras contrastar coste y esfuerzo.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:** _Pendiente: se completará al redactar esta sección del `readme.md`._

### **2.4. Infraestructura y despliegue**

**Prompt 1: ¿hace falta hosting?**

> antes de seguir con avanzando, no podemos hacer que el mvp para el proyecto sea todo en local? necesitamos un hosting si o si para el mvp?

- **Resultado:** el asistente contrastó el enunciado, que lista «despliegue» en la entrega final sin definirlo, y adoptó una lectura prudente (un despliegue real se espera).

**Prompt 2: corrección con evidencia**

> no, antes de seguir terminemos de aclarar esto, yo te digo cuando quiero seguir. la entrega final no tiene que estar en una url pública, eso te lo puedo asegurar. Lo que si tiene que tener la entrega final es la forma de correr el proyecto en local. Si te fijas en el proyecto de ejemplo 1 de los que vienen en la documentación (https://github.com/LIDR-academy-temp/AI4Devs-finalproject-Example1) tiene la instalación para correr backend y frontend en local

- **Resultado:** el asistente comprobó el ejemplo señalado (guía de arranque local y documento de despliegue sin URL pública), adoptó la decisión y rehízo el plan: todo con Docker Compose en local y apartado de despliegue documentado sin ejecutarse.
- **Ajuste humano:** el autor corrigió una lectura demasiado prudente del enunciado con un dato que conocía y con un precedente verificable.

### **2.5. Seguridad**

**Prompt 1: permisos, sesión y aislamiento**

> 1. un solo equipo por usuario para el mvp, dime el dolor si decidimos ampliarlo después
> 2. si, el solicitante solo ve sus peticiones, hay usuarios administradores o similar que ven todo?
> 3. correcto, solo decide si es el único. importante que si solo hay uno la petición no se quede bloqueada eternamente
> 4. Si, debería ser así. Dime si añade mucha complejidad para el mvp, porque si es así podemos usar tokens en logal storage.
> 5. Si, es fundamental para garantizar que solo se pueden ver los datos de tu equipo

- **Resultado:** el equipo activo viaja en la sesión (para poder ampliar después sin rehacer el acceso a datos); no hay administrador de plataforma; la autoaprobación se permite al único revisor **o** a los 7 días sin decisión; sesión con cookie `HttpOnly` y protección CSRF, con el token en `localStorage` como alternativa aceptada si el coste se descontrola; aislamiento con repositorios que exigen el equipo y un test que **falla** si existe una ruta sin registrar.
- **Ajuste humano:** el autor exigió que ninguna petición quedara bloqueada y pidió el coste real antes de aceptar la opción más segura.

### **2.6. Tests**

**Prompt 1:** _Pendiente: no hay un prompt específico de tests en esta fase._

---

## 3. Modelo de datos

**Prompt 1: adaptar la herramienta a cada sector**

> Lo de Jira me parece bien, después del mvp se podrían añadir más herramientas. También está la opción de que se pueda "adaptar" la herramienta al sector para que haga preguntas concretas de ese sector , así en [… omitido por privacidad] y en otro de un erp podría preguntar por otra cosa

- **Resultado:** idea de reglas con forma de datos (cada regla define su campo y un conjunto cerrado de comprobaciones), con la personalización por equipo y los paquetes sectoriales fuera del MVP.
- **Ajuste humano:** el autor propuso una ampliación de producto que cambió el modelo de datos, y se aplicó la regla de cimientos para decidir qué entraba.

**Prompt 2: repaso de huecos antes de implementar**

> he subido el modelo, dale un último repaso al documento para ver si está todo blindado o si hay algo que se haya podido quedar suelto y que nos pueda suponer problemas a la hora de la implementación

- **Resultado:** el asistente leyó el documento entero y encontró huecos reales: una persona solo podía estar en un equipo (se pasó a una relación con membresía), contradicciones entre la inmutabilidad del historial y datos que se rellenaban después, estados incompletos, reglas que no cabían en «un campo, una comprobación», y una salida que no funcionaba sin IA. Se corrigieron en la versión 0.5.
- **Ajuste humano:** el autor creía haber cambiado de Sonnet a Opus para esta revisión, pero la transcripción indica que el modelo siguió siendo Sonnet.

**Prompt 3: formularios dinámicos**

> modifica el documento para añadir esta información pero vamos con la opción de que los formularios sean dinámicos, solo en el caso que tengamos que hacerlos estáticos tendríamos que implementar el test. Modifica el documento para dejar constancia de esto ya que tenemos la respuesta, pero manteniendo como opción primaria que los formularios sean dinámicos

- **Resultado:** los formularios se dibujan desde las definiciones de reglas; solo si el coste se descontrola se pasa a formularios fijos, y entonces se añade un test de coherencia entre campos y definiciones.
- **Ajuste humano:** el autor fijó la opción primaria y la alternativa, para que el modelo de datos quedara estable en cualquiera de los dos casos.

---

## 4. Especificación de la API

**Prompt 1:** _Pendiente: se completará al redactar esta sección._

---

## 5. Historias de usuario

**Prompt 1:** _Pendiente: se completará al redactar esta sección._

---

## 6. Tickets de trabajo

**Prompt 1:** _Pendiente: se completará al redactar esta sección._

---

## 7. Pull requests

**Prompt 1:** _Pendiente: no habrá pull requests de backend, frontend y base de datos hasta la entrega final._

---

## 8. Prompts transversales: preparación del repositorio y del flujo de trabajo

**Prompt 1: delimitar lo que pide la entrega**

> pero para la entrega de diciembre solo pide lo siguiente:
>
> 1. Documentación técnica: Ficha del proyecto, descripción, arquitectura, modelo de datos, historias de usuario, tickets de trabajo
>
> No parece que haya que entregar por ejemplo nada del pungto 1.3 como dices

- **Resultado:** el asistente reconoció que había tratado la plantilla del README como lista obligatoria, cuando el enunciado era más corto. Se reclasificaron las piezas en «obligatorias» y «dudosas» (sección 16.2 del documento de producto) y se decidió dejar el apartado 1.3 con una nota y el flujo de pantallas en texto.
- **Ajuste humano:** corrección del autor sobre una exigencia que el asistente había puesto de más.

**Prompt 2: reglas de trabajo del agente**

> decide tu las 3 cuestiones y escribe el calude.md

- **Resultado:** el asistente tomó tres decisiones (escribir directamente en los entregables, dejar el registro de prompts fuera de git, mantener la regla de informar al terminar) y creó `CLAUDE.md`, con la fase actual (solo documentación), las reglas de git (solo lectura), el idioma y el registro de prompts.
- **Ajuste humano:** el autor delegó las decisiones, que antes había revisado en un borrador.

**Prompt 3: registro automático de prompts**

Dos mensajes consecutivos del autor:

> sí, seguimos con el hook

> escríbelo tú

- **Resultado:** tras consultar la documentación oficial de hooks (el campo `prompt` y el hecho de que la salida estándar llega al modelo), se creó un script que añade cada prompt a `.claude/prompt-log.md`, se probó con seis casos en un directorio temporal y se verificó después disparado por Claude Code. El registro queda ignorado por git.
- **Ajuste humano:** el autor aprobó el diseño antes de escribir los archivos y comprobó él mismo que el hook registraba un prompt real.
