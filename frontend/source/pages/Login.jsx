import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

export const Login = () => {
    const [esRegistro, setEsRegistro] = useState(false);
    const [formulario, setFormulario] = useState({
        nombre: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    const { iniciarSesion } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    // Validaciones en el frontend
    const validarFormulario = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (esRegistro && formulario.nombre.trim().length < 2) {
            setError('El nombre es obligatorio y debe tener al menos 2 caracteres.');
            return false;
        }
        if (!formulario.email.trim() || !emailRegex.test(formulario.email)) {
            setError('Ingresá un correo electrónico con formato válido.');
            return false;
        }
        if (!formulario.password || formulario.password.length < 6) {
            setError('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');

        if (!validarFormulario()) return;

        setCargando(true);
        const endpoint = esRegistro ? '/auth/registro' : '/auth/login';

        try {
            const respuesta = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                if (data.errores && data.errores.length > 0) {
                    setError(data.errores.map(err => err.mensaje).join(' | '));
                } else {
                    setError(data.mensaje || 'Error al procesar la solicitud');
                }
                return;
            }

            if (esRegistro) {
                setMensajeExito('Usuario registrado con éxito. Ahora podés iniciar sesión.');
                setEsRegistro(false);
                setFormulario({ nombre: '', email: formulario.email, password: '' });
            } else {
                iniciarSesion(data.token, data.usuario);
                navigate('/vehiculos');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Verificá que el backend esté encendido.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '460px', marginTop: '3rem' }}>
            <div className="card">
                <h2>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>

                {error && <div className="error-msg">{error}</div>}
                {mensajeExito && <div className="success-msg">{mensajeExito}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    {esRegistro && (
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre completo</label>
                            <input
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Bruno González"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formulario.email}
                            onChange={handleChange}
                            placeholder="usuario@transporte.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formulario.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={cargando}
                    >
                        {cargando
                            ? 'Procesando...'
                            : esRegistro
                            ? 'Registrarme'
                            : 'Ingresar'}
                    </button>
                </form>

                <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {esRegistro ? (
                        <span>
                            ¿Ya tenés una cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => { setEsRegistro(false); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Iniciá sesión acá
                            </button>
                        </span>
                    ) : (
                        <span>
                            ¿No tenés cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => { setEsRegistro(true); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Registrate acá
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};