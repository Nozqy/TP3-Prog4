import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const estadoInicial = {
    nombre: '',
    apellido: '',
    dni: '',
    licencia: '',
    fecha_alta_licencia: '',
    fecha_vencimiento_licencia: ''
};

// Recorta la fecha ISO de MySQL a año/mes/día para los inputs type="date"
const formatearFechaInput = (fechaIso) => {
    if (!fechaIso) return '';
    return String(fechaIso).split('T')[0];
};

// Muestra la fecha como Dia/Mes/Añoen la tabla
const formatearFechaVista = (fechaIso) => {
    const limpia = formatearFechaInput(fechaIso);
    if (!limpia) return '-';
    const [anio, mes, dia] = limpia.split('-');
    return `${dia}/${mes}/${anio}`;
};

export const Conductores = () => {
    const { fetchAuth } = useAuth();

    const [conductores, setConductores] = useState([]);
    const [formulario, setFormulario] = useState(estadoInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    const cargarConductores = async () => {
        try {
            const { ok, data } = await fetchAuth('/conductores');
            if (ok) {
                setConductores(data.conductores);
            } else {
                setError(data.mensaje || 'Error al cargar los conductores');
            }
        } catch (err) {
            setError('Error de conexión al obtener los conductores');
        }
    };

    useEffect(() => {
        cargarConductores();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    // Validaciones en el cliente 
    const validarFormulario = () => {
        const soloNumerosRegex = /^\d+$/;

        if (!formulario.nombre.trim()) {
            setError('El nombre es obligatorio.');
            return false;
        }
        if (!formulario.apellido.trim()) {
            setError('El apellido es obligatorio.');
            return false;
        }
        if (
            !formulario.dni.trim() ||
            !soloNumerosRegex.test(formulario.dni.trim()) ||
            formulario.dni.trim().length < 7
        ) {
            setError('El DNI es obligatorio, debe contener solo números y tener al menos 7 dígitos.');
            return false;
        }
        if (!formulario.licencia.trim()) {
            setError('El número de licencia es obligatorio.');
            return false;
        }
        if (!formulario.fecha_alta_licencia) {
            setError('La fecha de alta de licencia es obligatoria.');
            return false;
        }
        if (!formulario.fecha_vencimiento_licencia) {
            setError('La fecha de vencimiento de licencia es obligatoria.');
            return false;
        }
        if (new Date(formulario.fecha_vencimiento_licencia) <= new Date(formulario.fecha_alta_licencia)) {
            setError('La fecha de vencimiento debe ser posterior a la fecha de alta.');
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
        const endpoint = editandoId ? `/conductores/${editandoId}` : '/conductores';
        const metodo = editandoId ? 'PUT' : 'POST';

        try {
            const { ok, data } = await fetchAuth(endpoint, {
                method: metodo,
                body: JSON.stringify({
                    nombre: formulario.nombre.trim(),
                    apellido: formulario.apellido.trim(),
                    dni: formulario.dni.trim(),
                    licencia: formulario.licencia.trim(),
                    fecha_alta_licencia: formulario.fecha_alta_licencia,
                    fecha_vencimiento_licencia: formulario.fecha_vencimiento_licencia
                })
            });

            if (!ok) {
                if (data.errores && data.errores.length > 0) {
                    setError(data.errores.map(err => err.mensaje).join(' | '));
                } else {
                    setError(data.mensaje || 'Error al guardar el conductor');
                }
                return;
            }

            setMensajeExito(
                editandoId
                    ? 'Conductor actualizado correctamente.'
                    : 'Conductor registrado correctamente.'
            );
            setFormulario(estadoInicial);
            setEditandoId(null);
            cargarConductores();
        } catch (err) {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    // Cargar datos en el formulario para editar
    const seleccionarParaEditar = (conductor) => {
        setError('');
        setMensajeExito('');
        setEditandoId(conductor.id);
        setFormulario({
            nombre: conductor.nombre,
            apellido: conductor.apellido,
            dni: conductor.dni,
            licencia: conductor.licencia,
            fecha_alta_licencia: formatearFechaInput(conductor.fecha_alta_licencia),
            fecha_vencimiento_licencia: formatearFechaInput(conductor.fecha_vencimiento_licencia)
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario(estadoInicial);
        setError('');
    };

    // Eliminar conductor
    const handleEliminar = async (id, nombreCompleto) => {
        if (!window.confirm(`¿Estás seguro de eliminar al conductor ${nombreCompleto}?`)) {
            return;
        }

        setError('');
        setMensajeExito('');

        try {
            const { ok, data } = await fetchAuth(`/conductores/${id}`, {
                method: 'DELETE'
            });

            if (!ok) {
                setError(data.mensaje || 'No se pudo eliminar el conductor');
                return;
            }

            setMensajeExito('Conductor eliminado correctamente.');
            if (editandoId === id) {
                cancelarEdicion();
            }
            cargarConductores();
        } catch (err) {
            setError('Error al conectar con el servidor para eliminar.');
        }
    };

    return (
        <div className="container">
            <div className="grid-layout">
                {/* Columna Izquierda: Formulario de Alta / Modificación */}
                <div className="card">
                    <h3>{editandoId ? '✏️ Editar Conductor' : '➕ Nuevo Conductor'}</h3>

                    {error && <div className="error-msg">{error}</div>}
                    {mensajeExito && <div className="success-msg">{mensajeExito}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Carlos"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                name="apellido"
                                value={formulario.apellido}
                                onChange={handleChange}
                                placeholder="Ej: Gómez"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dni">Número de Documento (DNI)</label>
                            <input
                                id="dni"
                                type="text"
                                name="dni"
                                value={formulario.dni}
                                onChange={handleChange}
                                placeholder="Solo números, ej: 35123456"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="licencia">Número de Licencia</label>
                            <input
                                id="licencia"
                                type="text"
                                name="licencia"
                                value={formulario.licencia}
                                onChange={handleChange}
                                placeholder="Ej: LNH-00123"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_alta_licencia">Fecha de Alta de Licencia</label>
                            <input
                                id="fecha_alta_licencia"
                                type="date"
                                name="fecha_alta_licencia"
                                value={formulario.fecha_alta_licencia}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_vencimiento_licencia">Fecha de Vencimiento de Licencia</label>
                            <input
                                id="fecha_vencimiento_licencia"
                                type="date"
                                name="fecha_vencimiento_licencia"
                                value={formulario.fecha_vencimiento_licencia}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={cargando}>
                                {cargando
                                    ? 'Guardando...'
                                    : editandoId
                                    ? 'Guardar Cambios'
                                    : 'Registrar Conductor'}
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

                {/* Columna Derecha: Listado de Conductores */}
                <div className="card">
                    <h2>🪪 Listado de Conductores ({conductores.length})</h2>

                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Apellido y Nombre</th>
                                    <th>DNI</th>
                                    <th>Licencia</th>
                                    <th>Alta Licencia</th>
                                    <th>Vencimiento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conductores.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                            No hay conductores registrados todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    conductores.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td><strong>{c.apellido}, {c.nombre}</strong></td>
                                            <td>{c.dni}</td>
                                            <td>{c.licencia}</td>
                                            <td>{formatearFechaVista(c.fecha_alta_licencia)}</td>
                                            <td>{formatearFechaVista(c.fecha_vencimiento_licencia)}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => seleccionarParaEditar(c)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleEliminar(c.id, `${c.nombre} ${c.apellido}`)}
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