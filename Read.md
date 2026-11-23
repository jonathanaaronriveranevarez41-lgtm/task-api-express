# Programación Backend con Frameworks

Proyecto inicial para configurar el entorno de desarrollo.

## Requisitos

- Node.js
- NPM
- Visual Studio Code
- Git

## Ejecución

```bash
npm start
```

Para desarrollar el cliente web mientras la API corre en `localhost:3000`:

```bash
pnpm client:dev
```

El cliente estará disponible en `http://127.0.0.1:4173`.

## Despliegue en Render

El Blueprint `render.yaml` despliega la API y el cliente web. Configura
`MONGODB_URI` en el servicio de la API con la URI de MongoDB Atlas y permite
las conexiones salientes de Render en la lista de acceso de red de Atlas.
Render genera `JWT_SECRET` automáticamente.

El cliente usa `VITE_API_URL` para conectarse a la API; `PUBLIC_API_URL` y
`CORS_ORIGIN` en la API usan los dominios HTTPS de Render de este proyecto.

Verifica la API en `https://task-api-web-jonathan.onrender.com/health` y abre
el cliente en `https://task-client-web-jonathan.onrender.com`.
