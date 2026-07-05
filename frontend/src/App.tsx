import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "./store/theme";
import { PaperBackground } from "./components/PaperBackground";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import EntryDetail from "./pages/EntryDetail";
import Chat from "./pages/Chat";
import Insights from "./pages/Insights";

export default function App() {
  const dark = useTheme((s) => s.dark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <div className="relative min-h-screen">
      <PaperBackground />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/journal" element={<Journal />} />
            <Route path="/app/journal/:id" element={<EntryDetail />} />
            <Route path="/app/chat" element={<Chat />} />
            <Route path="/app/insights" element={<Insights />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
