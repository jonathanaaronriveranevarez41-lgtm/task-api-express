# Reflexión sobre el CRUD Persistente

1. **¿Qué operación de Mongoose corresponde a cada letra de CRUD?**
   - Create: `TaskModel.create()`
   - Read: `TaskModel.find()` y `TaskModel.findById()`
   - Update: `TaskModel.findByIdAndUpdate()`
   - Delete: `TaskModel.findByIdAndDelete()`

2. **¿Por qué se usa PATCH y no un reemplazo completo del documento?**
   Porque PATCH permite actualizaciones parciales donde el cliente envía solo los campos que desea modificar (como `title` o `status`), manteniendo intactos los demás datos del documento.

3. **¿Qué problema evita $set?**
   Evita reemplazar o sobreescribir el documento completo en MongoDB, asegurando que únicamente se modifiquen los atributos especificados.

4. **¿Qué efecto tienen new: true y runValidators: true?**
   `new: true` hace que Mongoose devuelva el documento tras haber aplicado los cambios (en lugar de la versión anterior). `runValidators: true` garantiza que las validaciones del esquema de Mongoose se apliquen durante la actualización.

5. **¿Por qué un cuerpo vacío debe rechazarse?**
   Porque una solicitud PATCH debe contener al menos un campo válido a modificar; de lo contrario, representa una operación redundante o errónea.

6. **¿Qué diferencia existe entre INVALID_ID y TASK_NOT_FOUND?**
   `INVALID_ID` (400) indica que la cadena enviada no cumple con el formato hexadecimal de 24 caracteres de un ObjectId de MongoDB. `TASK_NOT_FOUND` (404) indica que el ObjectId es válido en formato pero no existe en la base de datos.

7. **¿Qué responsabilidad cumple validateTaskUpdate y cuál cumple TaskModel?**
   `validateTaskUpdate` actúa como la primera barrera a nivel de API HTTP (filtra campos no permitidos, valida tipos de entrada y rechaza cuerpos vacíos). `TaskModel` valida las reglas del esquema a nivel de persistencia en la base de datos.

8. **¿Cómo llega un error de updateTask al errorHandler de Express 5?**
   Al ser funciones asíncronas (`async/await`), Express 5 captura automáticamente cualquier excepción o rechazo de promesa dentro del controlador y lo transfiere al middleware centralizado de errores.

9. **¿Por qué DELETE responde 204 sin cuerpo?**
   El código de estado HTTP 204 (No Content) indica que la operación se realizó con éxito pero no hay contenido que devolver en el cuerpo de la respuesta.

10. **¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?**
    La prueba de reiniciar el proceso de Node.js (`pnpm dev`) y verificar que los datos creados o modificados previamente siguen existiendo al consultarlos desde MongoDB Atlas.
