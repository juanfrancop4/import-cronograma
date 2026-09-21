# Cronograma Dinámico Multigrupo

**Autor:** Este proyecto es desarrollado por Juan Camilo Franco Perdomo.
**Institución:** Puesto al servicio de la Universidad de Ibagué.
**Versión:** 1.0
**Licencia:** Propiedad intelectual del autor. Uso y distribución autorizados exclusivamente para la Universidad de Ibagué.

---

## Contexto y Problemática

En la Universidad de Ibagué es frecuente que un docente tenga asignada la misma asignatura repartida en múltiples grupos. Esto genera varios retos operativos:

* **Mantenimiento repetitivo:** Actualizar fechas, enlaces de encuentros sincrónicos o grabaciones exige editar manualmente el HTML de cada aula virtual por separado.
* **Sesiones compartidas:** Cuando se unen varios grupos pequeños en un mismo encuentro sincrónico, el docente debe replicar el mismo enlace y la misma grabación en múltiples cursos.
* **Problemas de caché:** Los navegadores y Moodle suelen guardar archivos temporales, provocando que los estudiantes vean información desactualizada aunque el docente ya la haya cambiado.

---

## Solución Desarrollada

Esta herramienta establece una **fuente única de verdad** descentralizada, permitiendo que el docente gestione todo desde un solo punto sin tocar código:

* **Fácil diligenciamiento:** El docente llena un documento en Google Sheets con el cronograma.
* **Publicación en CSV:** La hoja de cálculo se publica como CSV, sirviendo como motor de datos.
* **Procesamiento dinámico (`littlebridge.js`):** El script externo descarga la información más reciente.
* **Bypass de Caché e Interceptor HTML:** Un componente incrustado en Moodle rompe la caché mediante marcas de tiempo únicas (`_cb`), transforma los datos en tiempo real y renderiza la tabla con los componentes visuales e identidad de **ÁVACO**.

---

## Arquitectura del Flujo

```text
[Google Sheets] ──(Publicado como CSV)──> [littlebridge.js] ──(alojado en Moodle)──>
                                                                    │
                                                                    ▼
                                          [Moodle: Etiqueta/Recurso HTML] (Bypass Caché + Render UI ÁVACO)
```

## ¿Cómo funciona `littlebridge.js`?

`littlebridge.js` es un archivo JavaScript independiente (no va incrustado en el HTML) que actúa como **puente** entre el Google Sheets publicado y la tabla que ve el estudiante en Moodle. Su lógica es sencilla:

1. Define en la constante `fullUrl` el enlace del CSV publicado desde Google Sheets ([littlebridge.js:3](littlebridge.js:3)).
2. Hace un `fetch` a ese enlace para descargar el contenido del CSV.
3. Si la respuesta falla (por ejemplo, el enlace ya no existe o el documento dejó de publicarse), lanza un error visible en la consola.
4. Si la respuesta es exitosa, imprime el texto del CSV con `console.log(csvText)`.

Ese último paso es la clave de la integración: el **Script 1** que va dentro de `Cronograma-moodle-code.html` intercepta las llamadas a `console.log` y, cuando detecta que el contenido impreso corresponde a un CSV con encabezados de cronograma (`Sesión,Fecha,Hora`), lo convierte en una tabla HTML y la inyecta en el contenedor `tabla-sesiones-container`. Por eso `littlebridge.js` debe cargarse **después** de que ese interceptor ya esté activo (por eso va en el segundo `<script>` del HTML, al final).

En resumen: `littlebridge.js` no dibuja nada por sí mismo, solo trae los datos; el HTML incrustado en Moodle es el que los transforma en la tabla visible.

---

## Instrucciones de Uso — Paso a Paso

### Paso 1: Crear y publicar el Google Sheets

1. Cree una hoja de cálculo en Google Sheets con las columnas: `Sesión`, `Fecha`, `Hora`, `Enlace de acceso` (u otras columnas según lo que necesite mostrar).
2. Vaya al menú **Archivo > Compartir > Publicar en la web**.
3. En el cuadro de diálogo, en el primer desplegable, **seleccione únicamente la hoja/pestaña específica** que contiene el cronograma (no "Todo el documento"). Esto evita publicar hojas auxiliares o de trabajo que no deben ser públicas.
4. En el segundo desplegable, seleccione el formato **Valores separados por comas (.csv)**.
5. Haga clic en **Publicar** y confirme.
6. Copie el enlace generado. Google genera un enlace largo con un identificador único, y su estructura siempre es de esta forma:

   ```
   https://docs.google.com/spreadsheets/d/e/[ID-ÚNICO-GENERADO-POR-GOOGLE]/pub?output=csv
   ```

   > ⚠️ **Lo importante no es el identificador (esa parte cambia para cada documento), sino que el enlace SIEMPRE debe terminar exactamente en:**
   > ```
   > .../pub?output=csv
   > ```
   > Si el enlace termina distinto (por ejemplo en `?output=html` o sin el parámetro `output`), no servirá para este proyecto. Cada docente debe generar y usar el enlace publicado de **su propio** Google Sheets; no reutilice enlaces de otros documentos, ya que en algún momento dejarán de estar disponibles.

