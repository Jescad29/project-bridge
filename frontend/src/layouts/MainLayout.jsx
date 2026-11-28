import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Layers,
  FolderKanban,
  CheckSquare,
  Building2,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

const NAVIGATION_ITEMS = [
  {
    name: "Proyectos",
    to: "/projects",
    icon: FolderKanban,
    badge: "Activo",
  },
  {
    name: "Tareas",
    to: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Clientes",
    to: "/clients",
    icon: Building2,
  },
  {
    name: "Usuarios",
    to: "/users",
    icon: Users,
  },
];

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const renderNavLinks = (onNavigate) =>
    NAVIGATION_ITEMS.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-zinc-50 shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-700 border-0"
            >
              {item.badge}
            </Badge>
          )}
        </NavLink>
      );
    });

  const renderSessionFooter = () => (
    <div className="space-y-2.5">
      {user && (
        <div className="px-2">
          <p className="text-xs font-semibold text-zinc-900 truncate">{user.name}</p>
          <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium">API v1 • En línea</span>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 flex">
      {/* Sidebar fijo en escritorio */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200/80 bg-white">
        <div className="flex h-16 items-center gap-3 px-5 border-b border-zinc-200/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-zinc-900 leading-none">
              Project Bridge
            </p>
            <span className="text-[11px] text-zinc-500">Workspace v1</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Módulos
          </p>
          <nav className="space-y-1">{renderNavLinks()}</nav>
        </div>

        <div className="p-4 border-t border-zinc-200/80">{renderSessionFooter()}</div>
      </aside>

      {/* Contenedor principal */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Barra superior móvil */}
        <header className="md:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/90 backdrop-blur-xs px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">Project Bridge</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Menú desplegable móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-3 space-y-3">
            <nav className="space-y-1">{renderNavLinks(() => setMobileMenuOpen(false))}</nav>
            <div className="pt-3 border-t border-zinc-200/80">{renderSessionFooter()}</div>
          </div>
        )}

        {/* Área dinámica donde react-router-dom inyecta cada módulo */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}