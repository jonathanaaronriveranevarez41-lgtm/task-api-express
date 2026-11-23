import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(sourceDirectory, 'dist');
const apiUrl = (
  process.env.VITE_API_URL || 'https://task-api-web-jonathan.onrender.com'
).trim().replace(/\/+$/, '');

let parsedApiUrl;
try {
  parsedApiUrl = new URL(apiUrl);
} catch {
  throw new Error('VITE_API_URL debe ser una URL absoluta válida.');
}

if (
  (parsedApiUrl.protocol !== 'http:' && parsedApiUrl.protocol !== 'https:') ||
  parsedApiUrl.username ||
  parsedApiUrl.password
) {
  throw new Error('VITE_API_URL debe ser una URL HTTP(S) sin credenciales.');
}

await mkdir(outputDirectory, { recursive: true });

for (const file of ['index.html', 'styles.css', 'app.js']) {
  await copyFile(
    resolve(sourceDirectory, file),
    resolve(outputDirectory, file),
  );
}

await writeFile(
  resolve(outputDirectory, 'config.js'),
  `window.TASK_API_URL = ${JSON.stringify(apiUrl)};\n`,
);
