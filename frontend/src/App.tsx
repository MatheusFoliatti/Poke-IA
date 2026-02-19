// src/App.tsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { PokedexMain } from './components/Pokedex/PokedexMain';
import PokedexAnimation from './components/Pokedex/PokedexAnimation';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PokedexRoute() {
  const [animationDone, setAnimationDone] = useState(false);

  if (!animationDone) {
    return <PokedexAnimation onComplete={() => setAnimationDone(true)} />;
  }

  return <PokedexMain />;
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/pokedex"
          element={
            <ProtectedRoute>
              <PokedexRoute />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;