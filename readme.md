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

> Modelo previsto para PostgreSQL (con Prisma). Los nombres de entidades y atributos pueden ajustarse en el diseño detallado de la Entrega 2.

```mermaid
erDiagram
    EQUIPO ||--o{ MEMBRESIA : tiene
    USUARIO ||--o{ MEMBRESIA : pertenece
    USUARIO ||--o{ SESION : abre
    EQUIPO ||--o{ INVITACION : emite
    EQUIPO ||--o{ PETICION : recibe
    USUARIO ||--o{ PETICION : crea
    PETICION ||--|{ VERSION_PETICION : tiene
    VERSION_PETICION ||--|| ANALISIS : genera
    ANALISIS ||--o{ RESULTADO_REGLA : contiene
    VERSION_PETICION ||--o{ SUGERENCIA_IA : "recibe bajo demanda"
    USUARIO ||--o{ SUGERENCIA_IA : solicita
    VERSION_PETICION ||--o{ ACLARACION : recoge
    PETICION ||--o{ DECISION : recibe
    VERSION_PETICION ||--o{ DECISION : "es decidida en"
    USUARIO ||--o{ DECISION : toma
    PETICION ||--|{ TRANSICION : registra
    USUARIO ||--o{ TRANSICION : realiza

    EQUIPO {
        uuid id PK
        string nombre
    }
    USUARIO {
        uuid id PK
        string email UK
        string nombre
        string password_hash "Argon2id"
        datetime email_verificado_en "nullable, uso futuro"
    }
    MEMBRESIA {
        uuid id PK
        uuid usuario_id FK "unico junto con equipo_id"
        uuid equipo_id FK
        string rol "SOLICITANTE | REVISOR"
        datetime creada_en
    }
    SESION {
        uuid id PK
        string token_hash UK "solo el hash del token de sesion"
        uuid usuario_id FK
        uuid equipo_activo_id FK
        datetime creada_en
        datetime caduca_en
        datetime cerrada_en "nullable"
    }
    INVITACION {
        uuid id PK
        uuid equipo_id FK
        uuid creada_por FK
        string codigo UK "aleatorio, al menos 128 bits"
        string rol "SOLICITANTE | REVISOR"
        datetime caduca_en
        datetime usada_en "nullable"
        uuid usada_por FK "nullable"
    }
    PETICION {
        uuid id PK
        uuid equipo_id FK
        uuid autor_id FK
        string tipo "INCIDENCIA | CAMBIO"
        string origen "CORREO | REUNION | JIRA | OTRO"
        string estado "BORRADOR | LISTA_PARA_REVISION | DEVUELTA | ACEPTADA | RECHAZADA | CANCELADA"
        datetime creada_en
        datetime actualizada_en
        datetime enviada_en "nullable, ultimo envio a revision"
    }
    VERSION_PETICION {
        uuid id PK
        uuid peticion_id FK
        int numero "unico por peticion"
        string titulo
        text texto_origen "nullable, el texto en bruto es opcional"
        json campos "claves de campo estables, valores de texto"
        uuid creada_por FK
        datetime creada_en
    }
    ANALISIS {
        uuid id PK
        uuid version_id FK "unico"
        int puntuacion "0 a 100"
        string version_catalogo "hash del catalogo"
        datetime creado_en
    }
    RESULTADO_REGLA {
        uuid id PK
        uuid analisis_id FK
        string regla_codigo "copia estable"
        string regla_etiqueta "copia"
        string campo_clave "copia"
        string pregunta "copia de la plantilla"
        string severidad "copia"
        string estado "CUMPLE | NO_CUMPLE | NO_APLICA"
        string detalle
    }
    SUGERENCIA_IA {
        uuid id PK
        uuid version_id FK
        uuid solicitada_por FK
        string modo "AUTOR | REVISOR"
        string estado "OK | DESCARTADA"
        string motivo_descarte "nullable: RECHAZO, TRUNCADA, ESQUEMA_INVALIDO, TIEMPO_AGOTADO, ERROR"
        json contenido "nullable; solo si OK, ya validado contra el esquema"
        string proveedor "SIMULADO | ANTHROPIC"
        string modelo "nullable en el simulado"
        string version_prompt
        int tokens_entrada "nullable: simulado o tiempo agotado"
        int tokens_salida "nullable: simulado o tiempo agotado"
        datetime creada_en
    }
    ACLARACION {
        uuid id PK
        uuid version_id FK
        text pregunta
        text respuesta
        uuid creada_por FK
        datetime creada_en
    }
    DECISION {
        uuid id PK
        uuid peticion_id FK
        uuid version_id FK "version decidida"
        uuid revisor_id FK
        string resultado "ACEPTADA | DEVUELTA | RECHAZADA"
        text comentario "nullable; obligatorio al devolver y al rechazar"
        json salida_final "nullable; obligatoria al aceptar: titulo, descripcion, criterios"
        string motivo_autodecision "nullable: UNICO_REVISOR | PLAZO"
        datetime decidida_en
    }
    TRANSICION {
        uuid id PK
        uuid peticion_id FK
        string estado_origen "nullable al crear"
        string estado_destino
        uuid usuario_id FK
        uuid version_id FK "ultima version en ese momento"
        datetime creada_en
    }
```

