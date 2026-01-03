import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bone, Save, FileText, CheckCircle2, AlertTriangle 
} from 'lucide-react';

// Frases padrão para agilizar (Macros)
const NORMAL_FINDINGS = {
    'torax': "Campos pulmonares radiotransparentes, sem evidência de padrões patológicos. Silhueta cardíaca com dimensões e topografia preservadas. Traqueia com lúmen e trajeto conservados. Estruturas ósseas visibilizadas sem alterações.",
    'abdome': "Serosa peritoneal com detalhamento preservado. Silhuetas de órgãos abdominais (fígado, baço, rins) com dimensões e radiopacidade normais. Trato gastrointestinal com distribuição gasosa habitual. Estruturas ósseas sem alterações.",
    'esqueleto': "Estruturas ósseas com radiopacidade e trabeculado preservados. Superfícies articulares congruentes e lisas. Ausência de sinais de fraturas ou reações periosteais."
};

export function RadiologyEditor({ exam, onSave, isSaving }) {
    // Estado do Laudo
    const [region, setRegion] = useState('torax');
    const [reportText, setReportText] = useState(exam?.report_content || '');
    const [conclusion, setConclusion] = useState(exam?.conclusion || '');
    
    // Estado do VHS (Vertebral Heart Scale)
    const [vhsData, setVhsData] = useState({
        longAxis: '',  // Eixo Longo (número de vértebras)
        shortAxis: '', // Eixo Curto
        totalVhs: 0
    });

    // Calcula VHS automaticamente
    useEffect(() => {
        const l = parseFloat(vhsData.longAxis) || 0;
        const s = parseFloat(vhsData.shortAxis) || 0;
        setVhsData(prev => ({ ...prev, totalVhs: (l + s).toFixed(1) }));
    }, [vhsData.longAxis, vhsData.shortAxis]);

    // Aplica texto normal
    const applyNormalText = () => {
        const text = NORMAL_FINDINGS[region] || "";
        setReportText(prev => prev ? prev + '\n' + text : text);
        setConclusion("Estudo radiográfico dentro dos limites da normalidade.");
    };

    // Prepara salvamento
    const handleSave = () => {
        // Salvamos o VHS dentro de 'measurements' de um órgão fictício ou no corpo do exame
        // Para manter padrão, vamos salvar no corpo do exame e nos organs_data como metadata
        const radioData = [{
            organ_name: `Raio-X (${region.toUpperCase()})`,
            report_text: reportText,
            measurements: { vhs: vhsData.totalVhs, ...vhsData },
            visual_data: null
        }];

        onSave({ 
            organs_data: radioData,
            report_content: reportText,
            conclusion: conclusion
        });
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                        <Bone className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Radiologia Digital</h2>
                        <p className="text-xs text-muted-foreground">Laudo Descritivo & VHS</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={applyNormalText} className="text-green-700 border-green-200 hover:bg-green-50">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Laudo Normal
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* COLUNA 1: CONTROLES & VHS */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Região</CardTitle></CardHeader>
                        <CardContent>
                            <Select value={region} onValueChange={setRegion}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="torax">Tórax</SelectItem>
                                    <SelectItem value="abdome">Abdome</SelectItem>
                                    <SelectItem value="esqueleto">Esqueleto / Membros</SelectItem>
                                    <SelectItem value="cranio">Crânio / Coluna</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {region === 'torax' && (
                        <Card className="border-blue-200 bg-blue-50/20">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-blue-700">Cálculo VHS (Cães/Gatos)</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Eixo Longo (v)</Label>
                                        <Input type="number" value={vhsData.longAxis} onChange={e => setVhsData({...vhsData, longAxis: e.target.value})} placeholder="Ex: 5.2" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Eixo Curto (v)</Label>
                                        <Input type="number" value={vhsData.shortAxis} onChange={e => setVhsData({...vhsData, shortAxis: e.target.value})} placeholder="Ex: 4.5" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="text-sm font-semibold text-muted-foreground">Total VHS:</span>
                                    <span className={`text-2xl font-bold ${vhsData.totalVhs > 10.5 ? 'text-red-600' : 'text-blue-700'}`}>
                                        {vhsData.totalVhs > 0 ? vhsData.totalVhs : '--'}
                                    </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    *Ref Cães: 8.7 - 10.7v | Gatos: &lt; 8.0v
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* COLUNA 2 & 3: TEXTO */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Descrição Radiográfica</CardTitle></CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea 
                                className="flex-1 resize-none text-base leading-relaxed" 
                                placeholder="Descreva os achados radiográficos..."
                                value={reportText}
                                onChange={e => setReportText(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="h-1/3 flex flex-col">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Impressão Diagnóstica / Conclusão</CardTitle></CardHeader>
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