import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Stethoscope, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Bem-vindo ao NexaClinq!");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Falha ao entrar. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-testid="login-page"
    >
      {/* Subtle background grid */}
      <div className="fixed inset-0 pointer-events-none select-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center" data-testid="login-brand">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground" data-testid="login-title">
            NexaClinq
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Plataforma de Gestão Clínica Inteligente.
            <br />
            Controle total do seu consultório em um só lugar.
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-border/60" data-testid="login-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Acessar Painel</CardTitle>
            <CardDescription>Digite suas credenciais para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button
                className="w-full h-11 font-semibold"
                type="submit"
                disabled={isLoading}
                data-testid="login-submit-button"
              >
                {isLoading ? 'Entrando...' : 'Acessar NexaClinq'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          NexaClinq &copy; {new Date().getFullYear()} &mdash; Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
