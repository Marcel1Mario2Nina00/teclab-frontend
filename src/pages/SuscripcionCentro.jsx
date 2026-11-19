import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Building2, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function SuscripcionCentro() {
  const [form, setForm] = useState({
    nombre: '',
    responsable: '',
    direccion: '',
    telefono: '',
    especialidades: '',
  });
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!archivo) {
      setError('Debe adjuntar la carta notariada en formato PDF.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append('carta_notariada', archivo);

      await api.post('/centros/suscribir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMensaje('¡Solicitud enviada! Un operador de TECLAB revisará su carta notariada para aprobar su centro.');
      setForm({ nombre: '', responsable: '', direccion: '', telefono: '', especialidades: '' });
      setArchivo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud de suscripción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B4F6C] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-cyan-200" />
            <div>
              <h1 className="text-xl font-bold">Suscripción de Centro Médico</h1>
              <p className="text-cyan-100 text-xs">Registro oficial mediante carta notariada</p>
            </div>
          </div>
          <Link to="/" className="text-sm text-cyan-100 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mensaje && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{mensaje}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Centro *</label>
              <input
                name="nombre"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Hospital San Vicente"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsable *</label>
              <input
                name="responsable"
                required
                value={form.responsable}
                onChange={handleChange}
                placeholder="Ej: Dr. Carlos Mendoza"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
              <input
                name="direccion"
                required
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ej: Av. Cristo Redentor, 3er Anillo"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 78511223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Especialidades</label>
            <textarea
              name="especialidades"
              rows="2"
              value={form.especialidades}
              onChange={handleChange}
              placeholder="Ej: Medicina Interna, Cardiología, Pediatría..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Carta Notariada (PDF) *
            </label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#0B4F6C] transition bg-slate-50">
              <Upload className="w-5 h-5 text-[#0B4F6C]" />
              <span className="text-sm text-slate-600">
                {archivo ? archivo.name : 'Seleccionar archivo PDF...'}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold py-2.5 rounded-lg transition cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Enviando solicitud...' : 'Enviar Solicitud de Suscripción'}
          </button>
        </form>
      </div>
    </div>
  );
}