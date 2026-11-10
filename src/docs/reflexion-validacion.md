# Reflexión EC1 F3 A4

**Nombre:** Jonathan Aaron Rivera Nevarez

## 1. ¿Qué diferencia existe entre validar el formato HTTP y proteger una regla del negocio?
El formato HTTP valida la estructura externa (encabezados, JSON sintácticamente correcto, tipos primarios). La regla del negocio valida que los datos sean coherentes con el dominio (p. ej., que una tarea exista antes de completarse).

## 2. ¿Por qué conviene usar `router.param` para validar el ID?
Porque ejecuta la validación automáticamente antes de llegar a cualquier controlador que utilice el parámetro `:id`, evitando código repetido en cada endpoint.

## 3. ¿Qué ventaja ofrece guardar datos normalizados en `res.locals`?
Garantiza que el controlador reciba datos completamente limpios (sin espacios extras, ya parseados a enteros) y validados sin necesidad de repetir validaciones.

## 4. ¿Cuándo corresponde responder 400 y cuándo 422?
`400 Bad Request` se usa para errores sintácticos (JSON malformado o ID no entero). `422 Unprocessable Entity` se usa cuando el JSON es sintácticamente correcto pero sus valores no cumplen con las reglas de validación (título vacío, tipo incorrecto).

## 5. ¿Por qué `notFound` delega el error en lugar de responder directamente?
Para reutilizar el middleware centralizado de errores, garantizando que las respuestas 404 mantengan la misma estructura JSON (`code`, `message`, `requestId`) que los demás errores.

## 6. ¿Qué información no debe enviarse al cliente en un error 500?
No se deben enviar detalles internos, trazas de pila (*stack traces*), ni información del servidor o base de datos. Se debe retornar un mensaje neutro y registrar el detalle internamente.

## 7. ¿Cómo ayuda `requestId` durante la depuración?
Permite vincular la respuesta devuelta al cliente con los registros (*logs*) del servidor para rastrear exactamente qué ocurrió en esa petición en particular.

## 8. ¿Qué prueba demuestra que la refactorización no rompió la API anterior?
Ejecutar las consultas exitosas (`GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks/:id`) y verificar que siguen respondiendo con códigos `200`, `201` y `204`.
