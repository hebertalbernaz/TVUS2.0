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
  RotateCcw,
} from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';
import {
  RADIOLOGY_REGIONS,
  RADIOLOGY_PROJECTIONS,
  RADIOLOGY_NORMAL_TEMPLATES,
} from '@/config/dictionaries/imaging_terms';

export function RadiologyEditor({ exam, onSave, isSaving, onCancel }) {
  const { practice } = useLicense();

  // Regions & projections for current practice
  const regions = RADIOLOGY_REGIONS[practice] || RADIOLOGY_REGIONS.vet;
  const projections = RADIOLOGY_PROJECTIONS[practice] || RADIOLOGY_PROJECTIONS.vet;
  const normalTemplates = RADIOLOGY_NORMAL_TEMPLATES[practice] || RADIOLOGY_NORMAL_TEMPLATES.vet;

  // ─── Parse saved structured content ───
  const parseSaved = useCallback(() => {
    const c = exam?.content;
    if (c && typeof c === 'object' && c.region) return c;
    if (c && typeof c === 'string') {
      try { return JSON.parse(c); } catch { /* ignore */ }
    }
    return null;
  }, [exam]);

  const saved = parseSaved();

  // ─── State ───
  const [region, setRegion] = useState(saved?.region || regions[0]?.value || 'torax');
  const [selectedProjections, setSelectedProjections] = useState(saved?.projections || []);
  const [findings, setFindings] = useState(saved?.findings || exam?.report_content || '');
  const [conclusion, setConclusion] = useState(saved?.conclusion || exam?.conclusion || '');

  // VHS (Vertebral Heart Scale) – only relevant for VET thorax
  const [vhsData, setVhsData] = useState(
    saved?.vhs || { longAxis: '', shortAxis: '', totalVhs: 0 }
  );

  // Recalculate VHS
  useEffect(() => {
    const l = parseFloat(vhsData.longAxis) || 0;
    const s = parseFloat(vhsData.shortAxis) || 0;
    setVhsData((prev) => ({ ...prev, totalVhs: (l + s).toFixed(1) }));
  }, [vhsData.longAxis, vhsData.shortAxis]);

  // ─── Toggle projection ───
  const toggleProjection = (val) => {
    setSelectedProjections((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  // ─── Load Normal Template ───
  const loadNormalTemplate = () => {
    const tpl = normalTemplates[region];
    if (tpl) {
      setFindings(tpl.findings);
      setConclusion(tpl.conclusion);
    }
  };

  // ─── Handle Save – structured JSON ───
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

    // Build organs_data for compatibility with ExamPage
    const radioData = [
      {
        organ_name: `Raio-X (${(regions.find((r) => r.value === region)?.label || region).toUpperCase()})`,
        report_text: findings,
        measurements: practice === 'vet' && region === 'torax' ? { vhs: vhsData.totalVhs, ...vhsData } : {},
        visual_data: null,
      },
    ];

    onSave({
      organs_data: radioData,
      report_content: findings,
      conclusion,
      content: structuredContent,
    });
  };

  // Region label helper
  const regionLabel = regions.find((r) => r.value === region)?.label || region;

  // Show VHS for vet + thorax
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
            <h2
              className="text-xl font-bold text-foreground"
              data-testid="radiology-title"
            >
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
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              data-testid="radiology-cancel-btn"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancelar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-testid="radiology-print-btn"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Imprimir
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            data-testid="radiology-save-btn"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* ─── COLUNA ESQUERDA: Cabeçalho do Exame ─── */}
        <div className="space-y-4">
          {/* Região */}
          <Card data-testid="radiology-region-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Região Anatômica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={region}
                onValueChange={setRegion}
                data-testid="radiology-region-select"
              >
                <SelectTrigger data-testid="radiology-region-trigger">
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem
                      key={r.value}
                      value={r.value}
                      data-testid={`region-option-${r.value}`}
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Projeções */}
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
                <p
                  className="text-[10px] text-muted-foreground mt-2"
                  data-testid="projections-summary"
                >
                  Selecionadas: {selectedProjections.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* VHS Calculator – Vet Thorax only */}
          {showVHS && (
            <Card
              className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20"
              data-testid="vhs-calculator-card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Cálculo VHS (Cães/Gatos)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Eixo Longo (v)
                    </Label>
                    <Input
                      type="number"
                      value={vhsData.longAxis}
                      onChange={(e) =>
                        setVhsData({ ...vhsData, longAxis: e.target.value })
                      }
                      placeholder="Ex: 5.2"
                      data-testid="vhs-long-axis-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Eixo Curto (v)
                    </Label>
                    <Input
                      type="number"
                      value={vhsData.shortAxis}
                      onChange={(e) =>
                        setVhsData({ ...vhsData, shortAxis: e.target.value })
                      }
                      placeholder="Ex: 4.5"
                      data-testid="vhs-short-axis-input"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total VHS:
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      vhsData.totalVhs > 10.5
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-700 dark:text-blue-400'
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

        {/* ─── COLUNAS CENTRAL E DIREITA: Corpo do Laudo ─── */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {/* Achados */}
          <Card
            className="flex-1 flex flex-col min-h-[200px]"
            data-testid="radiology-findings-card"
          >
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                Achados Radiográficos
              </CardTitle>
              <Badge
                variant="secondary"
                className="text-[10px]"
                data-testid="findings-region-badge"
              >
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

          {/* Conclusão */}
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
