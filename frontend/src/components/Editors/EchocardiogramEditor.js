import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, Heart, Save, Calculator, FileText 
} from 'lucide-react';
import { calculateEcho, generateAutoReport } from '@/lib/cardio_formulas';

export function EchocardiogramEditor({ exam, onSave, isSaving }) {
    // Estado unificado para medidas
    const [measurements, setMeasurements] = useState(exam?.organs_data?.[0]?.measurements || {
        sivd: '', dived: '', ppve: '', // Diástole
        sivs: '', dives: '', ppves: '', // Sístole
        ae: '', ao: '', // Átrio/Aorta
        hr: '', // Frequência Cardíaca
        weight: exam?.exam_weight || '' // Peso para indexação (futuro)
    });

    // Estado para resultados calculados
    const [calculated, setCalculated] = useState({});
    
    // Estado para o texto do laudo
    const [reportText, setReportText] = useState(exam?.organs_data?.[0]?.report_text || '');

    // Efeito: Recalcular sempre que as medidas mudarem
    useEffect(() => {
        const results = calculateEcho(measurements);
        setCalculated(results);
    }, [measurements]);

    // Função para atualizar medidas
    const updateMeasure = (key, value) => {
        setMeasurements(prev => ({ ...prev, [key]: value }));
    };

    // Função para salvar
    const handleSave = () => {
        // Estrutura o dado como se fosse um "órgão" chamado Coração para manter compatibilidade com o schema
        const cardioData = [{
            organ_name: 'Coração',
            report_text: reportText,
            measurements: { ...measurements, ...calculated }, // Salva brutos e calculados
            visual_data: null
        }];

        onSave({ organs_data: cardioData });
    };

    // Função para gerar texto automático
    const handleGenerateText = () => {
        const autoText = generateAutoReport(measurements, calculated);
        setReportText(prev => prev ? prev + '\n' + autoText : autoText);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 p-4 overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Ecocardiograma</h2>
                        <p className="text-xs text-muted-foreground">Modo M, Bidimensional e Doppler</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGenerateText} title="Gerar texto baseado nos números">
                        <FileText className="h-4 w-4 mr-2" /> Gerar Laudo
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar Exame</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA 1: MEDIDAS (Inputs) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Ventrículo Esquerdo (Modo M)</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">SIVd (cm)</Label>
                                    <Input type="number" step="0.01" value={measurements.sivd} onChange={e => updateMeasure('sivd', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">SIVs (cm)</Label>
                                    <Input type="number" step="0.01" value={measurements.sivs} onChange={e => updateMeasure('sivs', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-blue-600">DIVE (cm) Diástole</Label>
                                    <Input type="number" step="0.01" value={measurements.dived} onChange={e => updateMeasure('dived', e.target.value)} placeholder="0.00" className="border-blue-200 bg-blue-50" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-blue-600">DIVEs (cm) Sístole</Label>
                                    <Input type="number" step="0.01" value={measurements.dives} onChange={e => updateMeasure('dives', e.target.value)} placeholder="0.00" className="border-blue-200 bg-blue-50" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">PPVE (cm)</Label>
                                    <Input type="number" step="0.01" value={measurements.ppve} onChange={e => updateMeasure('ppve', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">PPVEs (cm)</Label>
                                    <Input type="number" step="0.01" value={measurements.ppves} onChange={e => updateMeasure('ppves', e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Relação Átrio / Aorta</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Aorta (Ao)</Label>
                                    <Input type="number" step="0.01" value={measurements.ao} onChange={e => updateMeasure('ao', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Átrio Esq. (AE)</Label>
                                    <Input type="number" step="0.01" value={measurements.ae} onChange={e => updateMeasure('ae', e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUNA 2: CÁLCULOS (Read-only) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-slate-900 text-white border-slate-800">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase text-slate-400">Hemodinâmica</CardTitle>
                            <Calculator className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                <span className="text-sm text-slate-400">Fração de Encurtamento (FS%)</span>
                                <span className={`text-2xl font-mono font-bold ${parseFloat(calculated.fs) < 28 ? 'text-red-400' : 'text-green-400'}`}>
                                    {calculated.fs || '--'} <span className="text-sm text-slate-500">%</span>
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                <span className="text-sm text-slate-400">Fração de Ejeção (FE%)</span>
                                <span className={`text-2xl font-mono font-bold ${parseFloat(calculated.fe) < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                    {calculated.fe || '--'} <span className="text-sm text-slate-500">%</span>
                                </span>
                            </div>

                            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                <span className="text-sm text-slate-400">Relação AE/Ao</span>
                                <span className={`text-2xl font-mono font-bold ${parseFloat(calculated.ae_ao_ratio) > 1.6 ? 'text-red-400' : 'text-green-400'}`}>
                                    {calculated.ae_ao_ratio || '--'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <span className="block text-xs text-slate-500">Vol. Diastólico (EDV)</span>
                                    <span className="font-mono text-lg">{calculated.edv || '--'} ml</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Vol. Sistólico (ESV)</span>
                                    <span className="font-mono text-lg">{calculated.esv || '--'} ml</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Doppler & Outros</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Freq. Cardíaca (bpm)</Label>
                                <Input type="number" value={measurements.hr} onChange={e => updateMeasure('hr', e.target.value)} />
                            </div>
                            {/* Espaço para adicionar campos de doppler futuramente */}
                            <div className="p-3 bg-muted rounded text-xs text-center text-muted-foreground">
                                Módulos de Doppler Espectral (E/A, Vmax) em desenvolvimento.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUNA 3: LAUDO (Texto) */}
                <div className="lg:col-span-1 h-full flex flex-col">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Conclusão / Laudo</CardTitle></CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea 
                                className="flex-1 resize-none font-medium leading-relaxed" 
                                placeholder="Descreva os achados qualitativos ou use o botão 'Gerar Laudo'..."
                                value={reportText}
                                onChange={e => setReportText(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}