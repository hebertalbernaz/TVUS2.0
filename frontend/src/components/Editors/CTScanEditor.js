import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Layers, Save, FileText, CheckCircle2, Box, Info 
} from 'lucide-react';

// Escala Hounsfield (Referência Rápida)
const HU_SCALE = [
    { label: 'Ar (-1000)', min: -1000, max: -900, color: 'text-blue-300' },
    { label: 'Pulmão (-500)', min: -600, max: -400, color: 'text-blue-400' },
    { label: 'Gordura (-100)', min: -120, max: -50, color: 'text-yellow-500' },
    { label: 'Água (0)', min: -10, max: 10, color: 'text-cyan-500' },
    { label: 'Tecidos Moles (40)', min: 20, max: 80, color: 'text-red-400' },
    { label: 'Sangue (60-90)', min: 50, max: 90, color: 'text-red-700' },
    { label: 'Osso (> 700)', min: 700, max: 3000, color: 'text-slate-500' },
];

export function CTScanEditor({ exam, onSave, isSaving }) {
    // Estado do Laudo
    const [protocol, setProtocol] = useState({
        region: 'abdomen_total',
        contrast: false,
        phases: {
            pre_contrast: true,
            arterial: false,
            venous: false, // Portal
            delayed: false // Excretora
        },
        slice_thickness: '2.0'
    });

    const [reportText, setReportText] = useState(exam?.report_content || '');
    const [conclusion, setConclusion] = useState(exam?.conclusion || '');
    const [huInput, setHuInput] = useState(''); // Calculadora rápida de HU

    // Texto Padrão de Técnica (Gera automaticamente baseado nos checkboxes)
    const getTechniqueText = () => {
        let text = `Exame realizado através de cortes tomográficos axiais da região ${protocol.region.replace('_', ' ')}, com reconstruções multiulanares (MPR). Espessura de corte: ${protocol.slice_thickness}mm.`;
        
        if (protocol.contrast) {
            const phases = [];
            if (protocol.phases.pre_contrast) phases.push("pré-contraste");
            if (protocol.phases.arterial) phases.push("arterial");
            if (protocol.phases.venous) phases.push("venosa/portal");
            if (protocol.phases.delayed) phases.push("tardia/excretora");
            
            text += ` Foi administrado meio de contraste iodado endovenoso, com aquisição nas fases: ${phases.join(', ')}.`;
        } else {
            text += " Estudo realizado sem administração de meio de contraste endovenoso.";
        }
        return text;
    };

    // Salvar
    const handleSave = () => {
        const fullHeader = getTechniqueText();
        
        // O corpo do laudo pode ser a técnica + o texto descritivo
        // Ou salvamos a técnica separada. Vamos concatenar para o DOCX final ficar completo.
        const finalReport = `TÉCNICA:\n${fullHeader}\n\nANÁLISE:\n${reportText}`;

        onSave({ 
            organs_data: [], // CT é sistêmico, não por órgão isolado na estrutura antiga
            report_content: finalReport,
            conclusion: conclusion,
            // Salvamos metadados do protocolo para reuso futuro
            measurements: { protocol } 
        });
    };

    // Helper para classificar HU
    const classifyHU = (val) => {
        const v = parseFloat(val);
        if (isNaN(v)) return '';
        const match = HU_SCALE.find(s => v >= s.min && v <= s.max);
        return match ? match.label.split(' (')[0] : 'Inespecífico';
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tomografia Computadorizada</h2>
                        <p className="text-xs text-muted-foreground">Laudo Multislice & MPR</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                        {isSaving ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar Laudo</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* COLUNA 1: PROTOCOLO TÉCNICO */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Protocolo de Aquisição</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Região Estudada</Label>
                                <Select 
                                    value={protocol.region} 
                                    onValueChange={(v) => setProtocol({...protocol, region: v})}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cranio">Crânio / Encéfalo</SelectItem>
                                        <SelectItem value="coluna_cervical">Coluna Cervical</SelectItem>
                                        <SelectItem value="coluna_toracolombar">Coluna Toracolombar</SelectItem>
                                        <SelectItem value="torax">Tórax</SelectItem>
                                        <SelectItem value="abdomen_total">Abdome Total</SelectItem>
                                        <SelectItem value="articular">Articular / Membros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Espessura de Corte (mm)</Label>
                                <Input 
                                    type="number" 
                                    value={protocol.slice_thickness} 
                                    onChange={e => setProtocol({...protocol, slice_thickness: e.target.value})} 
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="contrast" 
                                    checked={protocol.contrast} 
                                    onCheckedChange={(c) => setProtocol({...protocol, contrast: c})}
                                />
                                <Label htmlFor="contrast" className="font-bold text-purple-700">Utilizou Contraste?</Label>
                            </div>

                            {protocol.contrast && (
                                <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-purple-200">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="ph_art" 
                                            checked={protocol.phases.arterial}
                                            onCheckedChange={c => setProtocol(p => ({...p, phases: {...p.phases, arterial: c}}))}
                                        />
                                        <Label htmlFor="ph_art" className="text-xs">Arterial</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="ph_ven" 
                                            checked={protocol.phases.venous}
                                            onCheckedChange={c => setProtocol(p => ({...p, phases: {...p.phases, venous: c}}))}
                                        />
                                        <Label htmlFor="ph_ven" className="text-xs">Portal</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="ph_del" 
                                            checked={protocol.phases.delayed}
                                            onCheckedChange={c => setProtocol(p => ({...p, phases: {...p.phases, delayed: c}}))}
                                        />
                                        <Label htmlFor="ph_del" className="text-xs">Tardia</Label>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Auxiliar de Densidade (HU) */}
                    <Card className="bg-slate-900 text-white border-slate-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-slate-400">Análise de Densidade (HU)</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Valor HU" 
                                    className="bg-slate-800 border-slate-700 text-white w-24"
                                    value={huInput}
                                    onChange={e => setHuInput(e.target.value)}
                                    type="number"
                                />
                                <div className="flex items-center text-sm font-bold text-yellow-400">
                                    {classifyHU(huInput)}
                                </div>
                            </div>
                            <div className="text-[10px] space-y-1 text-slate-400">
                                {HU_SCALE.map(h => (
                                    <div key={h.label} className="flex justify-between border-b border-slate-800 pb-0.5">
                                        <span>{h.label}</span>
                                        <div className={`w-3 h-3 rounded-full bg-current ${h.color}`}></div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUNA 2 & 3: EDITOR DE TEXTO */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                    
                    {/* Preview da Técnica */}
                    <div className="text-xs p-3 bg-white border rounded text-muted-foreground italic">
                        <span className="font-bold not-italic text-black">Cabeçalho Automático: </span>
                        {getTechniqueText()}
                    </div>

                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-2 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Achados Tomográficos</CardTitle>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-green-600" onClick={() => setReportText(prev => prev + "\nCoeficientes de atenuação preservados.")}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Frase Normal
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea 
                                className="flex-1 resize-none text-base leading-relaxed font-mono" 
                                placeholder="Descreva os achados, realce por contraste, dimensões e densidades (HU)..."
                                value={reportText}
                                onChange={e => setReportText(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="h-1/4 flex flex-col">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Impressão Diagnóstica</CardTitle></CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea 
                                className="flex-1 resize-none" 
                                placeholder="Conclusão..."
                                value={conclusion}
                                onChange={e => setConclusion(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}