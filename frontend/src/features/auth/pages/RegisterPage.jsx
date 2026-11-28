import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, UserPlus } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, submitting } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Completa tu nombre y correo electrónico.');
      return;
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (result.ok) {
      toast.success('Cuenta creada e iniciaste sesión.');
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
          <CardTitle className="text-2xl font-bold text-white">Crear cuenta</CardTitle>
          <CardDescription className="text-slate-400">
            Registra un nuevo usuario para comenzar a trabajar.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="register-name" className="text-slate-300">
                Nombre completo
              </Label>
              <Input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email" className="text-slate-300">
                Correo electrónico
              </Label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-password" className="text-slate-300">
                Contraseña (mínimo 8 caracteres)
              </Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-sky-400 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};