# Pruebas de Validación y Manejo de Errores

| Caso | Método y Ruta | Datos enviados | Esperado | Obtenido | Code / Mensaje | Resultado |
|---|---|---|---|---|---|---|
| ID no numérico | GET /api/tasks/abc | No aplica | 400 | 400 | INVALID_ID | Aprobada |
| Tarea no existe | GET /api/tasks/999 | No aplica | 404 | 404 | TASK_NOT_FOUND | Aprobada |
| Sin Content-Type | POST /api/tasks | Text/Plain | 415 | 415 | UNSUPPORTED_MEDIA_TYPE | Aprobada |
| Título vacío | POST /api/tasks | `{"title": ""}` | 422 | 422 | VALIDATION_ERROR | Aprobada |
| Título numérico | POST /api/tasks | `{"title": 123}` | 422 | 422 | VALIDATION_ERROR | Aprobada |
| JSON malformado | POST /api/tasks | `{"title":` | 400 | 400 | INVALID_JSON | Aprobada |
| Ruta inexistente | GET /api/desconocido | No aplica | 404 | 404 | ROUTE_NOT_FOUND | Aprobada |
| Prueba 500 | GET /debug/error | No aplica | 500 | 500 | INTERNAL_ERROR | Aprobada |
