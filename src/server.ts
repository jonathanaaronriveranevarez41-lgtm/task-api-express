import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>API Express - GIFs</title>
      <style>
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          background: linear-gradient(-45deg, #0f172a, #2b1055, #5b21b6, #1e1b4b);
          background-size: 400% 400%;
          animation: gradientAnimation 12s ease infinite;
          color: #ffffff;
          padding: 40px;
          min-height: 100vh;
          margin: 0;
          box-sizing: border-box;
        }

        h1 {
          font-size: 2.5rem;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
          margin-bottom: 10px;
        }

        p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        code {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        .gif-link {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .gif-link:hover {
          transform: scale(1.05);
        }

        img {
          border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          width: 380px;
          height: 240px;
          object-fit: cover;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h1>¡Servidor Express Activo! 🎉</h1>
      <p>Tu API está funcionando en <code>http://localhost:${PORT}</code></p>
      <p style="font-size: 0.95rem; opacity: 0.75;">Haz clic en cualquier GIF para abrirlo en Giphy</p>

      <div class="grid">
        <a class="gif-link" href="https://giphy.com/gifs/3o7TKSjRrfIPjeiVyM" target="_blank" rel="noopener noreferrer">
          <img src="https://i.giphy.com/3o7TKSjRrfIPjeiVyM.gif" alt="Programando" />
        </a>
        <a class="gif-link" href="https://giphy.com/gifs/26ufdipQqU2lhNA4g" target="_blank" rel="noopener noreferrer">
          <img src="https://i.giphy.com/26ufdipQqU2lhNA4g.gif" alt="Éxito" />
        </a>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/gifs', (req, res) => {
  res.json({
    estado: 'exito',
    datos: [
      {
        id: 1,
        titulo: 'Programando',
        gif: 'https://i.giphy.com/3o7TKSjRrfIPjeiVyM.gif',
        pagina: 'https://giphy.com/gifs/3o7TKSjRrfIPjeiVyM'
      },
      {
        id: 2,
        titulo: 'Éxito',
        gif: 'https://i.giphy.com/26ufdipQqU2lhNA4g.gif',
        pagina: 'https://giphy.com/gifs/26ufdipQqU2lhNA4g'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
