import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Heart, Save, CheckCircle2, FileText, Printer, X, Copy, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';
import { ECG_RHYTHMS, ECG_REFERENCE, ECG_NORMAL_TEMPLATE } from '@/lib/cardio_formulas';

// ─── Hydration ───
function hydrateFromExam(exam) {
  const s = exam?.organs_data?.[0]?.measurements?._structured;
  if (s?.type === 'electrocardiogram') return s;
  if (exam?.report_content) return { interpretation: exam.report_content, conclusion: exam.conclusion || '' };
  return null;
}

// ─── Keyboard shortcuts ───
function useECGShortcuts(onSave, onCopy) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave(); }
      if (e.altKey && e.key === 'c') { e.preventDefault(); onCopy(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onCopy]);
}

export function ElectrocardiogramEditor({ exam, onSave, isSaving, onCancel }) {
  const { practice } = useLicense();
  const refs = ECG_REFERENCE[practice] || ECG_REFERENCE.vet;
  const normalTpl = ECG_NORMAL_TEMPLATE[practice] || ECG_NORMAL_TEMPLATE.vet;

  const saved = hydrateFromExam(exam);

  // ─── State: Technical data ───
  const [hr, setHr] = useState(saved?.hr || '');
  const [rhythm, setRhythm] = useState(saved?.rhythm || 'sinusal');
  const [mea, setMea] = useState(saved?.mea || '');

  // ─── State: Waves & Intervals ───
  const [waves, setWaves] = useState(saved?.waves || {
    p_duration: '', p_amplitude: '', pr_interval: '', qrs_duration: '', qt_interval: '',
  });

  // ─── State: Report ───
  const [interpretation, setInterpretation] = useState(saved?.interpretation || '');
  const [conclusion, setConclusion] = useState(saved?.conclusion || '');

  const updateWave = (key, val) => setWaves((p) => ({ ...p, [key]: val }));

  const loadNormal = () => {
    setInterpretation(normalTpl.interpretation);
    setConclusion(normalTpl.conclusion);
  };

  // ─── Build clipboard text ───
  const buildFullText = useCallback(() => {
    const rhythmLabel = ECG_RHYTHMS.find((r) => r.value === rhythm)?.label || rhythm;
    let t = 'RELATÓRIO ELETROCARDIOGRÁFICO\n';
    t += `Prática: ${practice === 'human' ? 'Humana' : 'Veterinária'}\n\n`;
    t += `─── DADOS TÉCNICOS ───\n`;
    t += `FC: ${hr || '--'} bpm\n`;
    t += `Ritmo: ${rhythmLabel}\n`;
    if (mea) t += `Eixo Médio (MEA): ${mea}°\n`;
    t += `\n─── ONDAS E INTERVALOS ───\n`;
    const waveEntries = [
      ['p_duration', 'Duração P'], ['p_amplitude', 'Amplitude P'],
      ['pr_interval', 'Intervalo PR'], ['qrs_duration', 'Duração QRS'],
      ['qt_interval', 'Intervalo QT'],
    ];
    waveEntries.forEach(([k, label]) => {
      if (waves[k]) t += `${label}: ${waves[k]} ${refs[k]?.unit || ''}\n`;
    });
    t += `\n─── INTERPRETAÇÃO ───\n${interpretation || '(sem interpretação)'}\n`;
    t += `\n─── CONCLUSÃO ───\n${conclusion || '(sem conclusão)'}`;
    return t;
  }, [hr, rhythm, mea, waves, interpretation, conclusion, practice, refs]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildFullText());
      toast.success('Laudo copiado para a área de transferência!');
    } catch { toast.error('Erro ao copiar.'); }
  }, [buildFullText]);

  // ─── Save ───
  const handleSave = useCallback(() => {
    const structured = {
      type: 'electrocardiogram', practice, hr, rhythm, mea, waves, interpretation, conclusion,
    };
    const rhythmLabel = ECG_RHYTHMS.find((r) => r.value === rhythm)?.label || rhythm;
    onSave({
      organs_data: [{
        organ_name: `ECG (${rhythmLabel})`,
        report_text: interpretation,
        measurements: { _structured: structured, hr, rhythm, mea, ...waves },
        visual_data: null,
      }],
      report_content: interpretation,
      conclusion,
    });
  }, [hr, rhythm, mea, waves, interpretation, conclusion, practice, onSave]);

  useECGShortcuts(handleSave, handleCopy);

  // Helper for wave input
  const WaveInput = ({ waveKey }) => {
    const ref = refs[waveKey];
    if (!ref) return null;
    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{ref.label} ({ref.unit})</Label>
        <Input
          type="number" step="0.01" value={waves[waveKey]} onChange={(e) => updateWave(waveKey, e.target.value)}
          placeholder={ref.placeholder}
          data-testid={`ecg-${waveKey}`}
        />
        <p className="text-[9px] text-muted-foreground">Ref: {ref.normal}</p>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background p-4 md:p-6 overflow-y-auto" data-testid="ecg-editor">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground" data-testid="ecg-title">Eletrocardiograma</h2>
              <p className="text-xs text-muted-foreground">
                Ritmo, Ondas e Intervalos &bull;{' '}
                <Badge variant="outline" className="text-[10px] ml-1" data-testid="ecg-practice-badge">
                  {practice === 'human' ? 'Humana' : 'Veterinária'}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={loadNormal}
                className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30"
                data-testid="ecg-load-normal-btn">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Laudo Normal
              </Button>
            </TooltipTrigger><TooltipContent>Insere template de laudo normal</TooltipContent></Tooltip>

            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleCopy} data-testid="ecg-copy-btn">
                <Copy className="h-4 w-4 mr-1.5" /> Copiar
              </Button>
            </TooltipTrigger><TooltipContent>Alt + C</TooltipContent></Tooltip>

            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel} data-testid="ecg-cancel-btn">
                <X className="h-4 w-4 mr-1.5" /> Cancelar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="ecg-print-btn">
              <Printer className="h-4 w-4 mr-1.5" /> Imprimir
            </Button>

            <Tooltip><TooltipTrigger asChild>
              <Button size="sm" onClick={handleSave} disabled={isSaving} data-testid="ecg-save-btn">
                <Save className="h-4 w-4 mr-1.5" /> {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </TooltipTrigger><TooltipContent>Ctrl + S</TooltipContent></Tooltip>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
          {/* COL 1: Technical + Waves */}
          <div className="space-y-4">
            <Card data-testid="ecg-technical-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dados Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    FC ({refs.hr.unit})
                  </Label>
                  <Input
                    type="number" value={hr} onChange={(e) => setHr(e.target.value)}
                    placeholder={refs.hr.placeholder}
                    className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                    data-testid="ecg-hr-input"
                  />
                  <p className="text-[9px] text-muted-foreground">Ref: {refs.hr.normal}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ritmo</Label>
                  <Select value={rhythm} onValueChange={setRhythm}>
                    <SelectTrigger data-testid="ecg-rhythm-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ECG_RHYTHMS.map((r) => (
                        <SelectItem key={r.value} value={r.value} data-testid={`ecg-rhythm-${r.value}`}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Eixo Médio - MEA ({refs.mea.unit})</Label>
                  <Input
                    type="number" value={mea} onChange={(e) => setMea(e.target.value)}
                    placeholder={refs.mea.placeholder}
                    data-testid="ecg-mea-input"
                  />
                  <p className="text-[9px] text-muted-foreground">Ref: {refs.mea.normal}</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="ecg-waves-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ondas e Intervalos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WaveInput waveKey="p_duration" />
                <WaveInput waveKey="p_amplitude" />
                <Separator />
                <WaveInput waveKey="pr_interval" />
                <WaveInput waveKey="qrs_duration" />
                <Separator />
                <WaveInput waveKey="qt_interval" />
              </CardContent>
            </Card>
          </div>

          {/* COL 2+3: Report */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            {/* Quick summary bar */}
            <div className="flex flex-wrap gap-3 p-3 bg-muted/30 border border-border rounded-lg" data-testid="ecg-summary-bar">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-red-500" />
                <span className="text-sm font-bold text-foreground">{hr || '--'}</span>
                <span className="text-xs text-muted-foreground">bpm</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  {ECG_RHYTHMS.find((r) => r.value === rhythm)?.label || '--'}
                </span>
              </div>
              {mea && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <div>
                    <span className="text-sm text-foreground">MEA: {mea}°</span>
                  </div>
                </>
              )}
            </div>

            <Card className="flex-1 flex flex-col min-h-[200px]" data-testid="ecg-interpretation-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" /> Interpretação
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  className="flex-1 resize-none text-sm leading-relaxed min-h-[180px]"
                  placeholder="Descreva a interpretação do traçado ou use 'Laudo Normal'..."
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  data-testid="ecg-interpretation-textarea"
                />
              </CardContent>
            </Card>

            <Card data-testid="ecg-conclusion-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Impressão Diagnóstica / Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="resize-none text-sm leading-relaxed min-h-[90px]"
                  placeholder="Conclusão diagnóstica..."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  data-testid="ecg-conclusion-textarea"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
