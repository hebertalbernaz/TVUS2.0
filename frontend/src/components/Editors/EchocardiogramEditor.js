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
  Activity, Save, CheckCircle2, FileText, Printer, X, Copy, Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';
import {
  calculateAllEcho, generateEchoAutoReport,
  ECHO_REFERENCE, VALVE_OPTIONS, VALVES, ECHO_NORMAL_TEMPLATE,
} from '@/lib/cardio_formulas';

// ─── Hydration ───
function hydrateFromExam(exam) {
  const s = exam?.organs_data?.[0]?.measurements?._structured;
  if (s?.type === 'echocardiogram') return s;
  // Legacy: old EchocardiogramEditor format
  const m = exam?.organs_data?.[0]?.measurements;
  if (m && (m.dived || m.sivd)) {
    return {
      measurements: { sivd: m.sivd || '', dived: m.dived || '', ppve: m.ppve || '', sivs: m.sivs || '', dives: m.dives || '', ppves: m.ppves || '', ae: m.ae || '', ao: m.ao || '', hr: m.hr || '' },
      reportText: exam?.organs_data?.[0]?.report_text || '',
      valves: m.valves || {},
    };
  }
  if (exam?.report_content) return { reportText: exam.report_content };
  return null;
}

// ─── Keyboard shortcut hook ───
function useCardioShortcuts(onSave, onCopy) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave(); }
      if (e.altKey && e.key === 'c') { e.preventDefault(); onCopy(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onCopy]);
}

