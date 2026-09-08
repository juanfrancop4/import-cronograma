# Cronograma Dinámico Multigrupo

**Autor:** [Tu Nombre / Desarrollador]  
**Institución:** Universidad de Ibagué  
**Ecosistema:** ÁVACO / Moodle  
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
[Google Sheets] ──(Publicado como CSV)──> [littlebridge.js]
                                              │
                                              ▼
[Moodle: Etiqueta HTML] <──(Bypass Caché + Render UI ÁVACO)
```

## Instrucciones de Uso (Para Docentes)

### 1. Preparar el origen de datos
1. Diligencie la plantilla de Google Sheets con las columnas: `Sesión`, `Fecha`, `Hora`, `Enlace de acceso`.
2. Vaya a **Archivo > Compartir > Publicar en la web**.
3. Seleccione la pestaña correspondiente y elija el formato **Valores separados por comas (.csv)**.

### 2. Insertar en Moodle
1. Ingrese al curso en Moodle y active el modo de edición.
2. Agregue una **Etiqueta** o recurso HTML.
3. Abra el editor en modo de código fuente (`</>`) y pegue el código del componente.
4. Guarde los cambios. *(El mismo código se puede pegar en las aulas de todos los grupos del docente)*.

---

## Beneficios Clave

* **Ahorro de tiempo pedagógico:** Un solo cambio en Google Sheets actualiza automáticamente todos los grupos asignados.
* **Actualización en tiempo real:** Garantía total de que el estudiante siempre verá la información vigente gracias al control de caché.
* **Cero mantenimiento técnico para el profesor:** No requiere conocimientos de HTML para mantener la información al día.