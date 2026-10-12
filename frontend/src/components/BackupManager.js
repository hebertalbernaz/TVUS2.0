import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Upload, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBackup, downloadBlob, isEncryptedBackup, readBackupFile, restoreBackup } from '@/services/cryptoBackup';

const TABLE_LABELS = {
  patients: 'Pacientes',
  exams: 'Exames de imagem',
  lab_exams: 'Exames laboratoriais',
  prescriptions: 'Receitas',
  anamnesis: 'Anamneses',
  ophthalmo: 'Oftalmologia',
  financial: 'Lançamentos financeiros',
  media: 'Arquivos (DICOM/imagens)',
};

function Summary({ counts }) {
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {Object.entries(TABLE_LABELS).map(([key, label]) => (
        <li key={key} className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold text-foreground">{counts?.[key] ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}

export function BackupManager() {
  const [exportPassword, setExportPassword] = useState('');
  const [exporting, setExporting] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [restorePassword, setRestorePassword] = useState('');
  const [parsed, setParsed] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await createBackup(exportPassword.trim() || null);
      downloadBlob(blob, filename);
      toast.success('Backup gerado. Guarde o arquivo em local seguro.');
      setExportPassword('');
    } catch (e) {
      console.error('Erro ao gerar backup:', e);
      toast.error('Não foi possível gerar o backup.');
    } finally {
      setExporting(false);
    }
  };

  const resetRestore = () => {
    setPendingFile(null);
    setNeedsPassword(false);
    setRestorePassword('');
    setParsed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyze = async (file, password) => {
    setBusy(true);
    try {
      setParsed(await readBackupFile(file, password));
    } catch (e) {
      toast.error(e.message || 'Arquivo de backup inválido.');
    } finally {
      setBusy(false);
    }
  };

  const handleFileChosen = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (isEncryptedBackup(head)) {
      setNeedsPassword(true);
    } else {
      await analyze(file);
    }
  };

  const handleConfirmRestore = async () => {
    setBusy(true);
    try {
      await restoreBackup(parsed);
      toast.success('Backup restaurado. O aplicativo será reiniciado.');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      console.error('Erro ao restaurar backup:', e);
      toast.error('Falha ao restaurar. Seus dados atuais foram mantidos.');
      setBusy(false);
    }
  };

  const dialogOpen = !!pendingFile && (needsPassword || !!parsed);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2"><Download className="h-5 w-5 text-primary" /></div>
          <div>
            <h3 className="font-semibold text-foreground">Gerar backup</h3>
            <p className="text-sm text-muted-foreground">Baixa um arquivo com todos os pacientes, laudos, imagens e configurações.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backup-password" className="flex items-center gap-2"><Lock className="h-3 w-3" /> Senha (opcional)</Label>
          <Input
            id="backup-password"
            type="password"
            autoComplete="new-password"
            placeholder="Deixe vazio para um .zip sem senha"
            value={exportPassword}
            onChange={(e) => setExportPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Com senha, o arquivo fica criptografado. Sem a senha não é possível recuperá-lo.</p>
        </div>
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {exporting ? 'Gerando...' : 'Baixar backup'}
        </Button>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-500/10 p-2"><Upload className="h-5 w-5 text-amber-600" /></div>
          <div>
            <h3 className="font-semibold text-foreground">Restaurar backup</h3>
            <p className="text-sm text-muted-foreground">Carrega um backup neste computador. Use para trocar de máquina ou recuperar dados.</p>
          </div>
        </div>
        <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>A restauração substitui todos os dados atuais deste computador.</span>
        </div>
        <input ref={fileInputRef} type="file" accept=".zip,.tvusbak" className="hidden" onChange={handleFileChosen} />
        <Button variant="outline" className="w-full" disabled={busy} onClick={() => fileInputRef.current?.click()}>
          {busy && !dialogOpen ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Escolher arquivo de backup
        </Button>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open && !busy) resetRestore(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{parsed ? 'Confirmar restauração' : 'Backup protegido'}</DialogTitle>
            <DialogDescription>
              {parsed
                ? `Backup de ${new Date(parsed.manifest.created_at).toLocaleString('pt-BR')}. Os dados atuais serão substituídos por:`
                : 'Digite a senha usada ao gerar este backup.'}
            </DialogDescription>
          </DialogHeader>

          {parsed ? (
            <Summary counts={parsed.manifest.tables} />
          ) : (
            <Input
              type="password"
              autoFocus
              placeholder="Senha do backup"
              value={restorePassword}
              onChange={(e) => setRestorePassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && restorePassword) analyze(pendingFile, restorePassword); }}
            />
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={resetRestore} disabled={busy}>Cancelar</Button>
            {parsed ? (
              <Button variant="destructive" onClick={handleConfirmRestore} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Substituir e restaurar
              </Button>
            ) : (
              <Button onClick={() => analyze(pendingFile, restorePassword)} disabled={busy || !restorePassword}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Abrir backup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
