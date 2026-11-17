import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RutaProtegida } from './components/RutaProtegida';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Vehiculos } from './pages/Vehiculos';
import { Conductores } from './pages/Conductores';
import { Viajes } from './pages/Viajes';
import './Styles.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* Rutas Protegidas */}
                    <Route
                        path="/vehiculos"
                        element={
                            <RutaProtegida>
                                <Vehiculos />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/conductores"
                        element={
                            <RutaProtegida>
                                <Conductores />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/viajes"
                        element={
                            <RutaProtegida>
                                <Viajes />
                            </RutaProtegida>
                        }
                    />

                    {/* Redirección por defecto si ingresan una URL inexistente */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;