# Registro de uso de IA — Umbral

Este archivo recoge una **selección** de los prompts más representativos de la fase de documentación (del 17 al 20 de octubre de 2026), con un máximo de 3 por sección.

## Notas generales

- **Herramientas y modelos:**
  - **Claude Code, app de escritorio**, modelo `claude-sonnet-5-5` con esfuerzo `high` el 17 y el 18 de octubre. El autor intentó cambiar a Opus en esos días, pero la transcripción muestra que el cambio no llegó a aplicarse: todos los mensajes del asistente de esos días figuran con `claude-sonnet-5-5`. Desde el 19 de octubre el cambio a `claude-opus-5-5` sí se aplicó (comprobado en los datos de la sesión). Con ese modelo se analizó la revisión externa y se escribió la versión 1.2 del documento (sección 10), y después se definieron las historias de usuario y se escribió la versión 1.3 (sección 5).
  - **Claude Code, terminal**, para la revisión crítica y la aplicación de cambios (sección 9): modelo `claude-opus-5-5`. Se comprobó en el registro local de la sesión: 121 mensajes del asistente con `claude-opus-5-5` y 1 con `claude-sonnet-5-5` (el primero, una prueba del hook, anterior al cambio de modelo). El esfuerzo `high` lo indica el autor y no consta en el registro.
  - **Gemini**, en una conversación independiente, solo para generar la idea inicial y, más tarde, revisar el documento de producto. El autor indica que el modelo era «Gemini 4 Argon»; no se ha podido comprobar.