### **3.2. Descripción de entidades principales:**

**Convenciones:**
- Todas las claves primarias son `uuid`.
- Un atributo es obligatorio (`NOT NULL`) salvo que se indique «nulo».
- `PK` es clave primaria, `FK` clave foránea y `UK` valor único.
- Los atributos con valores en mayúsculas (`rol`, `estado`…) solo admiten los valores indicados.

**Ideas que ordenan el modelo:**

- **La petición está separada de su contenido.** `PETICION` guarda la identidad y el estado. Cada guardado crea una `VERSION_PETICION` nueva con el contenido de ese momento, y cada versión tiene un único `ANALISIS` con el resultado de cada regla. Así hay historial, comparación entre versiones y trazabilidad.
- **Tablas de solo añadir.** `VERSION_PETICION`, `ANALISIS`, `RESULTADO_REGLA`, `SUGERENCIA_IA`, `ACLARACION`, `DECISION` y `TRANSICION` nunca se modifican ni se borran. En `PETICION` solo cambian `estado`, `actualizada_en` y `enviada_en`. Unos disparadores de PostgreSQL rechazarán `UPDATE` y `DELETE` en esas tablas. Si hay que recortar, son lo primero que se quita, y entonces la garantía queda en la capa de acceso a datos.
- **Aislamiento entre equipos.** Todos los datos de negocio cuelgan de un equipo, directamente (`equipo_id`) o a través de la petición. Todas las consultas parten del equipo activo de la sesión.
- **Las reglas no son tablas.** El catálogo de reglas (12 para incidencias y 11 para cambios) y el vocabulario de términos vagos viven como configuración tipada del backend, leída a través de una interfaz. Por eso `RESULTADO_REGLA` guarda una **copia** de la regla y no tiene clave foránea hacia ella: el historial no cambia aunque la regla cambie después.

**Entidades:**

