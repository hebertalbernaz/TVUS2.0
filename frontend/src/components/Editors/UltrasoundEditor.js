import React, { useEffect, useRef, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bold, Italic, CheckCircle2, AlertTriangle, Replace, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { HighlightTextarea } from '@/components/Editors/HighlightTextarea';
import { getOrganMeasurements } from '@/config/ultrasound_templates';
import { applyTemplateText, evaluateMeasurement, findReference, formatRange } from '@/lib/ultrasound';

const ALERT_STYLES = {
  high: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  low: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  normal: 'border-green-500/60'
};

function MeasurementField({ def, measurement, reference, onChange }) {
  const status = evaluateMeasurement(measurement?.value, reference);
  const Icon = status === 'high' ? ArrowUp : status === 'low' ? ArrowDown : null;
  return (
    <div className="flex flex-col gap-0.5 min-w-[92px]" data-testid={`measurement-field-${def.key}`}>
      <span className="text-[10px] font-semibold text-muted-foreground truncate" title={def.label}>{def.generic ? def.label : `${def.key.toUpperCase()} · ${def.label}`}</span>
      <div className="flex items-center gap-1">
        <input
          data-testid={`organ-measurement-${def.key}`}
          data-status={status || 'none'}
          inputMode="decimal"
          className={cn('w-16 h-7 text-xs border rounded text-center bg-background', status && ALERT_STYLES[status])}
          placeholder="0.0"
          value={measurement?.value || ''}
          onChange={(e) => onChange(def.key, e.target.value)}
        />
        <span className="text-[10px] text-muted-foreground">cm</span>
        {Icon && <Icon className={cn('h-3.5 w-3.5', status === 'high' ? 'text-red-600' : 'text-amber-600')} />}
      </div>
      {reference && (
        <span data-testid={`measurement-ref-${def.key}`} className={cn('text-[10px]', status === 'high' || status === 'low' ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
          Ref: {formatRange(reference)}{status === 'high' ? ' · acima' : status === 'low' ? ' · abaixo' : ''}
        </span>
      )}
    </div>
  );
}

function TemplateList({ items, onInsert, onReplace }) {
  if (!items.length) return <p className="p-3 text-xs text-muted-foreground">Nenhum texto cadastrado. Crie em Configurações › Textos Padrão.</p>;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 p-2">
      {items.map((t) => (
        <div key={t.id} className="group relative rounded border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors">
          <button type="button" data-testid={`template-insert-${t.id}`} onClick={() => onInsert(t)} className="w-full text-left p-2 pr-9" title="Clique para inserir no cursor">
            <div className="font-bold text-xs text-foreground">{t.title}</div>
            <div className="text-[10px] text-muted-foreground line-clamp-2">{t.text}</div>
          </button>
          <button type="button" data-testid={`template-replace-${t.id}`} onClick={() => onReplace(t)} title="Substituir todo o texto" className="absolute top-1.5 right-1.5 h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary">
            <Replace className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Editor de um órgão do roteiro: texto, medidas com alerta de referência e textos guia (Normal / Alterações).
export function UltrasoundOrganEditor({ organ, templates, onChange, patient, referenceValues, searchTerm, activeMatchIndex, selectNonce }) {
  const [text, setText] = useState(organ.report_text || '');
  const [measurements, setMeasurements] = useState(organ.measurements || {});
  const normals = templates.filter((t) => (t.category || 'normal') === 'normal');
  const changes = templates.filter((t) => t.category === 'alteracao');
  const [tab, setTab] = useState('normal');
  const textAreaRef = useRef(null);
  const pendingCursor = useRef(null);

  useEffect(() => { setText(organ.report_text || ''); setMeasurements(organ.measurements || {}); }, [organ.organ_name]);

  useEffect(() => {
    const ta = textAreaRef.current;
    if (pendingCursor.current === null || !ta) return;
    const pos = pendingCursor.current;
    pendingCursor.current = null;
    const scroll = ta.scrollTop;
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(pos, pos);
    ta.scrollTop = scroll;
  }, [text]);

  const updateText = (val) => { setText(val); onChange('report_text', val); };

  const applyGuide = (t, mode) => {
    const ta = textAreaRef.current;
    const previous = text;
    const res = applyTemplateText(text, t.text, { mode, cursor: ta ? ta.selectionEnd : undefined });
    pendingCursor.current = res.cursor;
    updateText(res.text);
    if (mode === 'replace' && previous.trim() && previous !== res.text) {
      toast('Texto substituído', { description: t.title, action: { label: 'Desfazer', onClick: () => updateText(previous) } });
    }
  };

  const setMeasurement = (key, val) => {
    const m = { ...measurements };
    if (val) m[key] = { value: val, unit: 'cm' }; else delete m[key];
    setMeasurements(m);
    onChange('measurements', m);
  };

  const formatText = (kind) => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const s = ta.selectionStart; const e = ta.selectionEnd;
    if (s === e) return;
    const mk = kind === 'bold' ? '**' : '*';
    pendingCursor.current = e + mk.length * 2;
    updateText(text.substring(0, s) + mk + text.substring(s, e) + mk + text.substring(e));
  };

  const defs = getOrganMeasurements(organ.organ_name);
  const items = tab === 'normal' ? normals : changes;

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={64} minSize={35}>
        <div className="flex flex-col h-full p-4 gap-3">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary" data-testid="organ-editor-title">{organ.organ_name}</h2>
              {normals[0] && (
                <Button data-testid="organ-apply-normal" size="sm" variant="outline" className="h-7 text-xs border-green-600/40 text-green-700 hover:bg-green-50 dark:text-green-400" onClick={() => applyGuide(normals[0], 'replace')}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Normal
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-3 bg-muted/30 px-2 py-1.5 rounded border" data-testid="organ-measurements">
              {defs.map((d) => (
                <MeasurementField key={d.key} def={d} measurement={measurements[d.key]} reference={d.generic ? null : findReference(referenceValues, patient, organ.organ_name, d.label)} onChange={setMeasurement} />
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col border rounded-md relative min-h-0">
            <div className="flex gap-1 p-1 border-b bg-muted/10 items-center">
              <Button data-testid="format-bold" variant="ghost" size="icon" className="h-6 w-6" onMouseDown={(e) => e.preventDefault()} onClick={() => formatText('bold')}><Bold className="h-3.5 w-3.5" /></Button>
              <Button data-testid="format-italic" variant="ghost" size="icon" className="h-6 w-6" onMouseDown={(e) => e.preventDefault()} onClick={() => formatText('italic')}><Italic className="h-3.5 w-3.5" /></Button>
              <span className="ml-auto pr-2 text-[10px] text-muted-foreground">Use {'{M1}'}, {'{M2}'}, {'{M3}'} para inserir as medidas</span>
            </div>
            <HighlightTextarea data-testid="organ-report-textarea" ref={textAreaRef} className="border-none shadow-none resize-none p-3" value={text} onChange={(e) => updateText(e.target.value)} placeholder="Laudo..." searchTerm={searchTerm} activeIndex={activeMatchIndex} selectNonce={selectNonce} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={36} minSize={15} className="bg-muted/5">
        <div className="flex flex-col h-full">
          <div className="p-1.5 border-b flex items-center gap-1" role="tablist">
            <button type="button" role="tab" data-testid="templates-tab-normal" aria-selected={tab === 'normal'} onClick={() => setTab('normal')} className={cn('px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors', tab === 'normal' ? 'bg-green-600 text-white' : 'text-muted-foreground hover:bg-muted')}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Aspecto Normal ({normals.length})
            </button>
            <button type="button" role="tab" data-testid="templates-tab-changes" aria-selected={tab === 'alteracao'} onClick={() => setTab('alteracao')} className={cn('px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors', tab === 'alteracao' ? 'bg-amber-600 text-white' : 'text-muted-foreground hover:bg-muted')}>
              <AlertTriangle className="h-3.5 w-3.5" /> Alterações Comuns ({changes.length})
            </button>
          </div>
          <ScrollArea className="flex-1"><TemplateList items={items} onInsert={(t) => applyGuide(t, 'insert')} onReplace={(t) => applyGuide(t, 'replace')} /></ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
