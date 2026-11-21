## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Javier Sánchez

### **0.2. Nombre del proyecto:**

**Umbral**: *Unclear Messages Become Ready, Actionable and Listed* 

### **0.3. Descripción breve del proyecto:**

Herramienta web para que un equipo de desarrollo reciba peticiones completas. Comprueba con reglas deterministas qué le falta a cada petición, pregunta al solicitante hasta completarla y la pasa a un revisor, que la acepta y la exporta como texto listo para Jira. Una IA opcional ayuda con sugerencias, pero nunca decide si una petición está completa.

### **0.4. URL del proyecto:**

No hay despliegue público: el sistema se ejecutará en local con Docker Compose (ver 1.4). La evidencia de funcionamiento (capturas o vídeo) se aportará en la entrega final.

### 0.5. URL o archivo comprimido del repositorio

[github.com/jsgimenezia/AI4Devs-finalproject](https://github.com/jsgimenezia/AI4Devs-finalproject), repositorio público. Esta entrega está en la rama `feature/entrega-1-JSG`.

---

## 1. Descripción general del producto

> **Estado:** la Entrega 1 es solo documentación. Todo lo que describe este README está **previsto**, no implementado, salvo la medición de la IA, que sí se hizo. La especificación completa está en [`docs/producto.md`](docs/producto.md), que es la fuente de verdad del producto.

### **1.1. Objetivo:**

**El problema.** En los equipos que desarrollan software, las peticiones llegan por varias vías (el gestor de tareas, el correo, las reuniones), con formatos desiguales y con información que falta. El equipo pide aclaraciones una y otra vez, las estimaciones salen mal y el trabajo empieza con una idea difusa de lo que se quiere. Todo debería acabar en el gestor de tareas, pero muchas veces hay que reconstruir el contenido.

Dos ejemplos ficticios del tipo de petición que llega:

- *Un correo:* «Desde anteayer por la tarde baja cada día el número de solicitudes que se completan, mientras sube el de las que se inician. Me lo ha comentado el responsable del área.» No hay cifras, ni fechas absolutas, ni pantalla afectada, ni urgencia.
- *Un ticket:* título «Botón recuperar contraseña como secundario» y una descripción que pide que el secundario sea el botón de **iniciar sesión sin contraseña**. El título contradice a la descripción, no hay métrica de éxito y no hay diseño.

**Qué hace Umbral.** Automatiza lo que hoy se hace a mano: pedir siempre los mismos datos, de forma consistente y sin depender de la memoria de quien revisa. El solicitante pega el texto en bruto y elige el tipo de petición. La herramienta comprueba con reglas si están los datos que el equipo necesita, pregunta por cada uno que falte y no deja enviar la petición a revisión hasta que está completa. Un revisor la acepta, la devuelve o la rechaza, y la petición aceptada se exporta como historia de usuario o ticket de investigación.

**Para quién.** Para equipos que desarrollan un producto de software, de cualquier sector. Hay dos roles:

- **Solicitante:** quien pide el trabajo. Crea la petición, la completa y responde a las preguntas.
- **Revisor:** quien decide si la petición está lista para el equipo. También administra el equipo e invita a sus miembros.

**El valor.** No está en que una IA critique un texto, algo que ya se puede hacer con un chat, sino en tres cosas:

1. un **bucle de aclaración** entre solicitante y equipo, que hoy se hace por correo o en reuniones;
2. **reglas explícitas y comprobables**, que dan siempre el mismo resultado y están pensadas para adaptarse a cada equipo más adelante;
3. el **historial** de cómo mejora cada petición, versión a versión.

**La IA asiste, no decide.** Si una petición está completa lo deciden las reglas y, al final, una persona. La IA solo propone, y todo lo que propone es una sugerencia editable. Sin IA, la herramienta funciona igual, rellenando los campos a mano.

### **1.2. Características y funcionalidades principales:**

**Funcionalidades:**

1. **Cuentas y equipos.** Quien se registra crea un equipo y queda como revisor. Después invita a otras personas con un código de un solo uso que lleva asociado el rol. La sesión se guarda en el servidor y caduca a las 8 horas.
2. **Alta de una petición.** Título, tipo (*incidencia o anomalía*, o *cambio o mejora*), origen (correo, reunión, Jira u otro) y, si se tiene, el texto en bruto.
3. **Campos estructurados por tipo.** Cada tipo tiene sus campos: qué se observa, valores actual y de referencia, fecha de inicio, alcance, comportamiento actual y deseado, motivo, métrica de éxito, enlace a diseño… Los formularios se dibujan a partir de las definiciones de las reglas, no campo a campo. Se usan enlaces, no archivos adjuntos.
4. **Evaluación con reglas deterministas.** Doce reglas para incidencias y once para cambios, cada una sobre un campo y con una comprobación de un conjunto cerrado: texto obligatorio, contiene una cifra, fecha absoluta, enlace válido u opción de una lista. Da una **puntuación de completitud** visible y avisa de términos vagos («lo antes posible», «mejorar») cuando no van acompañados de una cifra.
5. **Preguntas y bucle de aclaración.** Por cada regla que no se cumple, una pregunta de plantilla. El solicitante responde rellenando el campo, y cada guardado crea una **versión nueva** que se vuelve a evaluar. El historial muestra cómo evoluciona la puntuación.
6. **Umbral de envío.** La petición solo puede enviarse a revisión cuando cumple todas las reglas obligatorias. La puntuación informa, pero lo que decide es esa condición.
7. **Revisión.** El revisor acepta, devuelve con un comentario (y la petición vuelve a ser editable) o rechaza con un comentario. Antes de aceptar puede editar la salida final. Un revisor no decide sobre sus propias peticiones, salvo que sea el único revisor del equipo o que lleven más de 7 días sin decisión.
8. **Salida y exportación.** Una plantilla determinista compone una **historia de usuario** (para los cambios) o un **ticket de investigación** (para las incidencias), que se exporta como texto listo para pegar en Jira.
9. **Asistencia con IA (opcional).** En **modo autor**, propone valores para los campos a partir del texto, preguntas adicionales, un título y un aviso si el título y el texto se contradicen. En **modo revisor**, propone criterios de aceptación o hipótesis. Todo se muestra como sugerencia y nunca se aplica solo. Sin clave, funciona con un **proveedor simulado**, marcado como «Simulado» en la interfaz. El proveedor real es Anthropic, con el modelo `claude-sonnet-5-5`, elegido midiendo varios modelos: ninguno inventó cifras ni fechas (detalle en `docs/producto.md`, 12.2).
10. **Aislamiento y permisos.** Cada equipo solo ve sus datos. Dentro del equipo, un solicitante solo ve sus peticiones, y un revisor ve además las del equipo que se han enviado a revisión.

**Historias del MVP.** El alcance se organiza en cinco historias imprescindibles y dos deseables:

| Id | Historia | Prioridad |
|---|---|---|
| H1 | Crear el equipo e invitar a otras personas con un rol | Imprescindible |
| H2 | Registrar una petición y ver qué le falta | Imprescindible |
| H3 | Completarla, ver cómo mejora y enviarla a revisión | Imprescindible |
| H4 | Revisar las peticiones enviadas y aceptarlas, devolverlas o rechazarlas | Imprescindible |
| H5 | Exportar una petición aceptada como texto listo para Jira | Imprescindible |
| S1 | Recibir de la IA propuestas de campos y preguntas | Deseable |
| S2 | Recibir de la IA criterios de aceptación o hipótesis | Deseable |

Las dos deseables son la IA. Como la herramienta funciona completa sin ella, pueden recortarse enteras si el plan se tuerce, sin tocar las imprescindibles. Las historias H2, H3 y H4 se detallan en la sección 5.

**Fuera del MVP:** integración directa con la API de Jira, archivos adjuntos, reglas personalizadas por equipo, notificaciones y panel de métricas.

### **1.3. Diseño y experiencia de usuario:**

> La interfaz se construye en la Entrega 2, así que aquí no hay capturas ni vídeo. Se describe el flujo de pantallas previsto. Las capturas y el vídeo del sistema funcionando llegarán en la entrega final.

**Pantallas previstas:**

1. **Acceso:** registro (nombre, email, contraseña y nombre del equipo), inicio de sesión y registro con un código de invitación.
2. **Listado de peticiones:** filtros por estado y tipo, con un indicador de «con carencias» o «completa».
3. **Nueva petición:** título, tipo, origen y texto en bruto (opcional).
4. **Detalle y edición:** formulario por campos, panel de reglas con su resultado y la puntuación, avisos de términos vagos, sugerencias de la IA (para aceptarlas o ignorarlas), decisiones con su comentario, y botones de guardar, enviar, retirar o cancelar.
5. **Historial de versiones:** evolución de la puntuación y de las reglas que fallaban.
6. **Revisión:** vista previa de la salida, petición de criterios a la IA, edición de la salida final y decisión con comentario.
7. **Exportación:** texto listo para copiar.
8. **Invitaciones** (revisor): generar códigos y ver su estado.

**Recorrido típico**, con el ticket del ejemplo de 1.1:

1. El solicitante pega el ticket, elige el tipo *cambio* y pide ayuda a la IA. La IA propone los campos que encuentra en el texto y avisa de que el título contradice a la descripción. El solicitante acepta parte de la propuesta, incluido un título corregido.
2. Las reglas muestran lo que falta: métrica de éxito, alcance y enlace al diseño. La puntuación es 67 y la petición no se puede enviar.
3. El solicitante responde a las tres preguntas («+15% de recuperaciones de contraseña en 30 días», «Pantalla de login, web y móvil» y el enlace al diseño). La puntuación sube a 100 y la envía a revisión.
4. Un revisor abre la vista previa, pide a la IA criterios de aceptación y corrige uno que tomaba una decisión de producto que nadie había pedido. Después acepta.
5. La petición aceptada se exporta como historia de usuario lista para pegar en Jira.

**Principios de la experiencia:**

- Lo que propone la IA siempre se ve como sugerencia, nunca como un dato.
- Cada pregunta dice qué falta y por qué.
- La puntuación es visible, pero lo que permite enviar es cumplir las reglas obligatorias.

### **1.4. Instrucciones de instalación:**

> **Previsto, no verificado:** todavía no hay código. Estas instrucciones describen cómo se pondrá en marcha el proyecto y se completarán en la Entrega 2. La guía definitiva se comprobará en un directorio limpio antes de la entrega final.

**Requisitos:** Git, y Docker con Docker Compose. Node.js solo hará falta para desarrollar sin contenedores; las versiones concretas se fijarán al crear el código.

**Puesta en marcha prevista:**

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/jsgimenezia/AI4Devs-finalproject.git
   cd AI4Devs-finalproject
   ```

2. Copiar el archivo de ejemplo de variables de entorno, que estará versionado, y ajustarlo si hace falta. **No hace falta ninguna clave de IA**: sin ella, la aplicación usa el proveedor simulado.
3. Levantar todo con `docker compose up`. Arranca la base de datos (PostgreSQL), el backend (NestJS), el frontend (React) y el proxy de entrada, que da un único punto de acceso desde el navegador.
4. Abrir en el navegador la dirección del proxy de entrada.

**Pendiente de definir en la Entrega 2:**

- el puerto de acceso;
- cómo se aplican las migraciones de la base de datos;
- los comandos para ejecutar los tests.

**Opciones:**

- **IA real:** definir `ANTHROPIC_API_KEY` en el entorno. La clave nunca se guarda en el repositorio.
- **Datos de demostración:** una variable de entorno activará la carga de un equipo ficticio, con dos revisores, un solicitante y tres peticiones en estados distintos. Las credenciales de prueba y los flujos que hay que verificar estarán en este README desde la Entrega 2.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