| Entidad | Para qué sirve | Atributos y restricciones principales | Relaciones |
|---|---|---|---|
| `EQUIPO` | Unidad de aislamiento de datos | `nombre` | Tiene membresías, invitaciones y peticiones (1:N) |
| `USUARIO` | Persona registrada | `email` (`UK`); `nombre`; `password_hash` (Argon2id, nunca la contraseña); `email_verificado_en` (nulo, reservado para el futuro) | Pertenece a equipos mediante `MEMBRESIA`; abre sesiones; crea peticiones; solicita sugerencias; toma decisiones; realiza transiciones |
| `MEMBRESIA` | Relación N:M entre usuario y equipo, con rol | `usuario_id` (`FK`); `equipo_id` (`FK`); `rol` (`SOLICITANTE` o `REVISOR`); `creada_en`. La pareja (`usuario_id`, `equipo_id`) es única | N:1 con `USUARIO` y con `EQUIPO`. El esquema admite varias por usuario; el MVP aplica una por usuario |
| `SESION` | Sesión en el servidor | `token_hash` (`UK`; solo el hash, nunca el token); `usuario_id` (`FK`); `equipo_activo_id` (`FK` a `EQUIPO`); `creada_en`; `caduca_en` (8 horas tras el inicio, sin renovación); `cerrada_en` (nulo hasta cerrar sesión) | N:1 con `USUARIO`. El equipo activo es la membresía más antigua |
| `INVITACION` | Código para unirse a un equipo con un rol | `equipo_id` (`FK`); `creada_por` (`FK` a `USUARIO`); `codigo` (`UK`; aleatorio de al menos 128 bits); `rol`; `caduca_en`; `usada_en` y `usada_por` (nulos hasta usarse) | N:1 con `EQUIPO`. Se marca como usada en la misma transacción que crea el usuario y la membresía, con una actualización condicionada a que siga sin usar y sin caducar, para que no pueda usarse dos veces |
| `PETICION` | Identidad y estado de una petición | `equipo_id` (`FK`); `autor_id` (`FK` a `USUARIO`); `tipo` (`INCIDENCIA` o `CAMBIO`; no cambia tras crearla); `origen` (`CORREO`, `REUNION`, `JIRA` u `OTRO`); `estado` (los seis estados del flujo); `creada_en`; `actualizada_en`; `enviada_en` (nulo; último envío a revisión) | N:1 con `EQUIPO` y con su autor; 1:N con versiones (al menos una), decisiones y transiciones |
| `VERSION_PETICION` | Contenido de la petición en un momento dado | `peticion_id` (`FK`); `numero` (único por petición); `titulo` (hasta 120 caracteres); `texto_origen` (nulo; texto en bruto, hasta 10.000 caracteres); `campos` (JSON con las claves de campo del tipo y valores de texto); `creada_por` (`FK`); `creada_en` | N:1 con `PETICION`; 1:1 con `ANALISIS`; 1:N con sugerencias, aclaraciones y decisiones. Al guardar se indica el número sobre el que se trabaja: si ya existe uno posterior, se rechaza con un conflicto (409) |
| `ANALISIS` | Resultado de evaluar una versión con las reglas | `version_id` (`FK`, `UK`); `puntuacion` (entero de 0 a 100); `version_catalogo` (hash del catálogo de reglas usado); `creado_en` | 1:1 con `VERSION_PETICION`; 1:N con `RESULTADO_REGLA` |
| `RESULTADO_REGLA` | Resultado de una regla en un análisis | `analisis_id` (`FK`); copia de `regla_codigo`, `regla_etiqueta`, `campo_clave`, `pregunta` y `severidad`; `estado` (`CUMPLE`, `NO_CUMPLE` o `NO_APLICA`); `detalle` (explicación del resultado; formato y obligatoriedad por fijar) | N:1 con `ANALISIS`. Sin clave foránea a ninguna regla. La pregunta de plantilla que ve el solicitante es la de los resultados `NO_CUMPLE` |
| `SUGERENCIA_IA` | Cada llamada al proveedor de IA | `version_id` (`FK`); `solicitada_por` (`FK` a `USUARIO`); `modo` (`AUTOR` o `REVISOR`); `estado` (`OK` o `DESCARTADA`); `motivo_descarte` (nulo; rechazo, truncada, esquema inválido, tiempo agotado o error); `contenido` (JSON, nulo; solo si es `OK` y ya validado contra el esquema); `proveedor` (`SIMULADO` o `ANTHROPIC`); `modelo` (nulo en el simulado); `version_prompt`; `tokens_entrada` y `tokens_salida` (nulos en el simulado o si se agotó el tiempo); `creada_en` | N:1 con `VERSION_PETICION` y con el usuario que la pidió. Se guardan también las descartadas, porque sirven para medir el coste y aplicar los límites de uso |
| `ACLARACION` | Respuesta del solicitante a una pregunta adicional de la IA | `version_id` (`FK`); `pregunta`; `respuesta`; `creada_por` (`FK`); `creada_en` | N:1 con `VERSION_PETICION` (la última en el momento de responder). No crea una versión nueva |
| `DECISION` | Decisión del revisor | `peticion_id` (`FK`); `version_id` (`FK`; versión decidida); `revisor_id` (`FK` a `USUARIO`); `resultado` (`ACEPTADA`, `DEVUELTA` o `RECHAZADA`); `comentario` (nulo; obligatorio al devolver y al rechazar); `salida_final` (JSON, nulo; obligatorio al aceptar, con título, descripción y criterios, y es lo que se exporta); `motivo_autodecision` (nulo; `UNICO_REVISOR` o `PLAZO` cuando el revisor decide sobre su propia petición); `decidida_en` | N:1 con `PETICION`, con la versión decidida y con el revisor |
| `TRANSICION` | Registro de cada cambio de estado | `peticion_id` (`FK`); `estado_origen` (nulo al crear la petición); `estado_destino`; `usuario_id` (`FK`); `version_id` (`FK`; última versión en ese momento); `creada_en` | N:1 con `PETICION`, con el usuario y con la versión. Cada transición se aplica solo si la petición sigue en el estado de origen; si no, se rechaza con un conflicto y no se registra nada |

