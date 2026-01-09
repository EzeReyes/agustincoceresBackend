import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
dotenv.config();
import typeDefs  from './db/schema.js';
import resolvers from './db/resolvers/resolver.js';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import conectarDB from './config/db.js';
import { expressMiddleware } from '@as-integrations/express5';
import { generarURLTemporal, validarToken } from './helpers/urlTemporal.js';
import MembresiaCliente from './models/MembresiaCliente.js';
conectarDB();
import path from 'path';



const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

  // Iniciar el servidor Apollo
await server.start();

app.use(express.json()); // 👈 en lugar de express.json()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
    credentials: true
  })
);

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res }) // ✅ esto es lo que faltaba
  })
);


// Endpoint para generar URL temporal
app.post('/api/url-temporal/:videoId', (req, res) => {
  const { videoId } = req.params;
  const userId = req.query.userId || 'anon';
  const nombreCurso = req.body.nombre || 'Curso Desconocido';
  const descripcionCurso = req.body.descripcion || 'Sin descripción';
  const infoCurso = req.body.info || '';
  const parrafoCurso = req.body.parrafo || '';
  const url = generarURLTemporal(videoId, userId, 600); // 10 min
  res.json({ url, nombreCurso, descripcionCurso, infoCurso, parrafoCurso });
});

// Endpoint para ver el video a través de la URL temporal
app.get('/ver', async (req, res) => {
  const { token, nombreCurso, descripcionCurso, infoCurso, parrafoCurso } = req.query;

  let payload;
  try {
    payload = validarToken(token);
  } catch {
    return res.status(403).send('Token inválido');
  }

  const membresia = await MembresiaCliente.findOne({
    cliente: payload.userId,
  });

  if (!membresia) {
    return res.status(403).send('Sin suscripción');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${nombreCurso}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>

      <body class="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12">
        
        <!-- Título principal -->
        <header class="w-full max-w-5xl text-center mb-12">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="text-gray-400 hover:text-white mb-6 inline-block">&#8592; Volver al Dashboard</a>
          <div class="flex flex-col mb-6">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              ${nombreCurso}
            </h1>
            <p class="text-slate-600 text-xs uppercase tracking-widest">
              ${infoCurso}
            <p>
          </div>
          <p class="text-gray-400 text-lg">
            Un entrenamiento consciente para elevar tu nivel mental, energético y personal
          </p>
        </header>

        <!-- Contenedor principal -->
        <main class="w-full max-w-5xl bg-gray-900 rounded-2xl shadow-xl p-8 space-y-10">

          <!-- Descripción del curso -->
          <section>
            <h2 class="text-2xl font-semibold mb-4 text-white">
              ¿De qué trata este curso?
            </h2>
            <p class="text-gray-300 leading-relaxed">
              ${descripcionCurso}
            </p>
          </section>

          <!-- Video -->
          <section>
            <div class="aspect-w-auto aspect-h-9"> 
              <iframe class="w-full h-80 rounded-lg" src="https://player.vimeo.com/video/${payload.videoId}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" title="Vimeo video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe> 
            </div>
          </section>

          <!-- Información del entrenamiento -->
          <section class="space-y-4 px-20">
            <h2 class="text-2xl font-semibold">
              ${nombreCurso}
            </h2>
            <p class="text-gray-300 text-justify leading-relaxed">
              ${parrafoCurso}
            </p>
          </section>

          <!-- Descarga -->
          <section class="pt-6 border-t border-gray-700 flex justify-center">
            <a 
              href="/descargar/ebook?token=${token}"
              class="inline-flex items-center gap-2 bg-yellow-500 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-400 transition"
            >
              Descargar ebook
              <span class="text-sm font-normal opacity-80">
                Energía en Movimiento
              </span>
            </a>
          </section>

        </main>

        <!-- Footer -->
        <footer class="mt-12 text-gray-500 text-sm text-center">
          Acceso exclusivo para miembros · Contenido protegido © 2026 Agustín Coceres
        </footer>

      </body>
    </html>

  `);
});

app.get('/descargar/ebook', async (req, res) => {
  const { token } = req.query;

  let payload;
  try {
    payload = validarToken(token);
  } catch {
    return res.status(403).send('Token inválido');
  }

  const membresia = await MembresiaCliente.findOne({
    cliente: payload.userId,
  });

  if (!membresia) {
    return res.status(403).send('Sin suscripción');
  }

  const filePath = path.join(process.cwd(), 'privado/ebook.pdf');

  res.download(filePath, 'ebook.pdf');
});

const port = process.env.PORT || 4001;
httpServer.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/graphql`);
});
