import React from 'react';
import { CloudOff, Check, Loader2, AlertTriangle, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATES = {
  idle: { icon: CloudOff, text: 'Salvo localmente', cls: 'text-muted-foreground' },
  pending: { icon: PenLine, text: 'Alterações não salvas…', cls: 'text-amber-600' },
  saving: { icon: Loader2, text: 'Salvando…', cls: 'text-primary', spin: true },
  saved: { icon: Check, text: 'Salvo automaticamente', cls: 'text-green-600' },
  error: { icon: AlertTriangle, text: 'Erro ao salvar', cls: 'text-destructive' }
};

export function AutoSaveIndicator({ status, lastSavedAt }) {
  const s = STATES[status] || STATES.idle;
  const Icon = s.icon;
  const time = lastSavedAt ? lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null;
  return (
    <span data-testid="autosave-status" data-status={status} className={cn('flex items-center gap-1.5 text-xs font-medium', s.cls)}>
      <Icon className={cn('h-3.5 w-3.5', s.spin && 'animate-spin')} />
      {s.text}{status === 'saved' && time ? ` às ${time}` : ''}
    </span>
  );
}
