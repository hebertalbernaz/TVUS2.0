import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Printer, Save, ArrowLeft } from 'lucide-react';
import { db } from '@/services/database';
import { getDatabase, genId } from '@/core/database/db';
import { useLicense } from '@/contexts/LicenseContext';
import { DrugSelector } from '@/components/DrugSelector';
import { generatePrescriptionDOCX } from '@/services/documentGenerator';
import { toast } from 'sonner';

export default function PrescriptionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { practice, terms } = useLicense();
  
  const [patient, setPatient] = useState(null);
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) return;
      try {
        const p = await db.getPatient(patientId);
        const s = await db.getSettings();
        setPatient(p);
        setSettings(s);
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  // Função auxiliar para calcular dose baseada em peso
  const calculateSmartDosage = (defaultDosage, patientWeight) => {
    if (!patientWeight || typeof defaultDosage !== 'string') return defaultDosage;
    
    // Regex para encontrar padrões como "10mg/kg", "0.5 mg/kg", "2.5mg/kg"
    // Captura o valor numérico antes do "mg/kg"
    const mgKgRegex = /(\d+(?:\.\d+)?)\s*mg\/kg/i;
    const match = defaultDosage.match(mgKgRegex);

    if (match) {
        try {
            const dosePerKg = parseFloat(match[1]);
            const weight = parseFloat(patientWeight);
            
            if (!isNaN(dosePerKg) && !isNaN(weight)) {
                const totalDoseMg = dosePerKg * weight;
                
                // Formatação: arredonda se for inteiro, ou mantem decimais se necessário
                const formattedTotal = Number.isInteger(totalDoseMg) 
                    ? totalDoseMg 
                    : totalDoseMg.toFixed(1);

                // Substitui "X mg/kg" por "TOTAL mg (X mg/kg)" para clareza
                return defaultDosage.replace(
                    match[0], 
                    `${formattedTotal}mg (Ref: ${match[0]})`
                );
            }
        } catch (err) {
            console.error("Erro ao calcular dose:", err);
            return defaultDosage;
        }
    }
    
    return defaultDosage;
  };

  const handleAddDrug = (drug) => {
    let finalDosage = drug.default_dosage;
    
    // Se for prática veterinária e tiver peso, aplica a lógica inteligente
    if (practice === 'vet' && patient?.weight) {
        finalDosage = calculateSmartDosage(drug.default_dosage, patient.weight);
    }

    setItems([...items, {
        drug_id: drug.id,
        drug_name: drug.name,
        dosage: finalDosage,
        quantity: "1 cx/frasco" // Valor padrão editável
    }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
      if (!items.length) return toast.warning("Adicione medicamentos antes de salvar.");
      
      try {
          const rxdb = await getDatabase();
          const prescriptionData = {
              id: genId(),
              patient_id: patient.id,
              doctor_name: settings.veterinarian_name,
              date: new Date().toISOString(),
              items: items,
              notes: notes
          };
          
          await rxdb.prescriptions.insert(prescriptionData);
          toast.success("Receita salva no histórico!");
      } catch (e) {
          console.error(e);
          toast.error("Erro ao salvar receita");
      }
  };

  const handlePrint = async () => {
      if (!patient) return;
      const prescriptionData = {
          items,
          notes
      };
      await generatePrescriptionDOCX(prescriptionData, patient, settings, terms);
      toast.success("Arquivo gerado com sucesso!");
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!patient) return <div className="p-8">Paciente não encontrado</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{terms.prescription_header}</h1>
                <p className="text-muted-foreground">
                    {terms.patient_label}: <span className="font-semibold text-foreground">{patient.name}</span> 
                    {practice === 'vet' && patient.weight && ` • ${patient.weight}kg`}
                </p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir (DOCX)
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Busca e Lista */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 overflow-visible">
                <h2 className="font-semibold mb-3">Adicionar Medicamento</h2>
                {/* Selector agora corrigido */}
                <DrugSelector onSelect={handleAddDrug} />
            </Card>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={idx} className="p-4 relative group hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{idx + 1}. {item.drug_name}</h3>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-muted-foreground font-medium">Posologia / Uso</label>
                                <Input 
                                    value={item.dosage} 
                                    onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                                    className="font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium">Quantidade</label>
                                <Input 
                                    value={item.quantity} 
                                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} 
                                />
                            </div>
                        </div>
                    </Card>
                ))}
                
                {items.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
                        <p>Nenhum item adicionado à receita.</p>
                        <p className="text-xs mt-1">Busque acima para começar</p>
                    </div>
                )}
            </div>
            
            <Card className="p-4">
                <label className="font-semibold mb-2 block">Observações / Recomendações</label>
                <Textarea 
                    placeholder="Ex: Retorno em 7 dias..." 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="min-h-[100px]"
                />
            </Card>
        </div>

        {/* Coluna Direita: Resumo */}
        <div className="space-y-6">
            <Card className="p-4 bg-muted/30 sticky top-4">
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Resumo</h3>
                <ul className="text-sm space-y-2">
                    <li className="flex justify-between border-b pb-2">
                        <span>Paciente:</span>
                        <span className="font-medium">{patient.name}</span>
                    </li>
                    {practice === 'vet' && (
                        <li className="flex justify-between border-b pb-2">
                            <span>Peso:</span>
                            <span className="font-medium">{patient.weight || '--'} kg</span>
                        </li>
                    )}
                    <li className="flex justify-between pt-2">
                        <span>Itens:</span>
                        <span className="font-bold">{items.length}</span>
                    </li>
                </ul>
                
                {practice === 'vet' && (
                    <div className="mt-4 text-xs text-blue-700 bg-blue-50 p-3 rounded border border-blue-100">
                        <p className="font-bold mb-1">Cálculo Automático:</p>
                        <p>A dosagem está sendo calculada automaticamente com base em <b>{patient.weight || 0}kg</b> quando o medicamento possui indicação "mg/kg".</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}