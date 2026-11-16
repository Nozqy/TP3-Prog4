import express from 'express';
import cors from 'cors';
import passport from 'passport';
import 'dotenv/config';
import { verificarConexion } from './config/db.js';
import { configurarPassport } from './config/passport.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicializar Passport(seguridad)
configurarPassport(passport);
app.use(passport.initialize());

// Conexión a la base de datos
verificarConexion();

// Rutas
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});