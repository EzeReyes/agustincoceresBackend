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
app.get('/api/url-temporal/:videoId', (req, res) => {
  const { videoId } = req.params;
  const userId = req.query.userId || 'anon';
  const url = generarURLTemporal(videoId, userId, 600); // 10 min
  res.json({ url });
});

// Endpoint para validar y redirigir
app.get('/ver/:videoId', async (req, res) => {
  const { token } = req.query;
  // console.log("Token recibido en /ver/:videoId :", token);
  const payload = validarToken(token);

  console.log("Payload recibido en /ver/:videoId :", payload);

  if (!payload) {
    return res.status(403).send('Token inválido o expirado');
  }

  const existeMembresia = await MembresiaCliente.findOne({
    cliente: payload.userId,
  });

  if (!existeMembresia) {
    return res.status(403).send('No tiene suscripción al curso');
  }

  // res.redirect(`https://www.youtube.com/watch?v=${payload.videoId}`);
  res.redirect(`${process.env.FRONTEND_URL}/curso/${payload.videoId}`);
});



const port = process.env.PORT || 4001;
httpServer.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/graphql`);
});
