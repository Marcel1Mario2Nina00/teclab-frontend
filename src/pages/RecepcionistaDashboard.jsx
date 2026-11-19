import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical,
  LogOut,
  ClipboardList,
  Building2,
  UserPlus,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function RecepcionistaDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('solicitudes'); // 'solicitudes' | 'centros' | 'medicos'

  const [solicitudes, setSolicitudes] = useState([]);
  const [laboratoristas, setLaboratoristas] = useState([]);
  const [centros, setCentros] = useState([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState({});

  // Formulario para registrar médico
  const [medicoForm, setMedicoForm] = useState({
    centro_id: '',
    nombre_completo: '',
    telefono: '',
    especialidad: '',
    username: '',
    password: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

const cargarTodo = async () => {
    try {
      const resSol = await api.get('/solicitudes');
      setSolicitudes(resSol.data);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    }

    try {
      const resLabs = await api.get('/solicitudes/laboratoristas');
      setLaboratoristas(resLabs.data);
    } catch (err) {
      console.error('Error al cargar laboratoristas:', err);
    }

    try {
      const resCentros = await api.get('/centros');
      setCentros(resCentros.data);
    } catch (err) {
      console.error('Error al cargar centros:', err);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleAsignar = async (solicitudId) => {
    const laboratorista_id = asignacionSeleccionada[solicitudId];
    if (!laboratorista_id) {
      alert('Selecciona un laboratorista antes de asignar.');
      return;
    }
    try {
      await api.put(`/solicitudes/${solicitudId}/asignar`, { laboratorista_id });
      await cargarTodo();
      alert(`Solicitud #${solicitudId} asignada correctamente.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al asignar la solicitud.');
    }
  };

  const handleCambiarEstadoCentro = async (centroId, nuevoEstado) => {
    try {
      await api.put(`/centros/${centroId}/estado`, { estado: nuevoEstado });
      await cargarTodo();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el estado del centro.');
    }
  };

  const handleRegistrarMedico = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await api.post('/medicos', medicoForm);
      setMensaje('¡Médico registrado exitosamente!');
      setMedicoForm({
        centro_id: '',
        nombre_completo: '',
        telefono: '',
        especialidad: '',
        username: '',
        password: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el médico.');
    }
  };

  const badgeEstado = (estado) => {
    if (estado === 'Finalizado' || estado === 'Aprobado') return 'bg-emerald-100 text-emerald-800';
    if (estado === 'En_Proceso') return 'bg-amber-100 text-amber-800';
    if (estado === 'Rechazado') return 'bg-red-100 text-red-800';
    return 'bg-slate-200 text-slate-700';
  };

  const centrosAprobados = centros.filter((c) => c.estado === 'Aprobado');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Barra Superior */}
      <header className="bg-[#0B4F6C] text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-cyan-200" />
            <div>
              <h1 className="text-lg font-bold leading-tight">TECLAB — Panel de Recepción</h1>
              <p className="text-xs text-cyan-100">Usuario: {user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Pestañas */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setTab('solicitudes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              tab === 'solicitudes'
                ? 'bg-[#0B4F6C] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Solicitudes Entrantes ({solicitudes.length})
          </button>
          <button
            onClick={() => setTab('centros')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              tab === 'centros'
                ? 'bg-[#0B4F6C] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" /> Centros Médicos ({centros.length})
          </button>
          <button
            onClick={() => setTab('medicos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              tab === 'medicos'
                ? 'bg-[#0B4F6C] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Registrar Médico
          </button>
        </div>

        {/* PESTAÑA 1: SOLICITUDES Y ASIGNACIÓN */}
        {tab === 'solicitudes' && (
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Médico</th>
                    <th className="px-4 py-3">Muestra</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Asignar a Laboratorista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {solicitudes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold">#{sol.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{sol.pacientes.nombre_completo}</div>
                        <div className="text-xs text-slate-500">CI: {sol.pacientes.ci}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sol.medicos.nombre_completo}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {sol.forma_obtencion.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeEstado(
                            sol.estado_general
                          )}`}
                        >
                          {sol.estado_general.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sol.estado_general === 'Finalizado' ? (
                          <span className="text-xs text-emerald-700 font-medium">Completado</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={asignacionSeleccionada[sol.id] || ''}
                              onChange={(e) =>
                                setAsignacionSeleccionada({
                                  ...asignacionSeleccionada,
                                  [sol.id]: e.target.value,
                                })
                              }
                              className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                            >
                              <option value="">Seleccionar...</option>
                              {laboratoristas.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                  {lab.nombre_completo}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAsignar(sol.id)}
                              className="inline-flex items-center gap-1 bg-[#0B4F6C] hover:bg-[#093e55] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Asignar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CENTROS MÉDICOS */}
        {tab === 'centros' && (
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Centro Médico</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3">Carta Notariada</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {centros.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{c.nombre}</div>
                        <div className="text-xs text-slate-500">{c.direccion}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{c.responsable}</div>
                        <div className="text-xs text-slate-500">{c.telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-4 py-3">
                        {c.ruta_carta_notariada ? (
                          <a
                            href={`http://localhost:3000/${c.ruta_carta_notariada.replace(/\\/g, '/')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0B4F6C] hover:underline text-xs font-semibold"
                          >
                            <FileText className="w-4 h-4" /> Ver PDF
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeEstado(c.estado)}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleCambiarEstadoCentro(c.id, 'Aprobado')}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => handleCambiarEstadoCentro(c.id, 'Rechazado')}
                          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: REGISTRAR MÉDICO */}
        {tab === 'medicos' && (
          <div className="bg-white max-w-2xl p-6 rounded-xl shadow border border-slate-200">
            <h2 className="text-base font-bold text-[#0B4F6C] mb-4">
              Registrar Médico en Centro Aprobado
            </h2>

            {mensaje && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm">
                {mensaje}
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegistrarMedico} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Centro Médico Aprobado *</label>
                <select
                  required
                  value={medicoForm.centro_id}
                  onChange={(e) => setMedicoForm({ ...medicoForm, centro_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                >
                  <option value="">Seleccionar centro...</option>
                  {centrosAprobados.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo *</label>
                  <input
                    required
                    value={medicoForm.nombre_completo}
                    onChange={(e) => setMedicoForm({ ...medicoForm, nombre_completo: e.target.value })}
                    placeholder="Ej: Dr. Mario Guzmán"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Especialidad</label>
                  <input
                    value={medicoForm.especialidad}
                    onChange={(e) => setMedicoForm({ ...medicoForm, especialidad: e.target.value })}
                    placeholder="Ej: Medicina Interna"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                  <input
                    value={medicoForm.telefono}
                    onChange={(e) => setMedicoForm({ ...medicoForm, telefono: e.target.value })}
                    placeholder="77012345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Usuario (Login) *</label>
                  <input
                    required
                    value={medicoForm.username}
                    onChange={(e) => setMedicoForm({ ...medicoForm, username: e.target.value })}
                    placeholder="dr.guzman"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={medicoForm.password}
                    onChange={(e) => setMedicoForm({ ...medicoForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition cursor-pointer"
              >
                Guardar Médico
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}