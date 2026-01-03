import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  FileText, 
  ClipboardList, 
  Activity, 
  Save, 
  Search,
  Glasses
} from 'lucide-react';
import { toast } from 'sonner';
import { EyeFundusEditor } from '../ophthalmo/EyeFundusEditor'; // Componente visual (se já existir)

// Estrutura inicial vazia baseada no Schema
const INITIAL_EYE_DATA = {
    visual_acuity: '',
    visual_acuity_corrected: '',
    iop: '',
    iop_method: '',
    biomicroscopy: {
        lids: '',
        conjunctiva: '',
        cornea: '',
        anterior_chamber: '',
        iris: '',
        pupil: '',
        lens: ''
    },
    fundoscopy: {
        vitreous: '',
        optic_disc: '',
        cup_disc_ratio: '',
        macula: '',
        retina: '',
        vessels: '',
        choroid: ''
    },
    diagnosis: '',
    conduct: ''
};

export function OphthalmoEditor({ exam, patient, onSave, isSaving }) {
    // Inicializa estado com dados do exame ou defaults
    const [data, setData] = useState({
        chief_complaint: exam?.chief_complaint || '',
        clinical_history: exam?.clinical_history || '',
        current_medications: exam?.current_medications || '',
        allergies: exam?.allergies || '',
        
        right_eye: exam?.right_eye || JSON.parse(JSON.stringify(INITIAL_EYE_DATA)),
        left_eye: exam?.left_eye || JSON.parse(JSON.stringify(INITIAL_EYE_DATA)),
        
        general_diagnosis: exam?.general_diagnosis || '',
        treatment_plan: exam?.treatment_plan || '',
        follow_up: exam?.follow_up || '',
        notes: exam?.notes || ''
    });

    const [activeTab, setActiveTab] = useState('clinical_exam');

    // Debounce Save: Salva automaticamente após 2 segundos de inatividade ou ao mudar de aba
    useEffect(() => {
        const timer = setTimeout(() => {
            handleManualSave();
        }, 2000);
        return () => clearTimeout(timer);
    }, [data]);

    const handleManualSave = () => {
        if (onSave) onSave(data);
    };

    const updateField = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateEyeField = (eye, section, field, value) => {
        setData(prev => {
            const eyeData = { ...prev[eye] };
            // Se for campo direto (ex: iop)
            if (!section) {
                eyeData[field] = value;
            } else {
                // Se for aninhado (ex: biomicroscopy.cornea)
                eyeData[section] = {
                    ...eyeData[section],
                    [field]: value
                };
            }
            return { ...prev, [eye]: eyeData };
        });
    };

    return (
        <div className="h-full flex flex-col bg-muted/10">
            {/* Toolbar Superior */}
            <div className="flex items-center justify-between px-6 py-2 bg-background border-b shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Eye className="h-5 w-5" />
                    <span>Prontuário Oftalmológico</span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {isSaving ? 'Salvando...' : 'Alterações salvas automaticamente'}
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-6 pt-4 pb-0 bg-background border-b">
                        <TabsList className="grid w-full max-w-2xl grid-cols-3">
                            <TabsTrigger value="anamnesis" className="gap-2"><ClipboardList className="h-4 w-4"/> Anamnese</TabsTrigger>
                            <TabsTrigger value="clinical_exam" className="gap-2"><Glasses className="h-4 w-4"/> Exame Clínico</TabsTrigger>
                            <TabsTrigger value="diagnosis" className="gap-2"><FileText className="h-4 w-4"/> Diagnóstico & Conduta</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* --- ABA 1: ANAMNESE --- */}
                        <TabsContent value="anamnesis" className="mt-0 space-y-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                            <Card>
                                <CardHeader><CardTitle>Histórico Clínico</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Queixa Principal</Label>
                                        <Textarea 
                                            placeholder="Ex: Olho vermelho, secreção, perda de visão..." 
                                            value={data.chief_complaint}
                                            onChange={e => updateField('chief_complaint', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Histórico da Doença Atual (HDA) & Pregresso</Label>
                                        <Textarea 
                                            placeholder="Detalhes da evolução, traumas anteriores, comorbidades (Diabetes, Hipertensão)..." 
                                            value={data.clinical_history}
                                            onChange={e => updateField('clinical_history', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Medicações em Uso</Label>
                                            <Textarea 
                                                placeholder="Sistêmicas e tópicas..." 
                                                value={data.current_medications}
                                                onChange={e => updateField('current_medications', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Alergias</Label>
                                            <Textarea 
                                                placeholder="Medicamentosas ou outras..." 
                                                value={data.allergies}
                                                onChange={e => updateField('allergies', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- ABA 2: EXAME CLÍNICO (Comparativo OD/OE) --- */}
                        <TabsContent value="clinical_exam" className="mt-0 h-full animate-in fade-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                                {/* OLHO DIREITO (OD) */}
                                <EyeColumn 
                                    side="OD" 
                                    label="Olho Direito (OD)" 
                                    colorClass="text-blue-700 border-blue-200 bg-blue-50/30"
                                    data={data.right_eye}
                                    onChange={(s, f, v) => updateEyeField('right_eye', s, f, v)}
                                />

                                {/* OLHO ESQUERDO (OE) */}
                                <EyeColumn 
                                    side="OE" 
                                    label="Olho Esquerdo (OE)" 
                                    colorClass="text-red-700 border-red-200 bg-red-50/30"
                                    data={data.left_eye}
                                    onChange={(s, f, v) => updateEyeField('left_eye', s, f, v)}
                                />
                            </div>
                        </TabsContent>

                        {/* --- ABA 3: DIAGNÓSTICO E CONDUTA --- */}
                        <TabsContent value="diagnosis" className="mt-0 space-y-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                            <Card className="border-l-4 border-l-primary">
                                <CardHeader><CardTitle>Conclusão Médica</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label className="text-base">Diagnóstico Principal</Label>
                                        <Textarea 
                                            className="font-medium text-base"
                                            placeholder="Ex: Catarata Senil Madura OD, Facosclerose OE..."
                                            value={data.general_diagnosis}
                                            onChange={e => updateField('general_diagnosis', e.target.value)}
                                        />
                                    </div>
                                    
                                    <Separator />

                                    <div className="grid gap-2">
                                        <Label>Plano Terapêutico / Conduta</Label>
                                        <Textarea 
                                            placeholder="Ex: Facoemulsificação com implante de LIO..."
                                            value={data.treatment_plan}
                                            onChange={e => updateField('treatment_plan', e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Seguimento / Retorno</Label>
                                            <Input 
                                                placeholder="Ex: Retorno em 30 dias..." 
                                                value={data.follow_up}
                                                onChange={e => updateField('follow_up', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Observações Gerais</Label>
                                            <Input 
                                                placeholder="Notas internas..." 
                                                value={data.notes}
                                                onChange={e => updateField('notes', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <div className="flex justify-end p-4">
                                <Button onClick={handleManualSave} size="lg" className="w-full md:w-auto gap-2">
                                    <Save className="h-4 w-4" /> Salvar Laudo Final
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

// Subcomponente para renderizar a coluna de um olho
function EyeColumn({ side, label, colorClass, data, onChange }) {
    return (
        <Card className={`flex flex-col h-full overflow-hidden border-t-4 ${colorClass}`}>
            <CardHeader className="py-3 px-4 bg-background/50 border-b shrink-0">
                <CardTitle className="text-lg flex justify-between items-center">
                    {label}
                    <Eye className="h-5 w-5 opacity-50" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* 1. Visão e Pressão */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Acuidade & Tonometria
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">AV (s/ correção)</Label>
                            <Input 
                                value={data.visual_acuity || ''} 
                                onChange={e => onChange(null, 'visual_acuity', e.target.value)} 
                                placeholder="20/20" 
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">AV (c/ correção)</Label>
                            <Input 
                                value={data.visual_acuity_corrected || ''} 
                                onChange={e => onChange(null, 'visual_acuity_corrected', e.target.value)} 
                                placeholder="20/20" 
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">PIO (mmHg)</Label>
                            <Input 
                                type="number"
                                value={data.iop || ''} 
                                onChange={e => onChange(null, 'iop', e.target.value)} 
                                placeholder="12" 
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Método PIO</Label>
                            <Input 
                                value={data.iop_method || ''} 
                                onChange={e => onChange(null, 'iop_method', e.target.value)} 
                                placeholder="Aplanação" 
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* 2. Biomicroscopia (Segmento Anterior) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Search className="h-3 w-3" /> Biomicroscopia
                    </h4>
                    
                    <div className="grid gap-2">
                        <Label className="text-xs">Pálpebras / Anexos</Label>
                        <Input 
                            value={data.biomicroscopy?.lids || ''} 
                            onChange={e => onChange('biomicroscopy', 'lids', e.target.value)} 
                            placeholder="Sem alterações" className="h-8"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs">Conjuntiva</Label>
                        <Input 
                            value={data.biomicroscopy?.conjunctiva || ''} 
                            onChange={e => onChange('biomicroscopy', 'conjunctiva', e.target.value)} 
                            placeholder="Clara" className="h-8"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs">Córnea</Label>
                        <Input 
                            value={data.biomicroscopy?.cornea || ''} 
                            onChange={e => onChange('biomicroscopy', 'cornea', e.target.value)} 
                            placeholder="Transparente" className="h-8"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Câmara Anterior</Label>
                            <Input 
                                value={data.biomicroscopy?.anterior_chamber || ''} 
                                onChange={e => onChange('biomicroscopy', 'anterior_chamber', e.target.value)} 
                                placeholder="Profunda" className="h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Íris / Pupila</Label>
                            <Input 
                                value={data.biomicroscopy?.iris || ''} 
                                onChange={e => onChange('biomicroscopy', 'iris', e.target.value)} 
                                placeholder="Isocórica" className="h-8"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs">Cristalino</Label>
                        <Input 
                            value={data.biomicroscopy?.lens || ''} 
                            onChange={e => onChange('biomicroscopy', 'lens', e.target.value)} 
                            placeholder="Transparente" className="h-8"
                        />
                    </div>
                </div>

                <Separator />

                {/* 3. Fundoscopia (Segmento Posterior) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Fundoscopia
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Disco Óptico</Label>
                            <Input 
                                value={data.fundoscopy?.optic_disc || ''} 
                                onChange={e => onChange('fundoscopy', 'optic_disc', e.target.value)} 
                                placeholder="Corado, BND" className="h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Escavação (LxA)</Label>
                            <Input 
                                value={data.fundoscopy?.cup_disc_ratio || ''} 
                                onChange={e => onChange('fundoscopy', 'cup_disc_ratio', e.target.value)} 
                                placeholder="0.3 x 0.3" className="h-8"
                            />
                        </div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label className="text-xs">Vitreous</Label>
                        <Input 
                            value={data.fundoscopy?.vitreous || ''} 
                            onChange={e => onChange('fundoscopy', 'vitreous', e.target.value)} 
                            placeholder="Claro" className="h-8"
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label className="text-xs">Mácula / Retina</Label>
                        <Input 
                            value={data.fundoscopy?.retina || ''} 
                            onChange={e => onChange('fundoscopy', 'retina', e.target.value)} 
                            placeholder="Aplicada, sem lesões" className="h-8"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <Eye className="mr-2 h-3 w-3" /> Abrir Desenho de Fundo de Olho
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}