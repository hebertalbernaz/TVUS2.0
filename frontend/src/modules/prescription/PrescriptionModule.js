import React, { useState, useEffect, useCallback } from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Save, Pill, Database, AlertCircle } from 'lucide-react';
import { getDatabase, genId } from '../../core/database/db';
import { toast } from 'sonner';

/**
 * PrescriptionModule - Drug Database Manager
 * 
 * This module is ONLY for managing the drug database (CRUD).
 * Prescriptions are created via PatientCard -> "Nova Receita" -> PrescriptionPage
 */
export default function PrescriptionModule() {
  const { practice, terms } = useLicense();
  const [searchTerm, setSearchTerm] = useState('');
  const [drugsList, setDrugsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Control for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [formData, setFormData] = useState({ name: '', default_dosage: '', type: practice });

  // Load drugs from database
  const loadDrugs = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      // Filter by type (vet or human) and search by name
      const query = {
          selector: {
              type: practice,
              name: { $regex: new RegExp(searchTerm, 'i') }
          },
          limit: 100
      };
      const docs = await db.drugs.find(query).exec();
      setDrugsList(docs.map(d => d.toJSON()));
    } catch (e) {
      console.error('Error loading drugs:', e);
      toast.error('Erro ao carregar medicamentos');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, practice]);

  useEffect(() => {
    loadDrugs();
  }, [loadDrugs]);

  // Open modal for create/edit
  const handleOpenModal = (drug = null) => {
      setEditingDrug(drug);
      setFormData(drug 
        ? { name: drug.name, default_dosage: drug.default_dosage, type: drug.type } 
        : { name: '', default_dosage: '', type: practice }
      );
      setIsModalOpen(true);
  };

  // Save drug (create or update)
  const handleSaveDrug = async () => {
      if (!formData.name || !formData.default_dosage) {
        return toast.error("Preencha nome e posologia padrão.");
      }
      
      try {
          const db = await getDatabase();
          if (editingDrug) {
              // Update existing
              const doc = await db.drugs.findOne(editingDrug.id).exec();
              await doc.patch({
                  name: formData.name,
                  default_dosage: formData.default_dosage,
                  type: formData.type
              });
              toast.success("Medicamento atualizado!");
          } else {
              // Create new
              await db.drugs.insert({
                  id: genId(),
                  name: formData.name,
                  default_dosage: formData.default_dosage,
                  type: formData.type
              });
              toast.success("Medicamento criado!");
          }
          setIsModalOpen(false);
          loadDrugs();
      } catch (e) {
          console.error(e);
          toast.error("Erro ao salvar medicamento.");
      }
  };

  // Delete drug
  const handleDeleteDrug = async (id, e) => {
      e.stopPropagation();
      if (!window.confirm("Tem certeza que deseja excluir este medicamento do banco?")) return;
      
      try {
          const db = await getDatabase();
          const doc = await db.drugs.findOne(id).exec();
          await doc.remove();
          toast.success("Medicamento excluído.");
          setDrugsList(prev => prev.filter(d => d.id !== id));
      } catch (e) {
          toast.error("Erro ao excluir.");
      }
  };

  const totalDrugs = drugsList.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" /> Banco de Medicamentos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
                Gerencie o cadastro de medicamentos ({practice === 'vet' ? 'Veterinários' : 'Humanos'}).
                Para criar receitas, acesse a ficha do paciente.
            </p>
          </div>
          <Button onClick={() => handleOpenModal(null)} className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" /> Novo Medicamento
          </Button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-300">Como criar receitas?</p>
          <p className="text-blue-700 dark:text-blue-400 mt-1">
            Acesse a lista de <strong>Pacientes</strong>, clique no botão <strong>&quot;Novo&quot;</strong> no card do paciente,
            e selecione <strong>&quot;Nova Receita&quot;</strong>. A receita será vinculada ao paciente automaticamente.
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar medicamento..." 
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <Badge variant="secondary" className="py-1.5 px-3">
          {totalDrugs} medicamento{totalDrugs !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Drug List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : drugsList.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum medicamento encontrado.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Clique em &quot;Novo Medicamento&quot; para cadastrar.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {drugsList.map(drug => (
              <div 
                key={drug.id} 
                className="p-4 hover:bg-muted/50 transition-colors group flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{drug.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {drug.type === 'vet' ? 'VET' : 'HUMANO'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate pr-4">
                    {drug.default_dosage}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleOpenModal(drug)}
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => handleDeleteDrug(drug.id, e)}
                        title="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  {editingDrug ? 'Editar Medicamento' : 'Novo Medicamento'}
                </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Nome</Label>
                    <Input 
                        className="col-span-3" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Dipirona 500mg"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tipo</Label>
                    <div className="col-span-3 flex gap-2">
                      <Button 
                        type="button"
                        size="sm"
                        variant={formData.type === 'vet' ? 'default' : 'outline'}
                        onClick={() => setFormData({...formData, type: 'vet'})}
                      >
                        Veterinário
                      </Button>
                      <Button 
                        type="button"
                        size="sm"
                        variant={formData.type === 'human' ? 'default' : 'outline'}
                        onClick={() => setFormData({...formData, type: 'human'})}
                      >
                        Humano
                      </Button>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Posologia Padrão</Label>
                    <Textarea 
                        className="col-span-3 font-mono text-sm" 
                        value={formData.default_dosage} 
                        onChange={e => setFormData({...formData, default_dosage: e.target.value})}
                        placeholder={practice === 'vet' ? "Ex: 25 mg/kg a cada 8h" : "Ex: 1 cp a cada 6h"}
                        rows={3}
                    />
                </div>
                <div className="text-xs text-muted-foreground text-center px-8">
                    {formData.type === 'vet' ? (
                        <p>Dica: Use &quot;mg/kg&quot; no texto para ativar a calculadora automática nas receitas.</p>
                    ) : (
                        <p>Dica: Escreva a posologia comum para agilizar a prescrição.</p>
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveDrug} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
