import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8']
]);

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url || '/', 'http://localhost').pathname,
    );
  } catch {
    response.writeHead(400).end('Ruta no válida.');
    return;
  }

  const filePath = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(400).end('Ruta no válida.');
    return;
  }

  try {
    const body = await readFile(filePath);
    response
      .writeHead(200, {
        'Content-Type': contentTypes.get(extname(filePath)) || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      })
      .end(body);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      response.writeHead(404).end('No encontrado.');
      return;
    }

    console.error('No se pudo servir el archivo del cliente.', error);
    response.writeHead(500).end('Error interno.');
  }
});

const port = Number(process.env.CLIENT_PORT || 4173);
server.listen(port, '127.0.0.1', () => {
  console.log(`Task Manager disponible en http://127.0.0.1:${port}`);
});
