import React, { useState, useCallback } from 'react';
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
  Layers,
  Save,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Info,
} from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';
import {
  CT_REGIONS,
  CT_CONTRAST_OPTIONS,
  CT_NORMAL_TEMPLATES,
  HU_SCALE,
  classifyHU,
} from '@/config/dictionaries/imaging_terms';

export function CTScanEditor({ exam, onSave, isSaving, onCancel }) {
  const { practice } = useLicense();

  // Options for current practice
  const regions = CT_REGIONS[practice] || CT_REGIONS.vet;
  const normalTemplates = CT_NORMAL_TEMPLATES[practice] || CT_NORMAL_TEMPLATES.vet;

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

  // ─── State: Protocol ───
  const [region, setRegion] = useState(saved?.region || regions[0]?.value || 'cranio');
  const [contrast, setContrast] = useState(saved?.contrast || 'sem_contraste');
  const [sliceThickness, setSliceThickness] = useState(saved?.sliceThickness || '2.0');

  // ─── State: Report ───
  const [findings, setFindings] = useState(saved?.findings || exam?.report_content || '');
  const [conclusion, setConclusion] = useState(saved?.conclusion || exam?.conclusion || '');

  // ─── State: HU Calculator ───
  const [huInput, setHuInput] = useState('');

  // ─── Generate technique header text ───
  const getTechniqueText = () => {
    const regionName = regions.find((r) => r.value === region)?.label || region;
    let text = `Exame realizado através de cortes tomográficos axiais da região de ${regionName}, com reconstruções multiplanares (MPR). Espessura de corte: ${sliceThickness}mm.`;

    const contrastOpt = CT_CONTRAST_OPTIONS.find((o) => o.value === contrast);
    if (contrast === 'sem_contraste') {
      text += ' Estudo realizado sem administração de meio de contraste endovenoso.';
    } else {
      text += ` Foi administrado meio de contraste iodado endovenoso, com aquisição na ${contrastOpt?.label || contrast}.`;
    }
    return text;
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
      type: 'ct_scan',
      practice,
      region,
      contrast,
      sliceThickness,
      technique: getTechniqueText(),
      findings,
      conclusion,
    };

    const regionLabel = regions.find((r) => r.value === region)?.label || region;

    onSave({
      organs_data: [],
      report_content: findings,
      conclusion,
      content: structuredContent,
      measurements: {
        protocol: { region, contrast, sliceThickness },
      },
    });
  };

  const regionLabel = regions.find((r) => r.value === region)?.label || region;

  return (
    <div
      className="h-full flex flex-col bg-background p-4 md:p-6 overflow-y-auto"
      data-testid="ct-scan-editor"
    >
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-foreground"
              data-testid="ct-scan-title"
            >
              Tomografia Computadorizada
            </h2>
            <p className="text-xs text-muted-foreground">
              Laudo Estruturado &bull;{' '}
              <Badge variant="outline" className="text-[10px] ml-1" data-testid="ct-practice-badge">
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
            data-testid="ct-load-normal-btn"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Laudo Normal
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              data-testid="ct-cancel-btn"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancelar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-testid="ct-print-btn"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Imprimir
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            data-testid="ct-save-btn"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar Laudo'}
          </Button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* ─── COLUNA ESQUERDA: Protocolo ─── */}
        <div className="space-y-4">
          {/* Protocolo de Aquisição */}
          <Card data-testid="ct-protocol-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Protocolo de Aquisição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Região Estudada
                </Label>
                <Select
                  value={region}
                  onValueChange={setRegion}
                >
                  <SelectTrigger data-testid="ct-region-trigger">
                    <SelectValue placeholder="Selecione a região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem
                        key={r.value}
                        value={r.value}
                        data-testid={`ct-region-option-${r.value}`}
                      >
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Contraste
                </Label>
                <Select
                  value={contrast}
                  onValueChange={setContrast}
                >
                  <SelectTrigger data-testid="ct-contrast-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CT_CONTRAST_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        data-testid={`ct-contrast-option-${opt.value}`}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Espessura de Corte (mm)
                </Label>
                <Input
                  type="number"
                  value={sliceThickness}
                  onChange={(e) => setSliceThickness(e.target.value)}
                  placeholder="2.0"
                  data-testid="ct-slice-thickness-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Referência Hounsfield */}
          <Card
            className="bg-card border-border"
            data-testid="hu-calculator-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Densidade (HU)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Valor HU"
                  className="w-24"
                  value={huInput}
                  onChange={(e) => setHuInput(e.target.value)}
                  type="number"
                  data-testid="hu-input"
                />
                <span
                  className="text-sm font-bold text-amber-600 dark:text-amber-400"
                  data-testid="hu-classification"
                >
                  {classifyHU(huInput)}
                </span>
              </div>
              <Separator />
              <div className="text-[10px] space-y-1 text-muted-foreground">
                {HU_SCALE.map((h) => (
                  <div
                    key={h.label}
                    className="flex justify-between items-center border-b border-border/50 pb-0.5"
                  >
                    <span>{h.label}</span>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${h.color}`}
                      style={{ backgroundColor: 'currentColor' }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── COLUNAS CENTRAL E DIREITA: Corpo do Laudo ─── */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {/* Técnica (auto-gerada) */}
          <div
            className="text-xs p-3 bg-muted/30 border border-border rounded-lg text-muted-foreground italic"
            data-testid="ct-technique-preview"
          >
            <span className="font-bold not-italic text-foreground">
              Técnica:{' '}
            </span>
            {getTechniqueText()}
          </div>

          {/* Achados */}
          <Card
            className="flex-1 flex flex-col min-h-[200px]"
            data-testid="ct-findings-card"
          >
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                Achados Tomográficos
              </CardTitle>
              <Badge
                variant="secondary"
                className="text-[10px]"
                data-testid="ct-findings-region-badge"
              >
                {regionLabel}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                className="flex-1 resize-none text-sm leading-relaxed min-h-[180px]"
                placeholder="Descreva os achados, realce por contraste, dimensões e densidades (HU)..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                data-testid="ct-findings-textarea"
              />
            </CardContent>
          </Card>

          {/* Conclusão */}
          <Card data-testid="ct-conclusion-card">
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
                data-testid="ct-conclusion-textarea"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
