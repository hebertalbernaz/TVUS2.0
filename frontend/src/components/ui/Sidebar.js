import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLicense } from '../../contexts/LicenseContext';
import { LayoutGrid, FlaskConical, DollarSign, Settings, Pill, Activity, Lock, PawPrint } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export function Sidebar() {
  const { hasModule, terms } = useLicense();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const modules = [
    { id: 'ultrasound', name: 'Ultrassom', icon: Activity, path: '/ultrasound', enabled: true, highlight: true },
    { id: 'core', name: terms.patient_label + 's', icon: LayoutGrid, path: '/', enabled: true },
    { id: 'drugs_manager', name: 'Banco de Medicamentos', icon: Pill, path: '/prescription', enabled: hasModule('prescription') },
    { id: 'lab_vet', name: 'Laboratório', icon: FlaskConical, path: '/lab', enabled: hasModule('lab_vet') },
    { id: 'financial', name: 'Financeiro', icon: DollarSign, path: '/financial', enabled: hasModule('financial') }
  ];

  return (
    <div className="h-screen w-64 bg-card border-r flex flex-col fixed left-0 top-0 z-50" data-testid="app-sidebar">
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center text-primary">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">NexaClinq</h1>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Veterinária • Offline</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {modules.filter((m) => m.enabled).map((module) => (
          <Link key={module.id} to={module.path} data-testid={`sidebar-link-${module.id}`}>
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              isActive(module.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              module.highlight && !isActive(module.path) && 'text-primary font-semibold'
            )}>
              <module.icon className="h-4 w-4" />
              {module.name}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="mb-3 flex items-center gap-2 rounded border bg-background p-2 text-[11px] text-muted-foreground" data-testid="sidebar-practice-badge">
          <Lock className="h-3 w-3" /> Modo Veterinário (Humano bloqueado)
        </div>
        <Link to="/settings" data-testid="sidebar-link-settings">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Settings className="h-4 w-4 mr-2" /> Configurações
          </Button>
        </Link>
      </div>
    </div>
  );
}
