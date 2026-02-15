import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bone,
  Save,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';
import {
  RADIOLOGY_REGIONS,
  RADIOLOGY_PROJECTIONS,
  RADIOLOGY_NORMAL_TEMPLATES,
} from '@/config/dictionaries/imaging_terms';

// ─── Hydration helper: extract structured data from exam ───
function hydrateFromExam(exam, practice) {
  // 1st priority: structured data inside organs_data measurements
  const structured = exam?.organs_data?.[0]?.measurements?._structured;
  if (structured && typeof structured === 'object' && structured.type === 'radiology') {
    return structured;
  }
  // 2nd: try content field (string JSON)
  if (exam?.content) {
    const c = exam.content;
    if (typeof c === 'object' && c.region) return c;
    if (typeof c === 'string') {
      try {
        const parsed = JSON.parse(c);
        if (parsed.region) return parsed;
      } catch { /* ignore */ }
    }
  }
  // 3rd: legacy plain text – put report_content into findings
  if (exam?.report_content || exam?.organs_data?.[0]?.report_text) {
    return {
      findings: exam.report_content || exam.organs_data?.[0]?.report_text || '',
      conclusion: exam.conclusion || '',
    };
  }
  return null;
}

export function RadiologyEditor({ exam, onSave, isSaving, onCancel }) {
  const { practice } = useLicense();

  const regions = RADIOLOGY_REGIONS[practice] || RADIOLOGY_REGIONS.vet;
  const projections = RADIOLOGY_PROJECTIONS[practice] || RADIOLOGY_PROJECTIONS.vet;
  const normalTemplates = RADIOLOGY_NORMAL_TEMPLATES[practice] || RADIOLOGY_NORMAL_TEMPLATES.vet;

  const saved = hydrateFromExam(exam, practice);

  // ─── State ───
  const [region, setRegion] = useState(saved?.region || regions[0]?.value || 'torax');
  const [selectedProjections, setSelectedProjections] = useState(saved?.projections || []);
  const [findings, setFindings] = useState(saved?.findings || '');
  const [conclusion, setConclusion] = useState(saved?.conclusion || '');

  // VHS
  const [vhsData, setVhsData] = useState(
    saved?.vhs || { longAxis: '', shortAxis: '', totalVhs: 0 }
  );

  useEffect(() => {
    const l = parseFloat(vhsData.longAxis) || 0;
    const s = parseFloat(vhsData.shortAxis) || 0;
    setVhsData((prev) => ({ ...prev, totalVhs: (l + s).toFixed(1) }));
  }, [vhsData.longAxis, vhsData.shortAxis]);

  const toggleProjection = (val) => {
    setSelectedProjections((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const loadNormalTemplate = () => {
    const tpl = normalTemplates[region];
    if (tpl) {
      setFindings(tpl.findings);
      setConclusion(tpl.conclusion);
    }
  };

  // ─── Build full report text for copy / DOCX ───
  const buildFullReportText = useCallback(() => {
    const regionName = regions.find((r) => r.value === region)?.label || region;
    const projLabels = selectedProjections
      .map((pv) => projections.find((p) => p.value === pv)?.label || pv)
      .join(', ');

    let text = `RELATÓRIO RADIOGRÁFICO\n`;
    text += `Região: ${regionName}\n`;
    if (projLabels) text += `Projeções: ${projLabels}\n`;
    text += `\n─── ACHADOS ───\n${findings || '(sem achados)'}\n`;
    text += `\n─── CONCLUSÃO ───\n${conclusion || '(sem conclusão)'}`;

    if (practice === 'vet' && region === 'torax' && vhsData.totalVhs > 0) {
      text += `\n\nVHS: ${vhsData.totalVhs}v`;
    }
    return text;
  }, [region, selectedProjections, findings, conclusion, vhsData, practice, regions, projections]);

  // ─── Copy to clipboard ───
  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildFullReportText());
      toast.success('Laudo copiado para a área de transferência!');
    } catch {
      toast.error('Erro ao copiar. Verifique as permissões do navegador.');
    }
  };

  // ─── Save ───
  const handleSave = () => {
    const structuredContent = {
      type: 'radiology',
      practice,
      region,
      projections: selectedProjections,
      findings,
      conclusion,
      vhs: practice === 'vet' && region === 'torax' ? vhsData : null,
    };

    const regionName = regions.find((r) => r.value === region)?.label || region;

    const radioData = [
      {
        organ_name: `Raio-X (${regionName.toUpperCase()})`,
        report_text: findings,
        measurements: {
          _structured: structuredContent,
          ...(practice === 'vet' && region === 'torax' ? { vhs: vhsData.totalVhs, ...vhsData } : {}),
        },
        visual_data: null,
      },
    ];

    onSave({
      organs_data: radioData,
      report_content: findings,
      conclusion,
    });
  };

  const regionLabel = regions.find((r) => r.value === region)?.label || region;
  const showVHS = practice === 'vet' && region === 'torax';

  return (
    <div
      className="h-full flex flex-col bg-background p-4 md:p-6 overflow-y-auto"
      data-testid="radiology-editor"
    >
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Bone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground" data-testid="radiology-title">
              Radiologia Digital
            </h2>
            <p className="text-xs text-muted-foreground">
              Laudo Estruturado &bull;{' '}
              <Badge variant="outline" className="text-[10px] ml-1" data-testid="radiology-practice-badge">
                {practice === 'human' ? 'Humana' : 'Veterinária'}
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNormalTemplate}
            className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30"
            data-testid="load-normal-template-btn"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Laudo Normal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            data-testid="radiology-copy-btn"
          >
            <Copy className="h-4 w-4 mr-1.5" />
            Copiar Laudo
          </Button>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} data-testid="radiology-cancel-btn">
              <X className="h-4 w-4 mr-1.5" /> Cancelar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="radiology-print-btn">
            <Printer className="h-4 w-4 mr-1.5" /> Imprimir
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} data-testid="radiology-save-btn">
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* ─── LEFT: Exam Header ─── */}
        <div className="space-y-4">
          <Card data-testid="radiology-region-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Região Anatômica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger data-testid="radiology-region-trigger">
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.value} value={r.value} data-testid={`region-option-${r.value}`}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card data-testid="radiology-projections-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Projeções Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {projections.map((p) => {
                  const isActive = selectedProjections.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleProjection(p.value)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-all font-medium ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                      }`}
                      data-testid={`projection-toggle-${p.value}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {selectedProjections.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2" data-testid="projections-summary">
                  Selecionadas: {selectedProjections.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          {showVHS && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20" data-testid="vhs-calculator-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Cálculo VHS (Cães/Gatos)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Eixo Longo (v)</Label>
                    <Input
                      type="number"
                      value={vhsData.longAxis}
                      onChange={(e) => setVhsData({ ...vhsData, longAxis: e.target.value })}
                      placeholder="Ex: 5.2"
                      data-testid="vhs-long-axis-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Eixo Curto (v)</Label>
                    <Input
                      type="number"
                      value={vhsData.shortAxis}
                      onChange={(e) => setVhsData({ ...vhsData, shortAxis: e.target.value })}
                      placeholder="Ex: 4.5"
                      data-testid="vhs-short-axis-input"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total VHS:</span>
                  <span
                    className={`text-2xl font-bold ${
                      vhsData.totalVhs > 10.5 ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'
                    }`}
                    data-testid="vhs-total-value"
                  >
                    {vhsData.totalVhs > 0 ? vhsData.totalVhs : '--'}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  *Ref Cães: 8.7 - 10.7v | Gatos: &lt; 8.0v
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── CENTER + RIGHT: Report Body ─── */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="flex-1 flex flex-col min-h-[200px]" data-testid="radiology-findings-card">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                Achados Radiográficos
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]" data-testid="findings-region-badge">
                {regionLabel}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                className="flex-1 resize-none text-sm leading-relaxed min-h-[180px]"
                placeholder="Descreva os achados radiográficos..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                data-testid="radiology-findings-textarea"
              />
            </CardContent>
          </Card>

          <Card data-testid="radiology-conclusion-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Impressão Diagnóstica / Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="resize-none text-sm leading-relaxed min-h-[100px]"
                placeholder="Conclusão diagnóstica..."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                data-testid="radiology-conclusion-textarea"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