**Lo que no es una tabla en el MVP:** las definiciones de reglas y los términos vagos (configuración tipada) y las preguntas de plantilla, que son el campo `pregunta` de los resultados que no se cumplen.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

El MVP tiene siete historias (1.2): cinco imprescindibles (H1 a H5) y dos deseables (S1 y S2, la IA). Aquí se detallan las tres que forman el núcleo del producto: **H2, H3 y H4**. Los criterios de aceptación salen de los requisitos funcionales (RF-xx) y de los escenarios de [`docs/producto.md`](docs/producto.md), sección 21.

**Historia de Usuario 1**

**H2. Registrar una petición y ver qué le falta**

> **Como** solicitante, **quiero** registrar una petición y ver qué le falta, **para** saber qué completar antes de enviarla.

- **Prioridad:** imprescindible.
- **Contexto:** hoy las peticiones llegan incompletas y el equipo descubre lo que falta después, por correo o en reuniones. Esta historia adelanta ese momento: en cuanto se registra la petición, el solicitante ve qué datos necesita el equipo y cuáles faltan.
- **Incluye:**
  - alta con título (obligatorio, hasta 120 caracteres), tipo (incidencia o cambio), origen y texto en bruto (opcional, hasta 10.000 caracteres);
  - campos estructurados del tipo, en un formulario que se dibuja a partir de las definiciones de las reglas;
  - evaluación con las reglas del tipo, puntuación de completitud, una pregunta por cada regla no cumplida y avisos de términos vagos.
- **No incluye:** las sugerencias de la IA (historia deseable S1), cambiar el tipo después de crear la petición y los archivos adjuntos.
- **Depende de:** H1 (cuenta y equipo) y el catálogo de reglas.

**Criterios de aceptación:**

```gherkin
Escenario: Registrar una petición y ver qué le falta
  Dado un solicitante con sesión iniciada en su equipo
  Cuando crea una petición de tipo "cambio" con título, origen "jira" y un texto en bruto
  Entonces se crea en estado "borrador" con su primera versión y su análisis
  Y el panel muestra cada regla del tipo con su resultado (cumple, no cumple o no aplica)
  Y por cada regla que no se cumple se muestra su pregunta de plantilla
  Y la puntuación de completitud es visible, pero no basta por sí sola para enviar

Escenario: Crear una petición sin texto en bruto
  Dado un solicitante con sesión iniciada
  Cuando crea una petición con título, tipo y origen, pero sin texto en bruto
  Entonces se crea en "borrador" y puede rellenar los campos a mano

Escenario: Título ausente o demasiado largo
  Dado un solicitante con sesión iniciada
  Cuando intenta crear una petición sin título o con un título de más de 120 caracteres
  Entonces la petición no se crea y se le indica el error

Escenario: Término vago sin cifra
  Dada una versión con el campo "urgencia" igual a "lo antes posible"
  Cuando se evalúa
  Entonces se avisa del término vago en ese campo
  Pero la puntuación no cambia

Escenario: Término vago acompañado de una cifra
  Dada una versión con el campo "urgencia" igual a "urgente, antes del 30-11-2026"
  Cuando se evalúa
  Entonces no se avisa de ningún término vago en ese campo
```

