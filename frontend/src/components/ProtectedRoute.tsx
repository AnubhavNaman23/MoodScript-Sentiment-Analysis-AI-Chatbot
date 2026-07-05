import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../store/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