- **Fidelidad:** los prompts están copiados **tal cual**, con sus erratas. Cuando un prompt contenía datos personales o de trabajo del autor, esos fragmentos se han sustituido por `[… omitido por privacidad]`. Los textos pegados de otro agente se han sustituido por `[… omitido por extensión]`.
- **Qué falta:** las secciones 2.3, 2.6, 4, 6 y 7 se rellenarán al redactar esas partes del `readme.md`. Los prompts de esa fase se registran automáticamente con un hook (`.claude/hooks/log-prompt.sh`).
- **De dónde salen los prompts de la sección 9:** del registro que escribe el hook (`.claude/prompt-log.md`, local y no versionado), con el texto tal como se lanzó.
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
9. [Revisión crítica con otro modelo y aplicación de los cambios](#9-revisión-crítica-con-otro-modelo-y-aplicación-de-los-cambios)
10. [Revisión humana externa](#10-revisión-humana-externa)

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
- **Ajuste humano:** el autor creía haber cambiado de Sonnet a Opus para esta revisión, pero la transcripción indica que el modelo siguió siendo Sonnet. La revisión con Opus se hizo después, en una sesión de terminal (sección 9).

**Prompt 3: formularios dinámicos**

> modifica el documento para añadir esta información pero vamos con la opción de que los formularios sean dinámicos, solo en el caso que tengamos que hacerlos estáticos tendríamos que implementar el test. Modifica el documento para dejar constancia de esto ya que tenemos la respuesta, pero manteniendo como opción primaria que los formularios sean dinámicos

- **Resultado:** los formularios se dibujan desde las definiciones de reglas; solo si el coste se descontrola se pasa a formularios fijos, y entonces se añade un test de coherencia entre campos y definiciones.
- **Ajuste humano:** el autor fijó la opción primaria y la alternativa, para que el modelo de datos quedara estable en cualquiera de los dos casos.

---

## 4. Especificación de la API

**Prompt 1:** _Pendiente: se completará al redactar esta sección._

---

## 5. Historias de usuario

**Contexto.** El documento de producto describía Umbral con 36 requisitos funcionales y no tenía historias de usuario escritas. El 19 de octubre el autor pasó a la sesión de escritorio (Claude Code, `claude-opus-5-5`) una lección nueva del máster sobre el proyecto final y le pidió comprobar si algo chocaba con lo previsto. Entre otros puntos, la IA señaló que la lección recomienda planificar entre 3 y 5 historias imprescindibles y 1 o 2 deseables, y que el documento no tenía esa priorización. Los prompts de esta sección salen de ahí. Se han copiado de la transcripción de esa sesión.

**Prompt 1: cuántas historias hay y cuáles son imprescindibles** (Claude Code, app de escritorio, Opus 5.5)

> una pregunta respecto a esto, cuántas historias tiene umbral? y cuáles serían las 5 historias imprescindibles?

- **Resultado:** la IA explicó que no había historias, sino 36 requisitos, 19 escenarios Given/When/Then y tres historias propuestas para el README que no cubrían las cuentas. Agrupó los requisitos en cinco historias imprescindibles (equipo e invitaciones, registrar una petición y ver qué le falta, completarla y enviarla, revisar y decidir, y exportar) y dos deseables (la IA en modo autor y en modo revisor). Indicó qué requisitos cumplía cada una y cuáles son transversales. Dejó al autor la decisión de si la IA era imprescindible.

**Prompt 2: dónde deben vivir las historias** (Claude Code, app de escritorio, Opus 5.5)

> pero entonces no deberíamos meter también las historias en el documento de producto?

- **Resultado:** la IA recomendó incluirlas en el documento de producto, la fuente de verdad que leerán los agentes, para que el README no tuviera una versión propia de las historias. Propuso hacerlo en una versión 1.3 solo aditiva y agrupar en ella las otras decisiones pendientes de la lección, para descongelar el documento una sola vez.

**Prompt 3: decisiones del autor** (Claude Code, app de escritorio, Opus 5.5)

> me valen las 5 historias, con la IA como deseable por si directamente vamos mal y tenemos que cortar toda esa parte no estar comprometidos
>
> respecto a los otros puntos. Punto 1: yo haría la medición en el periodo de la entrega 1 aunque no lo entreguemos en ese momento, creo que es importante tener esa medición temprano para tomar decisiones. Dime qué te parece hacerlo así antes de escribirlo. Punto 3: dime cuál es la decisión, que no me acuerdo de qué iba ese punto

- **Resultado:** el «punto 1» era que la lección define la Entrega 1 como solo documentación, mientras que el plan versionaba en esa rama el script de medición de la IA. El «punto 3» era que el README final debe incluir credenciales de prueba para el evaluador. Para el punto 1, la IA propuso una rama aparte (`spike/medicion-ia`) que no se fusiona con la de la Entrega 1. Para el punto 3, propuso datos de demostración activados por variable de entorno. Con las decisiones del autor escribió la versión 1.3:
  - las historias en la sección 5;
  - el paso (7) del orden de recorte, que quita toda la IA;
  - la medición en la rama aparte;
  - los datos de demostración en la oleada 1;
  - las reglas correspondientes en `CLAUDE.md`.

  La IA comprobó que los 36 requisitos quedaban asignados y que los escenarios citados existían.
- **Ajuste humano:** el autor decidió que la IA del producto fuera deseable y no imprescindible, para poder recortarla entera si el plan se tuerce. También mantuvo la medición durante el periodo de la Entrega 1, aunque no se entregue entonces, porque quería datos pronto para decidir. Después pidió a la sesión de terminal (Claude Code, `claude-opus-5-5`) una revisión a fondo de la versión 1.3. Encontró cuatro detalles menores en lo que había escrito la sesión de escritorio:
  - los datos de demostración no decían cómo se crean;
  - ninguna prueba comprobaba que no se cargan por defecto;
  - no estaba claro con qué usuarios se recorre cada flujo ni desde qué entrega van las credenciales en el README;
  - la lista de lo que desaparece con el paso (7) estaba incompleta.

  El autor decidió que las credenciales de prueba aparezcan en el README desde la Entrega 2 y que los resultados de la medición vayan en el apartado de tests. También pidió a la terminal que el recorte de la IA se planteara en el punto de control del 19 de enero. Al verificarlo, la sesión de escritorio señaló que así no se podría recortar antes aunque la medición de diciembre saliera mal, lo que iba contra el propósito de medir pronto. El autor lo corrigió: el recorte se plantea en ese punto de control o antes. Por último, la terminal señaló que faltaba definir cuándo «la IA no compensa». Quedó como cuestión abierta (la 24), con el criterio que se fijará antes de medir. También se añadió que, en ese caso, la IA se recorta directamente, sin pasar antes por los demás recortes.

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

---

## 9. Revisión crítica con otro modelo y aplicación de los cambios

Esta fase se hizo en una **sesión de Claude Code en terminal con `claude-opus-5-5`**, abierta dentro del repositorio (por eso se aplicaron `CLAUDE.md` y el hook de registro). Los dos primeros prompts **los redactó Claude en la sesión de escritorio** (Sonnet 5.5) a petición del autor, que los revisó, añadió sus decisiones y los lanzó en la sesión de Opus. El tercero es del propio autor. Se han quitado de los textos las etiquetas de «contenido pegado» que añade la herramienta.

**Prompt 1: revisión crítica e independiente del documento** (Claude Code, terminal, Opus 5.5)

> Quiero que hagas una revisión crítica e independiente de un documento de producto. No lo modifiques: tu entrega es un informe.
>
> CONTEXTO
> El documento está en docs/producto.md (lo tienes en este repositorio). Describe "Umbral", una herramienta web para que un equipo de desarrollo reciba peticiones completas: comprueba con reglas deterministas lo que falta en una petición, pregunta al solicitante y, cuando está completa, la pasa a un revisor. Una IA opcional ayuda con sugerencias pero nunca decide. Es un proyecto individual cuyo MVP debe poder construirse en unas 30 horas de trabajo, con TypeScript (React + Vite, NestJS, PostgreSQL con Prisma). El desarrollo lo hará un agente de IA a partir de este documento, sin que su autor escriba código, así que lo que el documento deje ambiguo, el agente lo inventará.
>
> LO QUE TIENES QUE HACER
> Lee el documento ENTERO, de principio a fin, y revisa lo siguiente:
> 1. Contradicciones internas entre secciones (requisitos, reglas de negocio, modelo de datos, estados, API, pruebas, plan).
> 2. Ambigüedades o huecos que obligarían a quien implemente a tomar una decisión que el documento no toma.
> 3. Integridad del modelo de datos: relaciones, claves, restricciones, inmutabilidad del historial, concurrencia, qué se puede o no consultar.
> 4. Seguridad: aislamiento entre equipos, permisos por rol, sesión, entrada no confiable hacia la IA, abuso y coste.
> 5. Que lo que se promete como "verificable con tests" lo sea de verdad, y que la estrategia de pruebas cubra los requisitos.
> 6. Si el alcance y las horas del plan son realistas, y qué se recortaría primero.
> 7. Calidad de la parte de IA: contrato de entrada y salida, fallos, proveedor simulado y qué NO queda demostrado.
> 8. Errores mecánicos: referencias cruzadas rotas, numeración de requisitos o reglas, tablas incoherentes, diagramas Mermaid con sintaxis dudosa.
>
> Decisiones ya tomadas por el autor. No las reabras, salvo que encuentres una contradicción o un riesgo grave en ellas, y entonces dilo con el motivo:
> - El stack, el MVP con dos tipos de petición, y que las reglas viven en configuración tipada detrás de una interfaz en el MVP (no en base de datos).
> - Un usuario pertenece a un solo equipo en el MVP, pero el modelo usa una tabla de membresía.
> - La herramienta es neutra respecto al sector del equipo.
> - La entrega no necesita URL pública; se ejecuta en local con Docker Compose.
>
> CÓMO TRABAJAR
> - Verifica leyendo; no te fíes de lo que el propio documento afirma sobre sí mismo. Cita siempre la sección o el requisito donde ves cada problema.
> - No seas complaciente. Si algo está bien, dilo en una línea; dedica el esfuerzo a lo que falla.
> - Distingue entre lo que has comprobado y lo que solo supones.
> - No ejecutes comandos de git que cambien el repositorio ni edites ningún archivo.
>
> FORMATO DE LA RESPUESTA (en castellano)
> 1. Veredicto en tres líneas: ¿se puede empezar a implementar con esto, sí o no, y por qué?
> 2. Hallazgos ordenados de más a menos grave, en una tabla con: nº, gravedad (bloqueante / importante / menor), sección, problema, por qué importa y arreglo concreto propuesto.
> 3. Lo que está bien resuelto (breve).
> 4. Preguntas que solo puede responder el autor.
> 5. Qué no has podido comprobar.

- **Resultado:** un informe de 22 hallazgos (3 bloqueantes, 12 importantes y 7 menores) con el veredicto «todavía no». La sesión de escritorio contrastó los hallazgos con el documento y con la referencia de la API: los comprobables resultaron ciertos, incluido un error mío sobre la salida estructurada de la IA (un `Record` no sería compatible con `additionalProperties: false`). Se aceptaron 17 tal cual y 5 con matiz; en uno, el del límite de salida de la IA, se discrepó con motivo.
- **Ajuste humano:** el autor decidió las 11 preguntas que el informe dejaba abiertas (en el prompt siguiente). El propio prompt, redactado por Claude, pedía no editar nada y separar lo comprobado de lo supuesto.

**Prompt 2: aplicar las decisiones con las respuestas del autor**

> Apruebo las 11 propuestas por defecto, con estas precisiones:
>
> 9. Sustituye mi propuesta por este texto: "Presupuesto: 30 horas de objetivo, más un margen de hasta 10 horas reservado al núcleo (motor de reglas, estados y transiciones atómicas, aislamiento, versiones y exportación). Es una estimación sin medir; las horas reales de la Entrega 1 se contrastarán con las 9 previstas y, si la desviación supera el 30 %, se replanifica. Orden de recorte cuando se agote el margen: (1) coherencia, título y borrador de la IA, dejando solo el relleno de campos; (2) historial como lista simple; (3) E2E con un solo recorrido; (4) límite de IA solo global; (5) comparación de modelos y ajuste fino, manteniendo el adaptador del proveedor real con una ejecución manual documentada. El adaptador real solo se plantea quitar si en el punto de control del 19 de enero (final de la Entrega 2) quedan menos horas que las necesarias para cerrar los tests."
>
> Tus siete puntos:
> A. De acuerdo con tu propuesta. Refleja en 7.5 los DOS modos de llamada (ayuda al autor, y criterios o hipótesis para el revisor), cada uno con su esquema de salida, y en 6.7, 7.1, RF-08 y la fila 1.0 del historial.
> B. De acuerdo: el revisor ve toda petición con enviada_en no nulo (incluidas retiradas, devueltas y canceladas); un borrador que nunca se ha enviado devuelve 404. Actualiza RF-23, la sección 3, la matriz 6.7 y la sección 18.
> C. Tope global: 200 sugerencias al día por instalación, configurable por variable de entorno. Mantén los límites de 10 por usuario y hora y 100 por equipo y día.
> D. Espera máxima de 60 segundos hasta medirlo, sin streaming en el MVP. Si se agota el tiempo, guarda la sugerencia como DESCARTADA con motivo TIEMPO_AGOTADO y tokens a null. Marca el valor como "a medir en la comprobación inicial". maxRetries bajo (0 o 1). max_tokens en torno a 8.000, también a medir.
> E. De acuerdo: adelanta a la Entrega 1 un subconjunto con los Ejemplos 1 y 2 más 3 o 4 casos, con sus campos esperados. scripts/spike/ SE VERSIONA en el fork; debe usar solo casos ficticios y leer la clave de una variable de entorno, nunca del repositorio. Ponlo en el documento y en CLAUDE.md.
> F. De acuerdo: documéntalo como riesgo aceptado, frenado por el límite de intentos. Reformula RF-29 como propones.
> G. De acuerdo: el margen va aparte, sin tocar la tabla del plan ni el total orientativo de 30 h.
>
> Tus dos detalles también: límite de intentos de códigos de invitación por dirección (5 fallidos en 15 minutos), y aclaraciones con el número de versión en la ruta, que debe ser la última; si no lo es, responde con conflicto.
>
> Puedes empezar a editar.

- **Contexto:** un prompt anterior, también redactado por Claude, había pedido a la sesión que no editara hasta recibir estas respuestas. La sesión respondió con siete puntos y dos detalles donde las propuestas chocaban con el documento; este mensaje los resuelve.
- **Resultado:** el documento se reescribió completo en la versión 1.1 y se aplicaron los 22 hallazgos. La sesión avisó además de una consecuencia de diseño: con el primer paso del recorte tal como estaba redactado, la sección de aclaraciones habría quedado siempre vacía. Se corrigió en un mensaje posterior, reordenando el recorte.
- **Ajuste humano:** el autor aprobó las propuestas por defecto salvo la del presupuesto, para la que decidió un margen de hasta 10 horas con un punto de control, y sustituyó el texto. Decidió también que `scripts/spike/` se versione en el fork.

**Prompt 3: comprobación final antes de congelar**

> haz una última lectura al documento en detalle y dime si ya tenemos un documento cerrado para ir al siguiente paso

- **Resultado:** la sesión encontró un error que ella misma había introducido en la versión 1.1 (el token CSRF se guardaba solo como hash, así que no se podía volver a entregar al recargar la página) y dos detalles menores. Tras corregirlos, una revisión más encontró cinco detalles menores, también aplicados. El documento quedó congelado en la versión 1.1.
- **Ajuste humano:** el autor repitió la revisión precisamente porque la IA había introducido un error al aplicar los cambios, y aceptó congelar el documento para no entrar en un bucle de revisiones.

---

## 10. Revisión humana externa

Esta revisión **no es un prompt**: la hizo una persona del equipo del autor, su *tech lead*, el 19 de octubre de 2026, sobre la versión 1.1 del documento de producto. Usó sus propias herramientas, que no se documentan aquí; por eso no hay prompts suyos. Se incluye porque es el ajuste humano de más peso de esta fase.

**Qué dijo, en resumen**
- **Valoración general:** diseño sólido y riguroso (reglas deterministas, una IA que solo asiste, reglas como datos, concurrencia tratada en serio y trazabilidad entre requisitos y pruebas).
- **Lo que sobra:** demasiada especificación de nivel de producción para un MVP de 30 horas, con el riesgo de gastar las horas en blindaje y documentación en lugar de en código que se vea. Recomendó aplicar el orden de recorte desde el principio, no como plan B.
- **Lo que falta:** escenarios Given/When/Then, un ejemplo trabajado de principio a fin, un glosario y una tabla única de errores. Señaló lo irónico de que faltaran criterios de aceptación en un producto cuyo propósito es precisamente ese.

**Qué aportó:** una versión del documento con esas cuatro piezas añadidas y un orden de construcción para implementar con IA, sin modificar el resto.

**Cómo se procesó**
1. **Claude Code, app de escritorio (`claude-opus-5-5`)** comparó su versión con la 1.1 (solo añadía contenido) y contrastó las piezas nuevas con el resto del documento. Compartió el diagnóstico de lo que faltaba y, en parte, el de lo que sobraba: precisar no cuesta horas, implementarlo todo sí. Encontró ocho errores en las piezas nuevas; entre ellos, que el texto exportado del ejemplo no era el que produce la plantilla, lo que destapó un problema real del diseño (cuestión 23 del documento).
2. El autor tomó tres decisiones (códigos de error 401, 403, 422 y 429; precedencia de `UNICO_REVISOR` en la autodecisión; construcción en dos oleadas) y la sesión de escritorio escribió la versión 1.2 con un script de sustituciones exactas.
3. **Claude Code, terminal (`claude-opus-5-5`)** analizó la versión 1.2 y encontró siete puntos más. Entre ellos, un riesgo de seguridad en el orden de las oleadas (limitar los intentos de inicio de sesión sin la dirección real del cliente habría bloqueado a todos los usuarios a la vez) y un criterio de aceptación propuesto por la IA que tomaba una decisión de producto que nadie había pedido. La propia sesión de terminal los aplicó con las decisiones del autor (seguridad del inicio de sesión en la primera oleada, mensajes de error genéricos y el revisor corrige ese criterio en el ejemplo).

**Ajuste humano:** el autor pidió una revisión a una persona con criterio técnico sobre un documento que ya había pasado varias revisiones con IA, e incorporó sus aportaciones como excepción a la congelación del documento. El resultado es la versión 1.2.