- **Requisitos:** RF-05, RF-06, RF-09, RF-10, RF-11, RF-12, RF-27 y RF-30.

**Historia de Usuario 2**

**H3. Completar la petición y enviarla a revisión**

> **Como** solicitante, **quiero** completar mi petición, ver cómo mejora y enviarla a revisión cuando esté completa, **para** que el equipo la valore.

- **Prioridad:** imprescindible.
- **Contexto:** es el bucle de aclaración que hoy ocurre por correo. Cada respuesta del solicitante queda registrada como una versión nueva, de modo que se ve cómo mejora la petición, y el envío solo es posible cuando la petición cumple lo mínimo que el equipo necesita.
- **Incluye:**
  - responder a las preguntas rellenando los campos;
  - una versión nueva por cada guardado, evaluada de nuevo;
  - el historial de versiones con su puntuación;
  - el envío a revisión, que solo es posible si se cumplen todas las reglas obligatorias;
  - retirar la petición de revisión y cancelarla.
- **No incluye:** las preguntas adicionales de la IA y sus aclaraciones (historia deseable S1).
- **Depende de:** H2.

**Criterios de aceptación:**

```gherkin
Escenario: Responder a una pregunta crea una versión nueva
  Dada una petición en "borrador" cuya última versión es la 1 y tiene la regla de métrica sin cumplir
  Cuando el autor rellena la métrica de éxito y guarda indicando la versión 1
  Entonces se crea la versión 2, se evalúa de nuevo y la regla de métrica pasa a "cumple"
  Y el historial muestra la puntuación de las versiones 1 y 2

Escenario: Guardar sobre una versión que ya no es la última
  Dada una petición cuya última versión es la 3
  Cuando el autor guarda indicando la versión 2
  Entonces el guardado se rechaza con un conflicto (409) y no se crea ninguna versión

Escenario: No se puede enviar con una regla obligatoria sin cumplir
  Dada una petición cuya última versión tiene al menos una regla obligatoria en "no cumple"
  Cuando el autor intenta enviarla a revisión
  Entonces el envío se rechaza (422)
  Y la petición sigue en "borrador" o en "devuelta"

Escenario: Una petición completa pasa a revisión
  Dada una petición con todas las reglas obligatorias aplicables en "cumple"
  Cuando el autor la envía indicando el número de su última versión
  Entonces pasa a "lista para revisión"
  Y se registran la transición y la fecha de envío

Escenario: Retirar una petición de revisión
  Dada una petición en "lista para revisión"
  Cuando su autor la retira
  Entonces vuelve a "borrador" y puede editarla de nuevo
```

- **Requisitos:** RF-07, RF-17 (respuesta rellenando campos), RF-18, RF-19, RF-31 y RF-36.

**Historia de Usuario 3**

**H4. Revisar y decidir**

> **Como** revisor, **quiero** ver las peticiones enviadas y aceptarlas, devolverlas o rechazarlas con un comentario, **para** que solo entre trabajo claro.

- **Prioridad:** imprescindible.
- **Contexto:** el revisor es quien decide si una petición está lista para el equipo. Que una petición cumpla las reglas significa que tiene los datos, no que estén bien. Esa calidad la juzga una persona, que puede devolverla con un comentario, rechazarla o aceptarla y ajustar la redacción final.
- **Incluye:**
  - el listado de las peticiones del equipo que se han enviado alguna vez, con filtros por estado y tipo y el tiempo que llevan esperando;
  - la vista previa de la salida compuesta;
  - aceptar (con comentario opcional y la salida final editable), devolver o rechazar (con comentario obligatorio);
  - la autodecisión cuando el revisor es el único del equipo o la petición lleva más de 7 días sin decisión;
  - la protección frente a decidir sobre algo que ya no es lo que se vio.
- **No incluye:** los criterios de aceptación propuestos por la IA (historia deseable S2) y las preguntas libres del revisor al solicitante, que quedan fuera del MVP.
- **Depende de:** H3.

**Criterios de aceptación:**