// ─── Measurement Input ───
function MeasureInput({ label, value, onChange, unit = 'cm', placeholder = '0.00', highlight, testId }) {
  return (
    <div className="space-y-1">
      <Label className={`text-xs ${highlight ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
        {label} ({unit})
      </Label>
      <Input
        type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={highlight ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/30' : ''}
        data-testid={testId}
      />
    </div>
  );
}

export function EchocardiogramEditor({ exam, onSave, isSaving, onCancel }) {
  const { practice } = useLicense();
  const refs = ECHO_REFERENCE[practice] || ECHO_REFERENCE.vet;
  const normalTpl = ECHO_NORMAL_TEMPLATE[practice] || ECHO_NORMAL_TEMPLATE.vet;

  const saved = hydrateFromExam(exam);

  // ─── State ───
  const [m, setM] = useState(saved?.measurements || {
    sivd: '', dived: '', ppve: '', sivs: '', dives: '', ppves: '', ae: '', ao: '', hr: '',
  });
  const [valves, setValves] = useState(saved?.valves || {
    mitral: 'normal', tricuspide: 'normal', aortica: 'normal', pulmonar: 'normal',
  });
  const [reportText, setReportText] = useState(saved?.reportText || saved?.findings || '');
  const [conclusion, setConclusion] = useState(saved?.conclusion || '');
  const [calc, setCalc] = useState({});

  // Recalculate on every measurement change
  useEffect(() => { setCalc(calculateAllEcho(m)); }, [m]);

  const updateM = (key, val) => setM((p) => ({ ...p, [key]: val }));
  const updateValve = (key, val) => setValves((p) => ({ ...p, [key]: val }));

  // ─── Load Normal ───
  const loadNormal = () => {
    setReportText(normalTpl.findings);
    setConclusion(normalTpl.conclusion);
  };

  // ─── Auto-generate text from calculations ───
  const handleAutoReport = () => {
    const auto = generateEchoAutoReport(m, calc, valves, practice);
    setReportText((prev) => prev ? prev + '\n\n' + auto : auto);
  };

  // ─── Build clipboard text ───
  const buildFullText = useCallback(() => {
    let t = 'RELATÓRIO ECOCARDIOGRÁFICO\n';
    t += `Prática: ${practice === 'human' ? 'Humana' : 'Veterinária'}\n`;
    if (m.hr) t += `FC: ${m.hr} bpm\n`;
    t += '\n─── MODO M ───\n';
    if (m.sivd) t += `SIVd: ${m.sivd} cm | `;
    if (m.dived) t += `LVIDd: ${m.dived} cm | `;
    if (m.ppve) t += `PPVEd: ${m.ppve} cm\n`;
    if (m.sivs) t += `SIVs: ${m.sivs} cm | `;
    if (m.dives) t += `LVIDs: ${m.dives} cm | `;
    if (m.ppves) t += `PPVEs: ${m.ppves} cm\n`;
    if (m.ao) t += `Ao: ${m.ao} cm | `;
    if (m.ae) t += `AE: ${m.ae} cm\n`;
    t += '\n─── CÁLCULOS ───\n';
    if (calc.fs) t += `FS: ${calc.fs}% | `;
    if (calc.ef) t += `FE: ${calc.ef}% | `;
    if (calc.la_ao) t += `AE/Ao: ${calc.la_ao}\n`;
    if (calc.edv) t += `EDV: ${calc.edv} ml | ESV: ${calc.esv} ml\n`;
    const abnormalValves = Object.entries(valves).filter(([, v]) => v !== 'normal');
    if (abnormalValves.length > 0) {
      t += '\n─── VÁLVULAS ───\n';
      abnormalValves.forEach(([k, v]) => {
        const vName = VALVES.find((vv) => vv.id === k)?.label || k;
        const vLabel = VALVE_OPTIONS.find((o) => o.value === v)?.label || v;
        t += `${vName}: ${vLabel}\n`;
      });
    }
    t += `\n─── ACHADOS ───\n${reportText || '(sem achados)'}\n`;
    t += `\n─── CONCLUSÃO ───\n${conclusion || '(sem conclusão)'}`;
    return t;
  }, [m, calc, valves, reportText, conclusion, practice]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildFullText());
      toast.success('Laudo copiado para a área de transferência!');
    } catch { toast.error('Erro ao copiar.'); }
  }, [buildFullText]);

  // ─── Save ───
  const handleSave = useCallback(() => {
    const structured = {
      type: 'echocardiogram', practice, measurements: m, valves, findings: reportText, conclusion,
    };
    onSave({
      organs_data: [{
        organ_name: 'Coração (Ecocardiograma)',
        report_text: reportText,
        measurements: { ...m, ...calc, _structured: structured, valves },
        visual_data: null,
      }],
      report_content: reportText,
      conclusion,
    });
  }, [m, calc, valves, reportText, conclusion, practice, onSave]);

  useCardioShortcuts(handleSave, handleCopy);

  // ─── Calc result display helper ───
  const CalcRow = ({ label, value, unit, warn }) => (
    <div className="flex justify-between items-end border-b border-border/40 pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-xl font-mono font-bold ${warn ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
        data-testid={`echo-calc-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
        {value || '--'}{unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
      </span>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background p-4 md:p-6 overflow-y-auto" data-testid="echo-editor">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground" data-testid="echo-title">Ecocardiograma</h2>
              <p className="text-xs text-muted-foreground">
                Modo M, 2D e Doppler &bull;{' '}
                <Badge variant="outline" className="text-[10px] ml-1" data-testid="echo-practice-badge">
                  {practice === 'human' ? 'Humana' : 'Veterinária'}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={loadNormal}
                className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30"
                data-testid="echo-load-normal-btn">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Laudo Normal
              </Button>
            </TooltipTrigger><TooltipContent>Insere template de laudo normal</TooltipContent></Tooltip>

            <Button variant="outline" size="sm" onClick={handleAutoReport} data-testid="echo-auto-report-btn">
              <Calculator className="h-4 w-4 mr-1.5" /> Gerar Laudo
            </Button>

            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleCopy} data-testid="echo-copy-btn">
                <Copy className="h-4 w-4 mr-1.5" /> Copiar
              </Button>
            </TooltipTrigger><TooltipContent>Alt + C</TooltipContent></Tooltip>

            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel} data-testid="echo-cancel-btn">
                <X className="h-4 w-4 mr-1.5" /> Cancelar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="echo-print-btn">
              <Printer className="h-4 w-4 mr-1.5" /> Imprimir
            </Button>

            <Tooltip><TooltipTrigger asChild>
              <Button size="sm" onClick={handleSave} disabled={isSaving} data-testid="echo-save-btn">
                <Save className="h-4 w-4 mr-1.5" /> {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </TooltipTrigger><TooltipContent>Ctrl + S</TooltipContent></Tooltip>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* COL 1: Measurements */}
          <div className="lg:col-span-3 space-y-4">
            <Card data-testid="echo-mode-m-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ventrículo Esquerdo (Modo M)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium mb-2">Diástole</p>
                <div className="grid grid-cols-3 gap-2">
                  <MeasureInput label="SIVd" value={m.sivd} onChange={(v) => updateM('sivd', v)} testId="echo-sivd" />
                  <MeasureInput label="LVIDd" value={m.dived} onChange={(v) => updateM('dived', v)} highlight testId="echo-dived" />
                  <MeasureInput label="PPVEd" value={m.ppve} onChange={(v) => updateM('ppve', v)} testId="echo-ppve" />
                </div>
                <Separator className="my-2" />
                <p className="text-[10px] text-muted-foreground font-medium mb-2">Sístole</p>
                <div className="grid grid-cols-3 gap-2">
                  <MeasureInput label="SIVs" value={m.sivs} onChange={(v) => updateM('sivs', v)} testId="echo-sivs" />
                  <MeasureInput label="LVIDs" value={m.dives} onChange={(v) => updateM('dives', v)} highlight testId="echo-dives" />
                  <MeasureInput label="PPVEs" value={m.ppves} onChange={(v) => updateM('ppves', v)} testId="echo-ppves" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="echo-atrio-aorta-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Átrio / Aorta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <MeasureInput label="Aorta" value={m.ao} onChange={(v) => updateM('ao', v)} testId="echo-ao" />
                  <MeasureInput label="AE" value={m.ae} onChange={(v) => updateM('ae', v)} testId="echo-ae" />
                </div>
                <div className="mt-3">
                  <MeasureInput label="FC" value={m.hr} onChange={(v) => updateM('hr', v)} unit="bpm" placeholder="120" testId="echo-hr" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COL 2: Calculations + Valves */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-slate-900 dark:bg-slate-950 text-white border-slate-800" data-testid="echo-hemodynamics-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Hemodinâmica</CardTitle>
                <Calculator className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent className="space-y-3">
                <CalcRow label={refs.fs.label} value={calc.fs} unit="%" warn={calc.fs && parseFloat(calc.fs) < 28} />
                <CalcRow label={refs.ef.label} value={calc.ef} unit="%" warn={calc.ef && parseFloat(calc.ef) < (practice === 'human' ? 55 : 50)} />
                <CalcRow label={refs.la_ao.label} value={calc.la_ao} warn={calc.la_ao && parseFloat(calc.la_ao) > (practice === 'human' ? 1.3 : 1.6)} />
                <Separator className="border-slate-700" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-500">EDV</span>
                    <span className="font-mono text-lg">{calc.edv || '--'} <span className="text-xs text-slate-500">ml</span></span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">ESV</span>
                    <span className="font-mono text-lg">{calc.esv || '--'} <span className="text-xs text-slate-500">ml</span></span>
                  </div>
                </div>
                {calc.lv_mass && (
                  <div><span className="text-[10px] text-slate-500">Massa VE: </span><span className="font-mono">{calc.lv_mass}g</span></div>
                )}
                <div className="text-[9px] text-slate-600 pt-1">
                  Ref: FS {refs.fs.normal} | FE {refs.ef.normal} | AE/Ao {refs.la_ao.normal}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="echo-valves-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Válvulas (Doppler)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {VALVES.map((v) => (
                  <div key={v.id} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{v.label}</Label>
                    <Select value={valves[v.id] || 'normal'} onValueChange={(val) => updateValve(v.id, val)}>
                      <SelectTrigger className="h-8 text-xs" data-testid={`echo-valve-${v.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALVE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* COL 3: Report text */}
          <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-[200px]" data-testid="echo-findings-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" /> Achados Ecocardiográficos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  className="flex-1 resize-none text-sm leading-relaxed min-h-[160px]"
                  placeholder="Descreva os achados ou use 'Laudo Normal' / 'Gerar Laudo'..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  data-testid="echo-findings-textarea"
                />
              </CardContent>
            </Card>
            <Card data-testid="echo-conclusion-card">
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
                  data-testid="echo-conclusion-textarea"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
