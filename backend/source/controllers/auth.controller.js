import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        //Verificacion de que no haya mails duplicados
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El email ya se encuentra registrado'
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario en base de datos
        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, passwordHash]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: resultado.insertId,
                nombre,
                email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error interno al registrar usuario' });
    }
};

export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas (email o contraseña incorrectos)'
            });
        }

        const usuario = rows[0];

        // Comparar la contraseña generada con hash en la base de datos

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales inválidas (email o contraseña incorrectos)'
            });
        }

        // Generador de token, 4 hrs de duración maxima
        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '4h'
        });

        res.json({
            ok: true,
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: payload
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error interno al iniciar sesión' });
    }
};