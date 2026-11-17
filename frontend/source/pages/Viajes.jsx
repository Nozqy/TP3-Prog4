import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const estadoInicial = {
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: ''
};

// Adapta fecha ISO de MySQL al formato YYYY-MM-DDTHH:mm datetime-local
const formatearFechaHoraInput = (fechaIso) => {
    if (!fechaIso) return '';
    const date = new Date(fechaIso);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// Muestra fecha y hora legible en la tabla (DD/MM/YYYY HH:mm)
const formatearFechaHoraVista = (fechaIso) => {
    if (!fechaIso) return '-';
    const date = new Date(fechaIso);
    if (isNaN(date.getTime())) return String(fechaIso);
    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const Viajes = () => {
    const { fetchAuth } = useAuth();

    const [viajes, setViajes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);

    // Filtros de visualización
    const [filtroVehiculo, setFiltroVehiculo] = useState('');
    const [filtroConductor, setFiltroConductor] = useState('');

    // Formulario de alta / edición
    const [formulario, setFormulario] = useState(estadoInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    // Cargar vehículos y conductores para los <select>
    const cargarOpciones = async () => {
        try {
            const [resVehiculos, resConductores] = await Promise.all([
                fetchAuth('/vehiculos'),
                fetchAuth('/conductores')
            ]);

            if (resVehiculos.ok) setVehiculos(resVehiculos.data.vehiculos);
            if (resConductores.ok) setConductores(resConductores.data.conductores);
        } catch (err) {
            setError('Error al cargar las listas de vehículos y conductores');
        }
    };

    // Cargar viajes aplicando filtros si están seleccionados
    const cargarViajes = async (vehiculoId = filtroVehiculo, conductorId = filtroConductor) => {
        try {
            const params = new URLSearchParams();
            if (vehiculoId) params.append('vehiculo_id', vehiculoId);
            if (conductorId) params.append('conductor_id', conductorId);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const { ok, data } = await fetchAuth(`/viajes${queryString}`);

            if (ok) {
                setViajes(data.viajes);
            } else {
                setError(data.mensaje || 'Error al cargar los viajes');
            }
        } catch (err) {
            setError('Error de conexión al obtener los viajes');
        }
    };

    useEffect(() => {
        cargarOpciones();
    }, []);

    useEffect(() => {
        cargarViajes(filtroVehiculo, filtroConductor);
    }, [filtroVehiculo, filtroConductor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    // Validaciones en el cliente (Frontend)
    const validarFormulario = () => {
        const kmNum = Number(formulario.kilometros);

        if (!formulario.vehiculo_id) {
            setError('Debés seleccionar un vehículo.');
            return false;
        }
        if (!formulario.conductor_id) {
            setError('Debés seleccionar un conductor.');
            return false;
        }
        if (!formulario.fecha_salida) {
            setError('La fecha y hora de salida son obligatorias.');
            return false;
        }
        if (!formulario.fecha_llegada) {
            setError('La fecha y hora de llegada son obligatorias.');
            return false;
        }
        if (new Date(formulario.fecha_llegada) < new Date(formulario.fecha_salida)) {
            setError('La fecha de llegada no puede ser anterior a la fecha de salida.');
            return false;
        }
        if (!formulario.origen.trim()) {
            setError('El lugar de origen es obligatorio.');
            return false;
        }
        if (!formulario.destino.trim()) {
            setError('El lugar de destino es obligatorio.');
            return false;
        }
        if (!formulario.kilometros || isNaN(kmNum) || kmNum <= 0) {
            setError('Los kilómetros deben ser un número mayor a 0.');
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
        const endpoint = editandoId ? `/viajes/${editandoId}` : '/viajes';
        const metodo = editandoId ? 'PUT' : 'POST';

        try {
            const { ok, data } = await fetchAuth(endpoint, {
                method: metodo,
                body: JSON.stringify({
                    vehiculo_id: Number(formulario.vehiculo_id),
                    conductor_id: Number(formulario.conductor_id),
                    fecha_salida: formulario.fecha_salida,
                    fecha_llegada: formulario.fecha_llegada,
                    origen: formulario.origen.trim(),
                    destino: formulario.destino.trim(),
                    kilometros: Number(formulario.kilometros),
                    observaciones: formulario.observaciones.trim() || null
                })
            });

            if (!ok) {
                if (data.errores && data.errores.length > 0) {
                    setError(data.errores.map(err => err.mensaje).join(' | '));
                } else {
                    setError(data.mensaje || 'Error al guardar el viaje');
                }
                return;
            }

            setMensajeExito(
                editandoId
                    ? 'Viaje actualizado correctamente.'
                    : 'Viaje registrado correctamente.'
            );
            setFormulario(estadoInicial);
            setEditandoId(null);
            cargarViajes();
        } catch (err) {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    const seleccionarParaEditar = (viaje) => {
        setError('');
        setMensajeExito('');
        setEditandoId(viaje.id);
        setFormulario({
            vehiculo_id: viaje.vehiculo_id,
            conductor_id: viaje.conductor_id,
            fecha_salida: formatearFechaHoraInput(viaje.fecha_salida),
            fecha_llegada: formatearFechaHoraInput(viaje.fecha_llegada),
            origen: viaje.origen,
            destino: viaje.destino,
            kilometros: viaje.kilometros,
            observaciones: viaje.observaciones || ''
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario(estadoInicial);
        setError('');
    };

    const handleEliminar = async (id) => {
        if (!window.confirm(`¿Estás seguro de eliminar el viaje #${id}?`)) {
            return;
        }

        setError('');
        setMensajeExito('');

        try {
            const { ok, data } = await fetchAuth(`/viajes/${id}`, {
                method: 'DELETE'
            });

            if (!ok) {
                setError(data.mensaje || 'No se pudo eliminar el viaje');
                return;
            }

            setMensajeExito('Viaje eliminado correctamente.');
            if (editandoId === id) {
                cancelarEdicion();
            }
            cargarViajes();
        } catch (err) {
            setError('Error al conectar con el servidor para eliminar.');
        }
    };

    // Cálculo dinámico del total de kilómetros según los viajes listados/filtrados
    const totalKilometros = viajes.reduce(
        (acum, v) => acum + Number(v.kilometros || 0),
        0
    );

    return (
        <div className="container">
            <div className="grid-layout">
                {/* Columna Izquierda: Formulario de Carga / Edición de Viaje */}
                <div className="card">
                    <h3>{editandoId ? ' Editar Viaje' : ' Registrar Viaje'}</h3>

                    {error && <div className="error-msg">{error}</div>}
                    {mensajeExito && <div className="success-msg">{mensajeExito}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="vehiculo_id">Vehículo</label>
                            <select
                                id="vehiculo_id"
                                name="vehiculo_id"
                                value={formulario.vehiculo_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar Vehículo --</option>
                                {vehiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.patente} - {v.marca} {v.modelo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="conductor_id">Conductor</label>
                            <select
                                id="conductor_id"
                                name="conductor_id"
                                value={formulario.conductor_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar Conductor --</option>
                                {conductores.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.apellido}, {c.nombre} (DNI: {c.dni})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_salida">Fecha y Hora de Salida</label>
                            <input
                                id="fecha_salida"
                                type="datetime-local"
                                name="fecha_salida"
                                value={formulario.fecha_salida}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_llegada">Fecha y Hora de Llegada</label>
                            <input
                                id="fecha_llegada"
                                type="datetime-local"
                                name="fecha_llegada"
                                value={formulario.fecha_llegada}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="origen">Origen</label>
                            <input
                                id="origen"
                                type="text"
                                name="origen"
                                value={formulario.origen}
                                onChange={handleChange}
                                placeholder="Ej: La Rioja Capital"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="destino">Destino</label>
                            <input
                                id="destino"
                                type="text"
                                name="destino"
                                value={formulario.destino}
                                onChange={handleChange}
                                placeholder="Ej: Córdoba Capital"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="kilometros">Kilómetros recorridos</label>
                            <input
                                id="kilometros"
                                type="number"
                                step="0.01"
                                name="kilometros"
                                value={formulario.kilometros}
                                onChange={handleChange}
                                placeholder="Ej: 430.5"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="observaciones">Observaciones (Opcional)</label>
                            <textarea
                                id="observaciones"
                                name="observaciones"
                                rows="2"
                                value={formulario.observaciones}
                                onChange={handleChange}
                                placeholder="Notas adicionales del trayecto..."
                            />
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={cargando}>
                                {cargando
                                    ? 'Guardando...'
                                    : editandoId
                                    ? 'Guardar Cambios'
                                    : 'Registrar Viaje'}
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

                {/* Columna Derecha: Filtros, Resumen de Km y Tabla de Viajes */}
                <div className="card">
                    <h2>🗺️ Visualización e Historial de Viajes</h2>

                    {/* Barra de Filtros por Vehículo y Conductor */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1rem',
                            alignItems: 'end'
                        }}
                    >
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="filtroVehiculo">Filtrar por Vehículo</label>
                            <select
                                id="filtroVehiculo"
                                value={filtroVehiculo}
                                onChange={(e) => setFiltroVehiculo(e.target.value)}
                            >
                                <option value="">Todos los vehículos</option>
                                {vehiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.patente} - {v.marca} {v.modelo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="filtroConductor">Filtrar por Conductor</label>
                            <select
                                id="filtroConductor"
                                value={filtroConductor}
                                onChange={(e) => setFiltroConductor(e.target.value)}
                            >
                                <option value="">Todos los conductores</option>
                                {conductores.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.apellido}, {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(filtroVehiculo || filtroConductor) && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setFiltroVehiculo('');
                                    setFiltroConductor('');
                                }}
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>

                    {/* Caja de Resumen de Viajes y Kilómetros */}
                    <div className="resumen-box">
                        <div>
                            <strong>Viajes listados:</strong> {viajes.length}
                        </div>
                        <div>
                            <strong>Total de kilómetros acumulados:</strong>{' '}
                            {totalKilometros.toLocaleString('es-AR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                            })}{' '}
                            km
                        </div>
                    </div>

                    {/* Tabla de Viajes */}
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehículo</th>
                                    <th>Conductor</th>
                                    <th>Trayecto</th>
                                    <th>Salida / Llegada</th>
                                    <th>Km</th>
                                    <th>Observaciones</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viajes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                            No se encontraron viajes para los criterios seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    viajes.map((v) => (
                                        <tr key={v.id}>
                                            <td>{v.id}</td>
                                            <td>
                                                <strong>{v.vehiculo_patente}</strong>
                                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                    {v.vehiculo_marca} {v.vehiculo_modelo}
                                                </div>
                                            </td>
                                            <td>
                                                {v.conductor_apellido}, {v.conductor_nombre}
                                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                    DNI: {v.conductor_dni}
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{v.origen}</strong> → <strong>{v.destino}</strong>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                <div>Sal: {formatearFechaHoraVista(v.fecha_salida)}</div>
                                                <div>Lleg: {formatearFechaHoraVista(v.fecha_llegada)}</div>
                                            </td>
                                            <td>
                                                <strong>{Number(v.kilometros).toLocaleString('es-AR')} km</strong>
                                            </td>
                                            <td>{v.observaciones || '-'}</td>
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
                                                        onClick={() => handleEliminar(v.id)}
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