```gherkin
Escenario: Devolver con comentario y corrección del autor
  Dada una petición en "lista para revisión"
  Cuando el revisor la devuelve con un comentario
  Entonces la petición pasa a "devuelta" y vuelve a ser editable por su autor
  Y el autor ve el comentario en el detalle
  Cuando el autor edita los campos y la reenvía
  Entonces vuelve a "lista para revisión"

Escenario: Devolver o rechazar sin comentario
  Dada una petición en "lista para revisión"
  Cuando el revisor intenta devolverla o rechazarla sin comentario
  Entonces la decisión se rechaza como entrada inválida y no se registra nada

Escenario: Aceptar con la salida final editada
  Dada una petición en "lista para revisión" que el revisor puede decidir
  Cuando la acepta editando el título, la descripción y los criterios de la salida
  Entonces la petición pasa a "aceptada"
  Y la salida final que se guarda es la editada, que es la que se exportará

Escenario: El único revisor del equipo decide su propia petición
  Dado un equipo con un solo revisor
  Y una petición propia de ese revisor en "lista para revisión"
  Cuando la acepta
  Entonces la decisión se guarda con el motivo de autodecisión "UNICO_REVISOR"

Escenario: Dos decisiones simultáneas sobre la misma petición
  Dada una petición en "lista para revisión"
  Cuando dos revisores deciden a la vez
  Entonces una decisión prospera
  Y la otra se rechaza con un conflicto (409) sin registrar nada

Escenario: Decidir tras una retirada y un reenvío sin versión nueva
  Dada una petición en "lista para revisión" en su versión 3, que el revisor está viendo
  Y su autor la retira, añade una aclaración (sigue en la versión 3) y la reenvía
  Cuando el revisor decide indicando la versión 3 y la fecha de envío que vio
  Entonces la decisión se rechaza con un conflicto (409) y no se registra nada

Escenario: Un revisor no ve los borradores ajenos que nunca se han enviado
  Dado un borrador de un solicitante que nunca se ha enviado a revisión
  Cuando un revisor del mismo equipo lo pide
  Entonces la respuesta es 404, como si no existiera
```

- **Requisitos:** RF-20, RF-21, RF-23, RF-34 y RF-36.

**Definición de hecho (común a las tres historias):**
- Los escenarios anteriores pasan como tests automáticos (de integración o E2E).
- Cada requisito de la historia está enlazado con al menos un test.
- El aislamiento entre equipos se comprueba en todas las rutas nuevas.
- Lo que el README afirma de la historia está verificado, no solo previsto.

---

## 6. Tickets de Trabajo

Tres tickets de la Entrega 2, uno por capa, que juntos hacen posibles H2 y H3. Siguen el orden de construcción previsto: primero los datos, después el motor de reglas y la API, y por último la interfaz. Las estimaciones son orientativas: salen del plan del documento (sección 15), que reserva unas 6 h al backend, incluida la base de datos, y unas 4 h al frontend.

**Ticket 1**

**[BD-1] Modelo de datos, migraciones y acceso con contexto de equipo**

- **Tipo:** base de datos.
- **Historias:** es el cimiento de todas; en especial H2 y H3.
- **Prioridad:** imprescindible; es lo primero que se construye junto con el motor de reglas.
- **Estimación:** parte de las 6 h de backend.
- **Depende de:** nada. **Bloquea:** BE-1 y el resto de la API.

**Descripción.** Crear con Prisma el esquema de la sección 3 en PostgreSQL, con sus migraciones versionadas, y una capa de acceso a datos que obligue a indicar siempre el equipo. Es la pieza que más cuesta cambiar cuando ya hay datos guardados, por eso se hace bien desde el principio.

**Tareas:**
1. Esquema de Prisma con las 13 entidades de la sección 3: tipos, claves primarias `uuid` y claves foráneas.
2. Restricciones de unicidad:
   - `USUARIO.email`, `SESION.token_hash` e `INVITACION.codigo`;
   - las parejas (`usuario_id`, `equipo_id`) en `MEMBRESIA` y (`peticion_id`, `numero`) en `VERSION_PETICION`;
   - `ANALISIS.version_id`, que es 1:1.
