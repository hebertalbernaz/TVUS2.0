import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLicense } from '../../contexts/LicenseContext';
import { 
  LayoutGrid, 
  FileText, 
  Activity, 
  FlaskConical, 
  Eye, 
  DollarSign, 
  Settings, 
  LogOut,
  Dog,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { hasModule, practice, setPractice, terms } = useLicense();
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const modules = [
    {
      id: 'core',
      name: terms.patient_label + 's', // "Pacientes"
      icon: LayoutGrid,
      path: '/',
      enabled: hasModule('core')
    },
    {
      id: 'prescription',
      name: 'Receita Smart',
      icon: FileText,
      path: '/prescription',
      enabled: hasModule('prescription')
    },
    {
      id: 'cardio',
      name: terms.cardio_title,
      icon: Activity,
      path: '/cardio',
      enabled: hasModule('cardio')
    },
    {
      id: 'lab_vet',
      name: 'Laboratório',
      icon: FlaskConical,
      path: '/lab',
      enabled: hasModule('lab_vet')
    },
    {
      id: 'ophthalmo_human',
      name: 'Oftalmo Pro',
      icon: Eye,
      path: '/ophthalmo',
      enabled: hasModule('ophthalmo_human')
    },
    {
      id: 'financial',
      name: 'Financeiro',
      icon: DollarSign,
      path: '/financial',
      enabled: hasModule('financial')
    }
  ];

  return (
    <div className="h-screen w-64 bg-card border-r flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center text-primary">
           <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">TVUSVET</h1>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
            {practice === 'vet' ? 'Veterinary' : 'Human MD'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {modules.filter(m => m.enabled).map(module => (
          <Link key={module.id} to={module.path}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              isActive(module.path) 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <module.icon className="h-4 w-4" />
              {module.name}
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer / Dev Controls */}
      <div className="p-4 border-t bg-muted/30">
        <div className="mb-4 p-2 bg-background rounded border text-xs">
          <p className="font-semibold mb-2 text-muted-foreground">Dev Switcher:</p>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={practice === 'vet' ? 'default' : 'outline'} 
              className="h-7 flex-1 text-[10px]"
              onClick={() => setPractice('vet')}
            >
              <Dog className="h-3 w-3 mr-1" /> VET
            </Button>
            <Button 
              size="sm" 
              variant={practice === 'human' ? 'default' : 'outline'} 
              className="h-7 flex-1 text-[10px]"
              onClick={() => setPractice('human')}
            >
              <User className="h-3 w-3 mr-1" /> MD
            </Button>
          </div>
        </div>

        <Link to="/settings">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground mb-1">
            <Settings className="h-4 w-4 mr-2" /> Configurações
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>
    </div>
  );
}
