import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical,
  LogOut,
  Microscope,
  Upload,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function LaboratoristaDashboard() {
  const { user, logout } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  // Estado del formulario de resultado
  const [informeTexto, setInformeTexto] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarPendientes = async () => {
    try {
      const { data } = await api.get('/resultados/pendientes');
      setPendientes(data);
    } catch (err) {
      console.error('Error al cargar análisis asignados:', err);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const abrirModal = (detalle) => {
    setSeleccionado(detalle);
    setInformeTexto('');
    setImagenes([]);
    setError('');
  };

  const handleSubirResultado = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('detalle_id', seleccionado.id);
      formData.append('informe_texto', informeTexto);

      for (let i = 0; i < imagenes.length; i++) {
        formData.append('imagenes', imagenes[i]);
      }

      const { data } = await api.post('/resultados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMensaje(
        `Resultado guardado para ${seleccionado.tipos_analisis.nombre}. Estado de la solicitud: ${data.estado_solicitud.replace('_', ' ')}.`
      );
      setSeleccionado(null);
      await cargarPendientes();

      setTimeout(() => setMensaje(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el resultado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Barra Superior */}
      <header className="bg-[#0B4F6C] text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-cyan-200" />
            <div>
              <h1 className="text-lg font-bold leading-tight">TECLAB — Panel del Laboratorista</h1>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Microscope className="w-6 h-6 text-[#0B4F6C]" />
              Mis Análisis Asignados ({pendientes.length})
            </h2>
            <p className="text-sm text-slate-500">
              Selecciona un análisis para redactar el informe clínico y adjuntar imágenes de respaldo.
            </p>
          </div>
        </div>

        {mensaje && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {mensaje}
          </div>
        )}

        {pendientes.length === 0 ? (
          <div className="bg-white rounded-xl shadow border border-slate-200 p-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">¡Bandeja al día!</h3>
            <p className="text-sm text-slate-500 mt-1">
              No tienes análisis pendientes asignados en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendientes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col justify-between hover:border-[#0B4F6C]/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F6C] bg-cyan-50 px-2.5 py-1 rounded-md">
                      {item.tipos_analisis.categorias_analisis.nombre}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {item.estado_analisis}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    {item.tipos_analisis.nombre}
                  </h3>

                  <div className="text-sm text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p>
                      <strong className="text-slate-700">Solicitud:</strong> #{item.solicitud_id}
                    </p>
                    <p>
                      <strong className="text-slate-700">Paciente:</strong>{' '}
                      {item.solicitudes.pacientes.nombre_completo} (CI: {item.solicitudes.pacientes.ci})
                    </p>
                    <p>
                      <strong className="text-slate-700">Médico:</strong>{' '}
                      {item.solicitudes.medicos.nombre_completo}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => abrirModal(item)}
                  className="mt-4 w-full bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
                >
                  Cargar Resultado Clínico
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL PARA CARGAR RESULTADO E IMÁGENES */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#0B4F6C] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{seleccionado.tipos_analisis.nombre}</h2>
                <p className="text-xs text-cyan-100">
                  Paciente: {seleccionado.solicitudes.pacientes.nombre_completo} — Solicitud #
                  {seleccionado.solicitud_id}
                </p>
              </div>
              <button onClick={() => setSeleccionado(null)} className="cursor-pointer hover:text-cyan-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubirResultado} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Informe Clínico / Resultados *
                </label>
                <textarea
                  required
                  rows="6"
                  value={informeTexto}
                  onChange={(e) => setInformeTexto(e.target.value)}
                  placeholder="Escribe aquí los valores obtenidos, observaciones microscópicas y conclusiones del análisis..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Imágenes de Respaldo (opcional, máx. 5)
                </label>
                <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#0B4F6C] bg-slate-50 transition">
                  <Upload className="w-5 h-5 text-[#0B4F6C]" />
                  <span className="text-xs text-slate-600">
                    {imagenes.length > 0
                      ? `${imagenes.length} imagen(es) seleccionada(s)`
                      : 'Seleccionar imágenes (PNG, JPG)...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setImagenes(Array.from(e.target.files).slice(0, 5))}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSeleccionado(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold px-6 py-2 rounded-lg text-sm transition cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : 'Guardar Resultado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}