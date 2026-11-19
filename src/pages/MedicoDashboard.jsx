import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical,
  LogOut,
  PlusCircle,
  ClipboardList,
  FileDown,
  Eye,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function MedicoDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('lista'); // 'lista' | 'nueva'
  const [catalogo, setCatalogo] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del formulario de nueva solicitud
  const [paciente, setPaciente] = useState({
    ci: '',
    nombre_completo: '',
    edad: '',
    sexo: 'M',
  });
  const [formaObtencion, setFormaObtencion] = useState('Paciente_trae_muestra');
  const [observaciones, setObservaciones] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Modal de detalle y resultados
  const [detalleModal, setDetalleModal] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resCat, resSol] = await Promise.all([
        api.get('/solicitudes/catalogo'),
        api.get('/solicitudes'),
      ]);
      setCatalogo(resCat.data);
      setSolicitudes(resSol.data);
    } catch (err) {
      console.error('Error al cargar datos del médico:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const toggleAnalisis = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (seleccionados.length === 0) {
      setError('Debe seleccionar al menos un análisis del catálogo.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/solicitudes', {
        paciente,
        forma_obtencion: formaObtencion,
        observaciones,
        tipos_analisis_ids: seleccionados,
      });

      setMensaje('¡Solicitud registrada correctamente!');
      setPaciente({ ci: '', nombre_completo: '', edad: '', sexo: 'M' });
      setObservaciones('');
      setSeleccionados([]);
      await cargarDatos();
      setTimeout(() => {
        setMensaje('');
        setTab('lista');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const verResultados = async (solicitudId) => {
    try {
      const { data } = await api.get(`/resultados/solicitud/${solicitudId}`);
      setDetalleModal(data);
    } catch (err) {
      alert('No se pudieron cargar los resultados de esta solicitud.');
    }
  };

  const descargarPDF = async (solicitudId) => {
    try {
      const response = await api.get(`/resultados/solicitud/${solicitudId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Error al generar el informe PDF.');
    }
  };

  const badgeEstado = (estado) => {
    if (estado === 'Finalizado') return 'bg-emerald-100 text-emerald-800';
    if (estado === 'En_Proceso') return 'bg-amber-100 text-amber-800';
    return 'bg-slate-200 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Barra Superior */}
      <header className="bg-[#0B4F6C] text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-cyan-200" />
            <div>
              <h1 className="text-lg font-bold leading-tight">TECLAB — Panel del Médico</h1>
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

      {/* Navegación por pestañas */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('lista')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              tab === 'lista'
                ? 'bg-[#0B4F6C] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Mis Solicitudes ({solicitudes.length})
          </button>
          <button
            onClick={() => setTab('nueva')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              tab === 'nueva'
                ? 'bg-[#0B4F6C] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Nueva Solicitud de Análisis
          </button>
        </div>

        {/* PESTAÑA 1: LISTA DE SOLICITUDES */}
        {tab === 'lista' && (
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Análisis</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        Aún no has registrado ninguna solicitud.
                      </td>
                    </tr>
                  ) : (
                    solicitudes.map((sol) => (
                      <tr key={sol.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">#{sol.id}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(sol.fecha_solicitud).toLocaleDateString('es-BO')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{sol.pacientes.nombre_completo}</div>
                          <div className="text-xs text-slate-500">CI: {sol.pacientes.ci}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {sol.detalles_solicitud.map((d) => d.tipos_analisis.nombre).join(', ')}
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
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => verResultados(sol.id)}
                            className="inline-flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 text-[#0B4F6C] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Resultados
                          </button>
                          <button
                            onClick={() => descargarPDF(sol.id)}
                            className="inline-flex items-center gap-1 bg-[#0B4F6C] hover:bg-[#093e55] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: FORMULARIO NUEVA SOLICITUD */}
        {tab === 'nueva' && (
          <form onSubmit={handleCrearSolicitud} className="space-y-6">
            {mensaje && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5" /> {mensaje}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Datos del Paciente */}
            <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
              <h2 className="text-base font-bold text-[#0B4F6C] mb-4">1. Datos del Paciente</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CI *</label>
                  <input
                    required
                    value={paciente.ci}
                    onChange={(e) => setPaciente({ ...paciente, ci: e.target.value })}
                    placeholder="Ej: 8945123 SC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo *</label>
                  <input
                    required
                    value={paciente.nombre_completo}
                    onChange={(e) => setPaciente({ ...paciente, nombre_completo: e.target.value })}
                    placeholder="Ej: Juan Pérez Morales"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Edad</label>
                    <input
                      type="number"
                      value={paciente.edad}
                      onChange={(e) => setPaciente({ ...paciente, edad: e.target.value })}
                      placeholder="34"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Sexo *</label>
                    <select
                      value={paciente.sexo}
                      onChange={(e) => setPaciente({ ...paciente, sexo: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Catálogo de Análisis por Categoría */}
            <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
              <h2 className="text-base font-bold text-[#0B4F6C] mb-1">
                2. Seleccionar Análisis Clínicos ({seleccionados.length} marcados)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Puede marcar uno o varios análisis de distintas categorías en la misma solicitud.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogo
                  .filter((cat) => cat.tipos_analisis.length > 0)
                  .map((cat) => (
                    <div key={cat.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B4F6C] mb-2">
                        {cat.nombre}
                      </h3>
                      <div className="space-y-2">
                        {cat.tipos_analisis.map((tipo) => (
                          <label
                            key={tipo.id}
                            className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={seleccionados.includes(tipo.id)}
                              onChange={() => toggleAnalisis(tipo.id)}
                              className="rounded text-[#0B4F6C] focus:ring-[#0B4F6C]"
                            />
                            <span>{tipo.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Obtención de muestra y observaciones */}
            <div className="bg-white p-6 rounded-xl shadow border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-[#0B4F6C]">3. Toma de Muestra y Observaciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Forma de Obtención de Muestra *
                  </label>
                  <select
                    value={formaObtencion}
                    onChange={(e) => setFormaObtencion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  >
                    <option value="Paciente_trae_muestra">
                      Personal del centro médico / paciente lleva la muestra
                    </option>
                    <option value="Laboratorio_recoge_muestra">
                      Personal de TECLAB se traslada a recoger la muestra
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
                  <input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Paciente en ayunas de 12 horas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Registrando solicitud...' : 'Enviar Solicitud a TECLAB'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* MODAL DE RESULTADOS E IMÁGENES */}
      {detalleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="bg-[#0B4F6C] text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="font-bold text-lg">Resultados — Solicitud #{detalleModal.id}</h2>
                <p className="text-xs text-cyan-100">
                  Paciente: {detalleModal.pacientes.nombre_completo} (CI: {detalleModal.pacientes.ci})
                </p>
              </div>
              <button onClick={() => setDetalleModal(null)} className="cursor-pointer hover:text-cyan-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {detalleModal.detalles_solicitud.map((det) => (
                <div key={det.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800">{det.tipos_analisis.nombre}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {det.estado_analisis}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Responsable: {det.personal_laboratorio?.nombre_completo || 'Sin asignar'}
                  </p>

                  {det.resultados ? (
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-line border border-slate-200">
                        {det.resultados.informe_texto}
                      </div>

                      {det.resultados.imagenes_resultado?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-2">Imágenes Adjuntas:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {det.resultados.imagenes_resultado.map((img) => {
                              const url = `http://localhost:3000/${img.ruta_imagen.replace(/\\/g, '/')}`;
                              return (
                                <a
                                  key={img.id}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block border border-slate-200 rounded-lg overflow-hidden hover:opacity-90"
                                >
                                  <img
                                    src={url}
                                    alt={img.descripcion || 'Resultado clínico'}
                                    className="w-full h-28 object-cover"
                                  />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400">Resultado pendiente de procesamiento.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}