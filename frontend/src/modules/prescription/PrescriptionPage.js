import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Printer,
  Save,
  ArrowLeft,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { db } from '@/services/database';
import { getDatabase, genId } from '@/core/database/db';
import { useLicense } from '@/contexts/LicenseContext';
import { DrugSelector } from '@/components/DrugSelector';
import { toast } from 'sonner';

export default function PrescriptionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { practice, terms } = useLicense();

  const [patient, setPatient] = useState(null);
  const [settings, setSettings] = useState({});
  const [prescribedDrugs, setPrescribedDrugs] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) return;
      try {
        const [p, s] = await Promise.all([
          db.getPatient(patientId),
          db.getSettings(),
        ]);
        setPatient(p);
        setSettings(s);
      } catch (e) {
        console.error(e);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  const handleAddDrug = (drugItem) => {
    setPrescribedDrugs((prev) => [...prev, drugItem]);
  };

  const handleRemoveDrug = (index) => {
    setPrescribedDrugs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!prescribedDrugs.length) {
      toast.warning('Adicione ao menos um medicamento antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      const rxdb = await getDatabase();

      // Build prescription text for history display
      const prescriptionText = prescribedDrugs
        .map((d, i) => `${i + 1}) ${d.formattedText}`)
        .join('\n');

      const fullText = notes
        ? `${prescriptionText}\n\nObs: ${notes}`
        : prescriptionText;

      await rxdb.prescriptions.insert({
        id: genId(),
        patient_id: patientId,
        doctor_name: settings.veterinarian_name || '',
        date: new Date().toISOString(),
        items: prescribedDrugs,
        notes: notes,
      });

      // Also save as clinical_documents for unified timeline
      await rxdb.clinical_documents.insert({
        id: genId(),
        patient_id: patientId,
        type: 'prescription',
        title: terms.prescription_header || 'Receituário',
        content: fullText,
        doctor_name: settings.veterinarian_name || '',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success('Receita salva no histórico!');
      navigate(`/history/${patientId}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar receita.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Doctor / CRM info for footer
  const doctorName = settings.veterinarian_name || '';
  const crmLabel = practice === 'vet' ? 'CRMV' : 'CRM';
  const crmValue = settings.crmv || '';

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground" data-testid="prescription-loading">
        Carregando...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center" data-testid="prescription-not-found">
        <p className="text-destructive mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate('/')} data-testid="go-back-btn">
          Voltar
        </Button>
      </div>
    );
  }

  const todayFormatted = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-background" data-testid="prescription-page">
      {/* ═══ TOP BAR (no-print) ═══ */}
      <div className="no-print p-4 md:p-6 pb-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              data-testid="prescription-back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="prescription-title">
                {terms.prescription_header}
              </h1>
              <p className="text-sm text-muted-foreground">
                {terms.patient_label}:{' '}
                <span className="font-semibold text-foreground">{patient.name}</span>
                {practice === 'vet' && patient.weight && (
                  <span> &bull; {patient.weight}kg</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
              data-testid="prescription-save-button"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar no Histórico'}
            </Button>
            <Button onClick={handlePrint} data-testid="prescription-print-button">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Receita
            </Button>
          </div>
        </div>
      </div>

      <div className="no-print px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ═══ LEFT: Drug Selector ═══ */}
          <div className="lg:col-span-2 space-y-4">
            <DrugSelector
              patientWeight={patient.weight}
              onAdd={handleAddDrug}
            />

            {/* Quick summary */}
            <Card className="p-4 bg-muted/30" data-testid="prescription-summary-card">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Resumo
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium">{patient.name}</span>
                </div>
                {practice === 'vet' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso:</span>
                    <span className="font-medium">{patient.weight || '--'} kg</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itens na receita:</span>
                  <Badge variant={prescribedDrugs.length > 0 ? 'default' : 'secondary'}>
                    {prescribedDrugs.length}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4" data-testid="prescription-notes-card">
              <label className="font-semibold text-sm mb-2 block text-foreground">
                Observações / Recomendações
              </label>
              <Textarea
                data-testid="prescription-notes-textarea"
                placeholder="Ex: Retorno em 7 dias, administrar com alimento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </Card>
          </div>

          {/* ═══ RIGHT: Prescription Paper Preview ═══ */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden" data-testid="prescription-paper-preview">
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Visualização da Receita
                </span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {todayFormatted}
                </Badge>
              </div>

              <div className="p-6 min-h-[400px] bg-white dark:bg-zinc-950">
                {prescribedDrugs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground" data-testid="prescription-empty-state">
                    <ClipboardList className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Nenhum medicamento adicionado.</p>
                    <p className="text-xs mt-1">Busque e adicione medicamentos ao lado.</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="prescription-drugs-list">
                    {prescribedDrugs.map((drug, idx) => (
                      <div
                        key={idx}
                        data-testid={`prescription-drug-item-${idx}`}
                        className="group flex items-start gap-3 p-3 rounded-lg border hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">
                            {drug.drugName}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap break-words">
                            {drug.formattedText}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveDrug(idx)}
                          data-testid={`prescription-remove-drug-${idx}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {notes && prescribedDrugs.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                      Observações
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/*  PRINTABLE AREA (hidden on screen)          */}
      {/* ═══════════════════════════════════════════ */}
      <div id="printable-report" data-testid="prescription-printable">
        {/* Generous top margin for pre-printed stationery */}
        <div style={{ paddingTop: '3cm' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              {terms.prescription_header}
            </h2>
            <p style={{ fontSize: '10pt', color: '#666', marginTop: '6px' }}>
              Data: {todayFormatted}
            </p>
          </div>

          {/* Patient info box */}
          <div className="patient-box" style={{ marginBottom: '24px' }}>
            <div className="pb-row">
              <span><strong>{terms.patient_label}:</strong> {patient?.name}</span>
              {practice === 'vet' && patient?.weight && (
                <span><strong>Peso:</strong> {patient.weight} kg</span>
              )}
            </div>
            {practice === 'vet' && (
              <div className="pb-row">
                {patient?.species && (
                  <span><strong>Espécie:</strong> {patient.species === 'dog' ? 'Canina' : patient.species === 'cat' ? 'Felina' : patient.species}</span>
                )}
                {patient?.breed && (
                  <span><strong>Raça:</strong> {patient.breed}</span>
                )}
              </div>
            )}
            {practice === 'human' && patient?.birth_year && (
              <div className="pb-row">
                <span><strong>Idade:</strong> {new Date().getFullYear() - parseInt(patient.birth_year)} anos</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid #000', marginBottom: '24px' }} />

          {/* Drug list */}
          {prescribedDrugs.map((drug, idx) => (
            <div key={idx} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
              <p style={{ margin: 0, fontSize: '12pt' }}>
                <strong>{idx + 1})</strong>{' '}
                <strong>{drug.drugName}</strong>
              </p>
              <p style={{ margin: '4px 0 0 20px', fontSize: '11pt', color: '#333' }}>
                {drug.formattedText}
              </p>
            </div>
          ))}

          {/* Notes */}
          {notes && (
            <div style={{ marginTop: '28px', borderTop: '1px dashed #ccc', paddingTop: '12px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase', color: '#555' }}>
                Observações:
              </p>
              <p style={{ fontSize: '11pt', whiteSpace: 'pre-wrap' }}>{notes}</p>
            </div>
          )}

          {/* Signature footer */}
          {(doctorName || crmValue) && (
            <div className="signature-box" style={{ marginTop: '80px' }}>
              <div className="signature-line" />
              <p style={{ fontSize: '11pt', fontWeight: 'bold', margin: '6px 0 2px' }}>
                {doctorName}
              </p>
              {crmValue && (
                <p style={{ fontSize: '10pt', color: '#555', margin: 0 }}>
                  {crmLabel}: {crmValue}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ BOTTOM ACTIONS (no-print) ═══ */}
      <div className="no-print px-4 md:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
            data-testid="prescription-cancel-bottom"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            data-testid="prescription-print-bottom"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            data-testid="prescription-save-bottom"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar no Histórico'}
          </Button>
        </div>
      </div>
    </div>
  );
}
