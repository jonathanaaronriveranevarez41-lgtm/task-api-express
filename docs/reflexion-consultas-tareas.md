# Reflexión sobre Consultas, Paginación y Repositorios

1. **¿Qué responsabilidad nueva cumple `task.repository.ts`?**
   Encapsula todas las operaciones de acceso a datos con Mongoose (`find`, `countDocuments`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`), aislando la lógica de base de datos del servicio.

2. **¿Por qué el middleware debe validar `req.query` antes del controlador?**
   Para garantizar que la entrada del usuario sea segura, limpia y cumpla con las reglas antes de ejecutar cualquier lógica de negocio o consulta a la base de datos, respondiendo con `422` ante parámetros inválidos.

3. **¿Cómo se calcula `skip` para una página determinada?**
   Mediante la fórmula `(page - 1) * limit`, la cual determina cuántos documentos se deben omitir para mostrar el segmento correspondiente a la página solicitada.

4. **¿Por qué `find` y `countDocuments` deben usar el mismo filtro?**
   Para asegurar que el conteo total (`total`) y las páginas totales (`totalPages`) correspondan exactamente al subconjunto filtrado y no al total general de la colección.

5. **¿Qué problema evita `escapeRegex`?**
   Evita que caracteres especiales ingresados en la búsqueda por el usuario rompan la expresión regular o alteren el comportamiento de la consulta en MongoDB.

6. **¿Por qué `sortBy` utiliza una lista permitida?**
   Para prevenir ataques de inyección o consultas arbitrarias sobre campos inexistentes o sensibles de la base de datos.

7. **¿Qué diferencia existe entre `data.length`, `meta.total` y `meta.totalPages`?**
   `data.length` es el número de elementos devueltos en la página actual; `meta.total` es la cantidad total de documentos que coinciden con el filtro; y `meta.totalPages` es el número total de páginas disponibles según el límite establecido.

8. **¿Cómo llega un error asíncrono del repositorio al `errorHandler` de Express 5?**
   Gracias a Express 5, las promesas rechazadas en funciones asíncronas se capturan automáticamente y se desvían al middleware centralizado de errores.

9. **¿Qué prueba demuestra que A8 no rompió el CRUD de A7?**
   La ejecución de las pruebas de regresión (crear, consultar por id, actualizar, completar y eliminar), confirmando que las rutas heredadas continúan respondiendo con los códigos HTTP y contratos esperados.

10. **¿Qué limitación tiene la paginación basada en `skip` cuando la colección crece mucho?**
    A medida que la página solicitada es más lejana, MongoDB debe escanear y omitir un número mayor de documentos en disco, lo que reduce el rendimiento de la consulta.
