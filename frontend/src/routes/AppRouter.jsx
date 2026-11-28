import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import { TasksPage } from "@/features/tasks/pages/TasksPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { UsersPage } from "@/features/users/pages/UsersPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* Cualquier ruta desconocida redirige al módulo principal */}
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}