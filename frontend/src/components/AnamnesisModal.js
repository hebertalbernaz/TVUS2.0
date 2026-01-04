import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList } from 'lucide-react';

/**
 * AnamnesisModal (PEP)
 * - Adapta campos baseado em patient.scope (VET | HUMAN)
 */
export function AnamnesisModal({ open, onOpenChange, patient, defaultDoctorName, onSave }) {
  const isVet = (patient?.scope || 'VET') === 'VET';

  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorName, setDoctorName] = useState(defaultDoctorName || '');
  const [mainComplaint, setMainComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [conduct, setConduct] = useState('');

  // Vet physical
  const [vetPhysical, setVetPhysical] = useState({
    mucosa: '',
    tpc: '',
    hydration: '',
    lymph_nodes: '',
    auscultation: '',
    palpation: '',
    temperature: '',
    body_score: ''
  });

  // Human physical
  const [humanPhysical, setHumanPhysical] = useState({
    pa: '',
    fc: '',
    fr: '',
    sato2: '',
    temp: '',
    weight: '',
    height: '',
    general_status: '',
    systems_review: ''
  });

  const type = useMemo(() => (isVet ? 'vet' : 'human'), [isVet]);

  const reset = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setDoctorName(defaultDoctorName || '');
    setMainComplaint('');
    setHistory('');
    setDiagnosis('');
    setConduct('');
    setVetPhysical({ mucosa: '', tpc: '', hydration: '', lymph_nodes: '', auscultation: '', palpation: '', temperature: '', body_score: '' });
    setHumanPhysical({ pa: '', fc: '', fr: '', sato2: '', temp: '', weight: '', height: '', general_status: '', systems_review: '' });
  };

  const handleSave = async () => {
    if (!patient?.id) return;
    setSaving(true);
    try {
      await onSave({
        patient_id: patient.id,
        date: new Date(`${date}T12:00:00.000Z`).toISOString(),
        doctor_name: doctorName,
        type,
        main_complaint: mainComplaint,
        history,
        general_data: {},
        physical_exam: isVet ? vetPhysical : humanPhysical,
        diagnosis,
        conduct
      });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[800px]" data-testid="anamnesis-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Nova Anamnese ({isVet ? 'Veterinária' : 'Humana'})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input data-testid="anamnesis-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Profissional</Label>
                <Input data-testid="anamnesis-doctor-name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Nome do profissional" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Queixa Principal</Label>
              <Textarea data-testid="anamnesis-main-complaint" value={mainComplaint} onChange={(e) => setMainComplaint(e.target.value)} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>História / HDA</Label>
              <Textarea data-testid="anamnesis-history" value={history} onChange={(e) => setHistory(e.target.value)} rows={4} />
            </div>

            <div className="rounded-lg border bg-card p-4" data-testid="anamnesis-physical-exam">
              <div className="font-semibold text-foreground mb-3">Exame Físico</div>

              {isVet ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ['mucosa', 'Mucosas'],
                    ['tpc', 'TPC'],
                    ['hydration', 'Hidratação'],
                    ['lymph_nodes', 'Linfonodos'],
                    ['auscultation', 'Ausculta'],
                    ['palpation', 'Palpação'],
                    ['temperature', 'Temperatura'],
                    ['body_score', 'Escore Corporal']
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        data-testid={`anamnesis-vet-${key}`}
                        value={vetPhysical[key] || ''}
                        onChange={(e) => setVetPhysical((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ['pa', 'PA'],
                    ['fc', 'FC'],
                    ['fr', 'FR'],
                    ['sato2', 'SatO2'],
                    ['temp', 'Temperatura'],
                    ['weight', 'Peso'],
                    ['height', 'Altura'],
                    ['general_status', 'Estado Geral'],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        data-testid={`anamnesis-human-${key}`}
                        value={humanPhysical[key] || ''}
                        onChange={(e) => setHumanPhysical((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-3 space-y-2">
                    <Label>Revisão de Sistemas (ISDA)</Label>
                    <Textarea
                      data-testid="anamnesis-human-systems-review"
                      value={humanPhysical.systems_review || ''}
                      onChange={(e) => setHumanPhysical((p) => ({ ...p, systems_review: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Diagnóstico</Label>
              <Textarea data-testid="anamnesis-diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Conduta</Label>
              <Textarea data-testid="anamnesis-conduct" value={conduct} onChange={(e) => setConduct(e.target.value)} rows={3} />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button data-testid="anamnesis-cancel" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button data-testid="anamnesis-save" onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