### Paso 2: Configurar `littlebridge.js`

1. Abra el archivo [littlebridge.js](littlebridge.js) en un editor de texto.
2. Reemplace el valor `"INSERTE-AQUÍ-EL-ENLACE-DEL-CSV-PUBLICADO"` en la línea 3 por el enlace CSV que copió en el Paso 1:

   ```js
   const fullUrl = "https://docs.google.com/spreadsheets/d/e/[ID-ÚNICO-GENERADO-POR-GOOGLE]/pub?output=csv";
   ```

3. **Este archivo se debe modificar y guardar antes de subirlo a Moodle.** Si se sube sin editar (con el texto de marcador de posición), no habrá datos que mostrar.

### Paso 3: Subir `littlebridge.js` a Moodle y obtener su enlace

1. Ingrese al curso en Moodle y active el modo de edición.
2. Agregue el archivo `littlebridge.js` (ya editado) como un recurso de tipo **Archivo**.
3. **Oculte el recurso**, pero usando la opción **"Ocultar en la página del curso" / "Disponible pero no mostrado en la página del curso"** (según la versión de Moodle, suele llamarse "Ocultar pero disponible" o similar) — **no** use la opción que solo lo oculta a los estudiantes en el listado del curso ("Ocultar a los estudiantes"). Esta última puede bloquear la conexión: el navegador del estudiante no logra descargar el archivo aunque el HTML lo esté referenciando, porque Moodle sigue restringiendo el acceso directo al recurso.
4. Una vez guardado el recurso, obtenga la URL directa del archivo (clic derecho sobre el enlace del recurso > copiar dirección del enlace, o consultando el enlace del archivo desde el editor). Moodle genera automáticamente un enlace con esta estructura:

   ```
   https://[SU-CAMPUS-VIRTUAL].unibague.edu.co/pluginfile.php/[ID-CURSO]/mod_resource/content/[N]/littlebridge.js
   ```

   > ⚠️ **Lo importante no son los números intermedios** (`[ID-CURSO]`, `[N]`) — esos varían según el curso y la versión del recurso —, **sino que el enlace SIEMPRE debe terminar exactamente en:**
   > ```
   > .../littlebridge.js
   > ```
   > Si el nombre del archivo o la extensión no coinciden al final del enlace, el `<script src="...">` del Paso 4 no podrá cargar el archivo correcto.

### Paso 4: Insertar el componente HTML en Moodle

1. Abra el archivo [Cronograma-moodle-code.html](Cronograma-moodle-code.html) y copie todo su contenido.
2. Antes de pegarlo, ubique la etiqueta al final del archivo ([Cronograma-moodle-code.html:147](Cronograma-moodle-code.html:147)):

   ```html
   <script src="INSERTE-EL-ENLACE-DE-LA-UBICACIÓN-EN-MOODLE-DE-littlebridge.js"></script>
   ```

   y reemplace el marcador de posición por el enlace obtenido en el Paso 3.
3. En el curso de Moodle, agregue una **Etiqueta** (o un recurso de tipo página/HTML) y active el editor en modo de código fuente (`</>`).
4. Pegue el código HTML ya editado (con el enlace de `littlebridge.js` correspondiente a **ese** curso/aula).
5. Guarde los cambios.

> El mismo bloque HTML se puede reutilizar en todas las aulas virtuales del docente; solo cambia el enlace de `littlebridge.js` si cada grupo usa un archivo distinto, o se mantiene igual si varios grupos comparten el mismo cronograma.

---

## Beneficios Clave

* **Ahorro de tiempo pedagógico:** Un solo cambio en Google Sheets actualiza automáticamente todos los grupos asignados.
* **Actualización en tiempo real:** Garantía total de que el estudiante siempre verá la información vigente gracias al control de caché.
* **Cero mantenimiento técnico para el profesor:** No requiere conocimientos de HTML para mantener la información al día.
