import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Trash2, Edit, Save, Pill } from 'lucide-react';
import { getDatabase, genId } from '@/core/database/db';
import { useLicense } from '@/contexts/LicenseContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // <--- Importante para corrigir o warning
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DrugsManager() {
  const { practice } = useLicense();
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', default_dosage: '' });

  const loadDrugs = useCallback(async () => {
    try {
      const db = await getDatabase();
      
      const query = {
        selector: {
          type: practice
        },
        sort: [{ name: 'asc' }]
      };

      if (searchTerm) {
        // CORREÇÃO QU16 TAMBÉM AQUI
        query.selector.name = { 
            $regex: searchTerm, 
            $options: 'i' 
        };
      }

      const docs = await db.drugs.find(query).exec();
      setDrugs(docs.map(d => d.toJSON()));
    } catch (e) {
      console.error("Erro ao carregar drogas:", e);
    }
  }, [searchTerm, practice]);

  useEffect(() => {
    loadDrugs();
  }, [loadDrugs]);

  const handleSave = async () => {
    if (!formData.name || !formData.default_dosage) {
        toast.warning("Preencha nome e posologia.");
        return;
    }

    try {
        const db = await getDatabase();
        
        if (editingDrug) {
            const doc = await db.drugs.findOne(editingDrug.id).exec();
            if (doc) {
                await doc.patch({
                    name: formData.name,
                    default_dosage: formData.default_dosage
                });
                toast.success("Atualizado com sucesso!");
            }
        } else {
            await db.drugs.insert({
                id: genId(),
                name: formData.name,
                default_dosage: formData.default_dosage,
                type: practice
            });
            toast.success("Cadastrado com sucesso!");
        }

        setIsDialogOpen(false);
        setEditingDrug(null);
        setFormData({ name: '', default_dosage: '' });
        loadDrugs();
    } catch (e) {
        console.error(e);
        toast.error("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Excluir este medicamento?")) return;
      try {
          const db = await getDatabase();
          const doc = await db.drugs.findOne(id).exec();
          if (doc) await doc.remove();
          toast.success("Medicamento removido.");
          loadDrugs();
      } catch (e) {
          toast.error("Erro ao remover.");
      }
  };

  const openEdit = (drug) => {
      setEditingDrug(drug);
      setFormData({ name: drug.name, default_dosage: drug.default_dosage });
      setIsDialogOpen(true);
  };

  const openNew = () => {
      setEditingDrug(null);
      setFormData({ name: '', default_dosage: '' });
      setIsDialogOpen(true);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Pill className="h-5 w-5" /> Banco de Medicamentos
        </h2>
        <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> Novo Medicamento
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Filtrar lista..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md divide-y max-h-[500px] overflow-y-auto">
          {drugs.map(drug => (
              <div key={drug.id} className="p-4 flex justify-between items-center hover:bg-muted/50">
                  <div>
                      <div className="font-bold">{drug.name}</div>
                      <div className="text-sm text-muted-foreground">{drug.default_dosage}</div>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(drug)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(drug.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                  </div>
              </div>
          ))}
          {drugs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                  Nenhum medicamento encontrado.
              </div>
          )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingDrug ? 'Editar' : 'Novo'} Medicamento</DialogTitle>
                {/* DESCRIÇÃO ADICIONADA PARA CORRIGIR WARNING */}
                <DialogDescription>
                    Insira os dados do medicamento para o banco de dados local.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Nome / Princípio Ativo</Label>
                    <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Doxiciclina 100mg"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Posologia Padrão</Label>
                    <Input 
                        value={formData.default_dosage} 
                        onChange={e => setFormData({...formData, default_dosage: e.target.value})}
                        placeholder="Ex: 5mg/kg a cada 12h"
                    />
                    {practice === 'vet' && (
                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            Use "mg/kg" (ex: <i>10mg/kg</i>) para cálculo automático baseado no peso.
                        </p>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}