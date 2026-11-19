import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, Lock, User, Building2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      const rol = user.rol.toLowerCase();

      if (rol.includes('médico') || rol.includes('medico')) {
        navigate('/medico');
      } else if (rol.includes('recepcionista')) {
        navigate('/recepcionista');
      } else if (rol.includes('laboratorista')) {
        navigate('/laboratorista');
      } else {
        setError('Rol no reconocido en el sistema.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Encabezado */}
        <div className="bg-[#0B4F6C] p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 mb-3">
            <FlaskConical className="w-8 h-8 text-cyan-200" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">TECLAB</h1>
          <p className="text-cyan-100 text-sm mt-1">
            Sistema de Gestión de Laboratorio Clínico
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: dra.rojas"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B4F6C] hover:bg-[#093e55] text-white font-semibold py-2.5 rounded-lg transition cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-2">¿Eres un Centro Médico nuevo?</p>
            <Link
              to="/suscripcion"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B4F6C] hover:underline"
            >
              <Building2 className="w-4 h-4" />
              Solicitar suscripción con carta notariada
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}