import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [usuario, setUsuario] = useState(() => {
        const guardado = localStorage.getItem('usuario');
        return guardado ? JSON.parse(guardado) : null;
    });

    const iniciarSesion = (nuevoToken, datosUsuario) => {
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        setToken(nuevoToken);
        setUsuario(datosUsuario);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
    };

    // fetch con el token JWT
    const fetchAuth = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        };

        const respuesta = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Si el token expiró o es inválido (401). Cierra sesion automáticamente
        if (respuesta.status === 401) {
            cerrarSesion();
        }

        const data = await respuesta.json();
        return { status: respuesta.status, ok: respuesta.ok, data };
    };

    useEffect(() => {
        if (!token) {
            setUsuario(null);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{
            token,
            usuario,
            estaAutenticado: !!token,
            iniciarSesion,
            cerrarSesion,
            fetchAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);