
## 1. Arquitectura Modular y Separación de Responsabilidades

### ¿Cuál es la responsabilidad principal de cada capa dentro de la estructura modular desarrollada?
- **Controllers (`src/controllers`):** Actúan como la interfaz de entrada HTTP. Reciben la petición (`req`), extraen los datos (cuerpo o parámetros), invocan los servicios correspondientes y retornan la respuesta HTTP adecuada (`res`).
- **Services (`src/services`):** Contienen las reglas de negocio de la aplicación. Gestionan la lógica de consulta, creación, actualización y eliminación de tareas, lanzando errores de dominio cuando corresponde.
- **Routes (`src/routes`):** Mapean los endpoints (métodos HTTP y rutas URI) asignando cada endpoint a su controlador específico.
- **Middlewares (`src/middlewares`):** Interceptan peticiones y respuestas para aplicar lógica transversal, como la captura y formateo centralizado de errores (`errorHandler`).
- **Errors (`src/errors`):** Proveen clases personalizadas como `AppError` para manejar excepciones con mensajes claros y códigos de estado HTTP dinámicos (400, 404, 500).
- **Models & Data (`src/models` y `src/data`):** Definen las interfaces de datos TypeScript (como `Task`) y gestionan la colección de tareas persistida en memoria.

---

## 2. Configuración y Módulos de Node.js (ESM)

### ¿Por qué se debe incluir la extensión `.js` en las importaciones si los archivos fuente son de extensión `.ts`?
Al trabajar con **NodeNext** / **Node16** en `tsconfig.json` y `"type": "module"` en `package.json`, TypeScript cumple estrictamente con la especificación nativa de ECMAScript Modules (ESM) de Node.js. En tiempo de ejecución con `tsx` o `node`, las rutas de los módulos requieren extensiones explícitas. Puesto que TypeScript compilará a `.js`, la especificación exige importar usando `.js` en lugar de `.ts`.

---

## 3. Manejo de Códigos de Estado HTTP

### ¿Qué código de estado HTTP debe responder cada una de las siguientes operaciones y por qué?
- **`GET /api/v1/tasks`:** `200 OK` — Operación de lectura exitosa.
- **`POST /api/v1/tasks`:** `201 Created` — Confirmación de creación de un nuevo recurso.
- **`PATCH /api/v1/tasks/:id/title`:** `200 OK` — Modificación exitosa del título de la tarea.
- **`DELETE /api/v1/tasks/:id`:** `204 No Content` — Eliminación exitosa del recurso sin contenido en la respuesta.
- **Petición con ID inexistente o ID inválido:** `404 Not Found` (recurso no encontrado) o `400 Bad Request` (parámetro inválido).

---

## 4. Separación de Archivos Base

### ¿Por qué es recomendable separar la instancia de Express (`app.ts`) del archivo de arranque del servidor (`server.ts`)?
- **`app.ts`:** Configura el framework Express, los middlewares y la definición de rutas sin iniciar la escucha en puerto red.
- **`server.ts`:** Importa la instancia `app` y ejecuta `app.listen()` en el puerto configurado (ejemplo: 3000).
- **Ventaja principal:** Permite realizar pruebas unitarias y de integración sobre la API utilizando herramientas como Supertest sin necesidad de abrir un puerto de red en cada prueba.

---

## 5. Control de Versiones e Integración Continua (Git / GitHub)

### ¿Cómo se resuelven los conflictos de fusión (*merge conflicts*) al conectar un proyecto local con un repositorio remoto que posee archivos iniciales?
1. Se limpia el archivo `package.json` conservando la configuración de scripts y dependencias requeridas por el proyecto local (`HEAD`).
2. Se consolida el archivo `.gitignore` eliminando las marcas de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`) y preservando la exclusión de carpetas como `node_modules/` y `dist/`.
3. Se confirman los cambios con `git add .` y `git commit -m "fix: resolver conflictos de merge"`.
4. Se sincroniza con la rama remota ejecutando `git push -u origin main` (o `git push -u origin main --force` si se trata de un reemplazo total inicial).
