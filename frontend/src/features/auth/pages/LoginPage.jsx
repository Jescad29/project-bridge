import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, LogIn } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, submitting } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    const result = await login({
      email: email.trim(),
      password,
    });

    if (result.ok) {
      toast.success(`Bienvenido, ${result.user.name}`);
      navigate('/projects', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-sky-400">
            <div className="p-2 bg-sky-600/20 rounded-lg border border-sky-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white">Project Bridge</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Iniciar sesión</CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa tus credenciales para acceder a la plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-slate-300">
                Correo electrónico
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-slate-300">
                Contraseña
              </Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Ingresando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-sky-400 hover:underline font-medium">
              Crear cuenta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};