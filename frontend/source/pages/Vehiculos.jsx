import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const estadoInicial = {
    marca: '',
    modelo: '',
    patente: '',
    anio: '',
    capacidad_carga: ''
};

export const Vehiculos = () => {
    const { fetchAuth } = useAuth();

    const [vehiculos, setVehiculos] = useState([]);
    const [formulario, setFormulario] = useState(estadoInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    // Cargar listado al montar el componente
    const cargarVehiculos = async () => {
        try {
            const { ok, data } = await fetchAuth('/vehiculos');
            if (ok) {
                setVehiculos(data.vehiculos);
            } else {
                setError(data.mensaje || 'Error al cargar los vehículos');
            }
        } catch (err) {
            setError('Error de conexión al obtener los vehículos');
        }
    };

    useEffect(() => {
        cargarVehiculos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: name === 'patente' ? value.toUpperCase() : value
        });
    };

    // Validaciones en el cliente
    const validarFormulario = () => {
        const anioActual = new Date().getFullYear() + 1;
        const anioNum = Number(formulario.anio);
        const capacidadNum = Number(formulario.capacidad_carga);

        if (!formulario.marca.trim()) {
            setError('La marca es obligatoria.');
            return false;
        }
        if (!formulario.modelo.trim()) {
            setError('El modelo es obligatorio.');
            return false;
        }
        if (!formulario.patente.trim() || formulario.patente.trim().length < 6) {
            setError('La patente es obligatoria y debe tener al menos 6 caracteres.');
            return false;
        }
        if (!formulario.anio || isNaN(anioNum) || anioNum < 1950 || anioNum > anioActual) {
            setError(`El año debe ser un número válido entre 1950 y ${anioActual}.`);
            return false;
        }
        if (!formulario.capacidad_carga || isNaN(capacidadNum) || capacidadNum <= 0) {
            setError('La capacidad de carga debe ser un número mayor a 0.');
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
        const endpoint = editandoId ? `/vehiculos/${editandoId}` : '/vehiculos';
        const metodo = editandoId ? 'PUT' : 'POST';

        try {
            const { ok, data } = await fetchAuth(endpoint, {
                method: metodo,
                body: JSON.stringify({
                    marca: formulario.marca.trim(),
                    modelo: formulario.modelo.trim(),
                    patente: formulario.patente.trim().toUpperCase(),
                    anio: Number(formulario.anio),
                    capacidad_carga: Number(formulario.capacidad_carga)
                })
            });

            if (!ok) {
                if (data.errores && data.errores.length > 0) {
                    setError(data.errores.map(err => err.mensaje).join(' | '));
                } else {
                    setError(data.mensaje || 'Error al guardar el vehículo');
                }
                return;
            }

            setMensajeExito(
                editandoId
                    ? 'Vehículo actualizado correctamente.'
                    : 'Vehículo registrado correctamente.'
            );
            setFormulario(estadoInicial);
            setEditandoId(null);
            cargarVehiculos();
        } catch (err) {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    // Cargar datos en el formulario para editar
    const seleccionarParaEditar = (vehiculo) => {
        setError('');
        setMensajeExito('');
        setEditandoId(vehiculo.id);
        setFormulario({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            patente: vehiculo.patente,
            anio: vehiculo.anio,
            capacidad_carga: vehiculo.capacidad_carga
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario(estadoInicial);
        setError('');
    };

    // Eliminar vehículo
    const handleEliminar = async (id, patente) => {
        if (!window.confirm(`¿Estás seguro de eliminar el vehículo con patente ${patente}?`)) {
            return;
        }

        setError('');
        setMensajeExito('');

        try {
            const { ok, data } = await fetchAuth(`/vehiculos/${id}`, {
                method: 'DELETE'
            });

            if (!ok) {
                setError(data.mensaje || 'No se pudo eliminar el vehículo');
                return;
            }

            setMensajeExito('Vehículo eliminado correctamente.');
            if (editandoId === id) {
                cancelarEdicion();
            }
            cargarVehiculos();
        } catch (err) {
            setError('Error al conectar con el servidor para eliminar.');
        }
    };

    return (
        <div className="container">
            <div className="grid-layout">
                {/* Columna Izquierda: Formulario de Alta / Modificación */}
                <div className="card">
                    <h3>{editandoId ? ' Editar Vehículo' : ' Nuevo Vehículo'}</h3>

                    {error && <div className="error-msg">{error}</div>}
                    {mensajeExito && <div className="success-msg">{mensajeExito}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="marca">Marca</label>
                            <input
                                id="marca"
                                type="text"
                                name="marca"
                                value={formulario.marca}
                                onChange={handleChange}
                                placeholder="Ej: Scania, Mercedes-Benz"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="modelo">Modelo</label>
                            <input
                                id="modelo"
                                type="text"
                                name="modelo"
                                value={formulario.modelo}
                                onChange={handleChange}
                                placeholder="Ej: R450, Actros"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="patente">Patente</label>
                            <input
                                id="patente"
                                type="text"
                                name="patente"
                                value={formulario.patente}
                                onChange={handleChange}
                                placeholder="Ej: AF123BC"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="anio">Año de fabricación</label>
                            <input
                                id="anio"
                                type="number"
                                name="anio"
                                value={formulario.anio}
                                onChange={handleChange}
                                placeholder="Ej: 2023"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="capacidad_carga">Capacidad de carga (kg)</label>
                            <input
                                id="capacidad_carga"
                                type="number"
                                step="0.01"
                                name="capacidad_carga"
                                value={formulario.capacidad_carga}
                                onChange={handleChange}
                                placeholder="Ej: 28500"
                            />
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={cargando}>
                                {cargando
                                    ? 'Guardando...'
                                    : editandoId
                                    ? 'Guardar Cambios'
                                    : 'Registrar Vehículo'}
                            </button>

                            {editandoId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Columna Derecha: Listado de Vehículos */}
                <div className="card">
                    <h2>🚛 Listado de Vehículos ({vehiculos.length})</h2>

                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patente</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Año</th>
                                    <th>Capacidad (kg)</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehiculos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                            No hay vehículos registrados todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    vehiculos.map((v) => (
                                        <tr key={v.id}>
                                            <td>{v.id}</td>
                                            <td><strong>{v.patente}</strong></td>
                                            <td>{v.marca}</td>
                                            <td>{v.modelo}</td>
                                            <td>{v.anio}</td>
                                            <td>{Number(v.capacidad_carga).toLocaleString('es-AR')} kg</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => seleccionarParaEditar(v)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleEliminar(v.id, v.patente)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};