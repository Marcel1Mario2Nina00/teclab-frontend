import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SuscripcionCentro from './pages/SuscripcionCentro';
import MedicoDashboard from './pages/MedicoDashboard';
import RecepcionistaDashboard from './pages/RecepcionistaDashboard';
import LaboratoristaDashboard from './pages/LaboratoristaDashboard';

// Vista temporal para probar el ingreso por rol
function PanelTemporal({ titulo }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B4F6C]">{titulo}</h1>
          <p className="text-slate-600 text-sm">
            Conectado como: <strong>{user?.username}</strong> ({user?.rol})
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

function RutaProtegida({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/suscripcion" element={<SuscripcionCentro />} />
          <Route
            path="/medico"
            element={
              <RutaProtegida>
                <MedicoDashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/recepcionista"
            element={
              <RutaProtegida>
                <RecepcionistaDashboard />
              </RutaProtegida>
            }
          />
        <Route
          path="/laboratorista"
          element={
            <RutaProtegida>
              <LaboratoristaDashboard />
            </RutaProtegida>
          }
        />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}