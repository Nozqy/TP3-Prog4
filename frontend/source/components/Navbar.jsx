import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const { estaAutenticado, usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        cerrarSesion();
        navigate('/');
    };

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <Link to="/">🚚 Logística Transporte</Link>
            </div>

            <nav className="navbar-links">
                <NavLink to="/">Inicio</NavLink>

                {estaAutenticado ? (
                    <>
                        <NavLink to="/vehiculos">Vehículos</NavLink>
                        <NavLink to="/conductores">Conductores</NavLink>
                        <NavLink to="/viajes">Viajes</NavLink>
                        <span className="navbar-user">Hola, {usuario?.nombre}</span>
                        <button onClick={handleLogout} className="btn btn-danger btn-sm">
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" className="btn btn-primary btn-sm">
                        Iniciar Sesión
                    </NavLink>
                )}
            </nav>
        </header>
    );
};