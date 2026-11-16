import passport from 'passport';

export const verificarToken = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al autenticar token' });
        }
        if (!user) {
            return res.status(401).json({
                ok: false,
                mensaje: 'No autorizado. Token inválido, expirado o no proporcionado'
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};