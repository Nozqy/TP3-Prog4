import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
    const { estaAutenticado, usuario } = useAuth();

    return (
        <div className="container">
            <section className="hero">
                <h1>Sistema de Gestión de Transporte</h1>
                <p>
                    Plataforma integral para el registro y control de flota vehicular, 
                    personal de conducción habilitado y seguimiento de viajes realizados.
                </p>

                {!estaAutenticado ? (
                    <Link to="/login" className="btn btn-primary">
                        Acceder al Sistema
                    </Link>
                ) : (
                    <div className="btn-group" style={{ justifyContent: 'center' }}>
                        <Link to="/vehiculos" className="btn btn-primary">Ir a Vehículos</Link>
                        <Link to="/conductores" className="btn btn-secondary">Ir a Conductores</Link>
                        <Link to="/viajes" className="btn btn-warning">Ir a Viajes</Link>
                    </div>
                )}
            </section>

            <section className="features-grid">
                <div className="card">
                    <h3>🚛 Flota de Vehículos</h3>
                    <p>
                        Administración de unidades con control de patente única, marca, 
                        modelo, año de fabricación y capacidad máxima de carga en kilogramos.
                    </p>
                </div>

                <div className="card">
                    <h3>🪪 Conductores Habilitados</h3>
                    <p>
                        Registro de choferes con validación de documento, número de licencia 
                        y control de fechas de alta y vencimiento.
                    </p>
                </div>

                <div className="card">
                    <h3>🗺️ Control de Viajes y Km</h3>
                    <p>
                        Asignación de viajes vinculando vehículo y conductor, registro de origen, 
                        destino, horarios y cálculo acumulado de kilómetros recorridos.
                    </p>
                </div>
            </section>

            {estaAutenticado && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <p>
                        Sesión activa como <strong>{usuario?.nombre}</strong> ({usuario?.email}). 
                        Seleccioná una sección en la barra superior para operar.
                    </p>
                </div>
            )}
        </div>
    );
};