3. Enumeraciones con los valores cerrados de la sección 3: rol, tipo, origen, estado de la petición, resultado de la regla, modo y estado de la sugerencia, motivo de descarte, resultado de la decisión y motivo de autodecisión.
4. Migración inicial, que se aplica sobre una base de datos vacía.
5. Migración con los **disparadores de solo añadir**, que rechazan `UPDATE` y `DELETE` en las siete tablas de historial. Es lo primero que se recorta si falta tiempo; en ese caso, la garantía queda en la capa de acceso a datos.
6. Capa de acceso a datos (repositorios):
   - cada método recibe el equipo de la sesión como parámetro obligatorio;
   - las tablas de solo añadir no tienen métodos de modificación ni de borrado;
   - la invitación se marca como usada con una actualización condicionada a que siga sin usar y sin caducar, en la misma transacción que crea el usuario.
7. Base de datos de prueba para los tests de integración, con datos ficticios.

**Criterios de aceptación:**
- [ ] Las migraciones se aplican sobre una base de datos vacía y crean las 13 tablas con sus restricciones.
- [ ] Insertar dos versiones de la misma petición con el mismo número falla por la restricción de unicidad.
- [ ] Un `UPDATE` o un `DELETE` sobre cualquiera de las tablas de solo añadir falla. Si se recortan los disparadores, se comprueba en su lugar que la capa de acceso no ofrece esos métodos.
- [ ] Registrar dos usuarios con el mismo email falla por la restricción de unicidad.
- [ ] Un mismo código de invitación usado en dos registros simultáneos solo prospera una vez.
- [ ] Una consulta con el contexto del equipo A no devuelve nunca datos del equipo B, ni siquiera con un usuario que tenga membresías en los dos.

**Requisitos:** RF-04, RF-07, RF-24, RF-28, RF-29 y RF-36.

**Ticket 2**

**[BE-1] Motor de reglas y evaluación al guardar una versión**

- **Tipo:** backend.
- **Historias:** H2 y H3.
- **Prioridad:** imprescindible; es el núcleo del producto.
- **Estimación:** parte de las 6 h de backend.
- **Depende de:** BD-1. **Bloquea:** FE-1 y el envío a revisión.

**Descripción.** El motor de reglas decide qué le falta a una petición. Es una **función pura**: recibe los campos, las definiciones de las reglas y la fecha de referencia, y devuelve el resultado de cada regla, sin acceder a la red, al reloj ni a la IA. Alrededor del motor, la API guarda cada versión nueva y su análisis en una sola operación.

**Tareas:**
1. Catálogo por defecto como configuración tipada, leído a través de una interfaz: las 12 reglas de incidencia (RI-01 a RI-12) y las 11 de cambio (RC-01 a RC-11), con un hash del catálogo calculado al arrancar.
2. Las cinco comprobaciones de la sección 6.5 del documento:
   - `TEXTO`: mínimo de 10 caracteres y sin valores de relleno;
   - `CIFRA`: al menos un número escrito con dígitos;
   - `FECHA_ABSOLUTA`: formato AAAA-MM-DD y, si la regla lo indica, no futura;
   - `ENLACE`: solo http o https;
   - `OPCION`: solo valores de la lista.
3. Condición de aplicabilidad: una regla cuya condición no se cumple da «no aplica» y no cuenta.
4. Puntuación (obligatorias aplicables cumplidas entre obligatorias aplicables, de 0 a 100), condición de «completa» y avisos de términos vagos.
5. `POST /v1/peticiones`: crea la petición con su primera versión y su análisis.
6. `POST /v1/peticiones/:id/versiones`:
   - valida los campos;
   - comprueba que el número base es el último (si no, 409) y que el estado permite editar (si no, 409);
   - crea en una sola transacción la versión, el análisis y los resultados, cada resultado con una copia de su regla;
   - devuelve el análisis con los avisos.
7. `GET /v1/reglas?tipo=`: devuelve las definiciones que usa el frontend para dibujar el formulario.

