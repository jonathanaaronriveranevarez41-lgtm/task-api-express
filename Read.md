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

## Despliegue en Render

Este repositorio contiene la API; no incluye el directorio `client` necesario
para publicar un sitio estático. Crea el servicio de la API con el Blueprint
`render.yaml` desde Render.

Antes del primer despliegue, configura `MONGODB_URI` en el servicio con la URI
de conexión de MongoDB Atlas y asegúrate de que Atlas permita las conexiones
salientes del servicio de Render. Render genera `JWT_SECRET` automáticamente
y proporciona `RENDER_EXTERNAL_URL` para la URL pública de la API.

Comprueba el servicio en `https://<tu-servicio>.onrender.com/health`. Si luego
conectas un cliente web alojado en otro dominio, configura `CORS_ORIGIN` con
el origen HTTPS de ese cliente.
