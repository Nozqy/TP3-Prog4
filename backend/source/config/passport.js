import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { pool } from './db.js';
import 'dotenv/config';

const opciones = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

export const configurarPassport = (passport) => {
    passport.use(
        new JwtStrategy(opciones, async (jwt_payload, done) => {
            try {
                const [rows] = await pool.query(
                    'SELECT id, nombre, email FROM usuarios WHERE id = ?',
                    [jwt_payload.id]
                );

                if (rows.length > 0) {
                    return done(null, rows[0]);
                }
                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        })
    );
};