**Criterios de aceptación:**
- [ ] Cada comprobación tiene tests unitarios con casos que cumplen y que no cumplen, incluida «no futura» con la fecha de referencia fijada en el test.
- [ ] Con los campos de la versión 2 del ejemplo del documento (2.4), el motor da 9 reglas obligatorias aplicables, 6 cumplidas y una **puntuación de 67**, con RC-07 «no aplica».
- [ ] El motor da el mismo resultado con una fuente de reglas en memoria distinta de la configuración, porque depende solo de la interfaz.
- [ ] Guardar sobre la última versión crea la siguiente con su análisis. Guardar sobre una versión anterior devuelve 409 y no crea nada.
- [ ] Una clave de campo desconocida o una opción fuera de la lista devuelven 400.
- [ ] Guardar en una petición aceptada, rechazada o cancelada devuelve 409.
- [ ] Una petición de otro equipo devuelve 404.
- [ ] Cada resultado guarda la copia de su regla y el análisis guarda el hash del catálogo.

**Fuera de este ticket:** la IA (S1 y S2), el envío a revisión y las decisiones.

**Requisitos:** RF-05, RF-06, RF-07, RF-09 a RF-12, RF-15 y RF-25 a RF-28.

**Ticket 3**

**[FE-1] Formulario dinámico y panel de reglas**

- **Tipo:** frontend.
- **Historias:** H2 y H3.
- **Prioridad:** imprescindible.
- **Estimación:** parte de las 4 h de frontend.
- **Depende de:** BE-1. Puede empezar contra una API simulada que devuelva definiciones y análisis de ejemplo.

**Descripción.** Pantalla de detalle y edición de una petición (pantalla 4 de 1.3). El formulario no está escrito campo a campo: se dibuja a partir de las definiciones que devuelve la API, con un componente por tipo de comprobación. Junto al formulario, un panel muestra el resultado de cada regla, su pregunta si no se cumple, la puntuación y los avisos de términos vagos.

**Tareas:**
1. Cliente de la API que envía el token de sesión en la cabecera `Authorization`.
2. Un componente por tipo de comprobación:
   - `TEXTO`: área de texto;
   - `CIFRA`: campo de texto;
   - `FECHA_ABSOLUTA`: campo de fecha, que admite también DD/MM/AAAA;
   - `ENLACE`: campo de URL;
   - `OPCION`: desplegable con las etiquetas de las opciones.
3. Formulario generado desde `GET /v1/reglas?tipo=`. Los campos cuya condición no se cumple se muestran como «no aplica».
4. Guardar con el número de la versión sobre la que se trabaja y mostrar el análisis devuelto.
5. Panel de reglas: resultado de cada regla, pregunta de plantilla de las no cumplidas, puntuación, avisos de términos vagos e indicador de «completa».
6. Gestión de errores:
   - 400: el error se muestra junto al campo;
   - 409: se avisa de que hay una versión más reciente y se ofrece recargarla;
   - 401: se vuelve al inicio de sesión.

**Criterios de aceptación:**
- [ ] Con las definiciones del tipo *cambio*, se dibujan sus 11 campos, cada uno con el componente de su comprobación.
- [ ] Al elegir «sí» en «¿Se puede medir el éxito con una cifra?», la métrica de éxito pasa a aplicar y el motivo para no medir pasa a «no aplica», y al revés al elegir «no».
- [ ] Tras guardar, el panel muestra la nueva puntuación y las preguntas de las reglas que siguen sin cumplirse.
- [ ] Un conflicto (409) no se presenta como un error genérico: el aviso dice que hay una versión más reciente.
- [ ] Los enlaces solo se muestran como enlace si son http o https, y ningún valor introducido por un usuario se inserta como HTML sin escapar.
- [ ] Tests de componentes para cada tipo de comprobación y el tramo correspondiente del recorrido E2E.

**Fuera de este ticket:** las sugerencias de la IA y su etiqueta «Simulado» (S1), la pantalla de revisión (H4) y la exportación (H5).

**Requisitos:** RF-06, RF-10, RF-11, RF-12 y RF-27.

**Definición de hecho (común a los tres tickets):**
- Los criterios de aceptación pasan como tests automáticos.
- La integración continua está en verde: tipos, lint y tests.
- Se cumple la definición de hecho de las historias (sección 5).
- El cambio llega en una pull request propia, que se documentará en la sección 7.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

