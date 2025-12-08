import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';

export function PatientForm({ patient, onSuccess, onCancel }) {
  const { terms, practice } = useLicense();
  const currentYear = new Date().getFullYear();
  
  // Inicializa formData baseado em patient ou valores padrão
  const initialFormData = useMemo(() => {
    if (patient) {
      let year = patient.birth_year || '';
      if (!year && patient.birth_date) {
        try { year = new Date(patient.birth_date).getFullYear().toString(); } catch (e) { /* ignore */ }
      }
      return {
        name: patient.name || '',
        species: patient.species || (practice === 'vet' ? 'dog' : 'human'),
        breed: patient.breed || '',
        sex: patient.sex || 'male',
        size: patient.size || 'medium',
        birth_year: year ? String(year) : '',
        weight: patient.weight || '',
        owner_name: patient.owner_name || '',
        ownerPhone: patient.ownerPhone || ''
      };
    }
    return {
      name: '',
      species: practice === 'vet' ? 'dog' : 'human',
      breed: '',
      sex: 'male',
      size: 'medium',
      birth_year: '',
      weight: '',
      owner_name: '',
      ownerPhone: ''
    };
  }, [patient, practice]);

  const [formData, setFormData] = useState(initialFormData);

  const initialAge = useMemo(() => {
    if (patient?.birth_year) {
      return (currentYear - parseInt(patient.birth_year)).toString();
    }
    return '';
  }, [patient, currentYear]);

  const [age, setAge] = useState(initialAge);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim() === '') {
      return toast.error("Por favor, informe o nome do paciente.");
    }

    try {
      // Conversão de Tipos Rigorosa para RxDB
      const dataToSave = {
        name: formData.name.trim(),
        species: practice === 'human' ? 'human' : (formData.species || 'dog'),
        breed: formData.breed || '',
        sex: formData.sex || 'male',
        size: formData.size || 'medium',
        owner_name: formData.owner_name || '',
        ownerPhone: formData.ownerPhone || '',
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_year: formData.birth_year ? String(formData.birth_year) : null,
        // 🟢 CORREÇÃO: Removemos birth_date: null. 
        // Se não houver data, não enviamos o campo, pois o Schema exige 'string' se presente.
        ...(patient?.birth_date ? { birth_date: patient.birth_date } : {}) 
      };

      if (patient) {
        await db.updatePatient(patient.id, dataToSave);
        toast.success('Paciente atualizado!');
      } else {
        await db.createPatient(dataToSave);
        toast.success('Paciente cadastrado!');
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      toast.error(`Erro ao salvar paciente: ${error.message || 'Verifique os campos.'}`);
    }
  };

  const handleAgeChange = (val) => {
    setAge(val);
    if (val && !isNaN(val)) {
      const calculatedYear = currentYear - parseInt(val);
      setFormData(prev => ({ ...prev, birth_year: calculatedYear.toString() }));
    } else {
      setFormData(prev => ({ ...prev, birth_year: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do {terms.patient_label} *</Label>
          <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">{terms.owner_label}</Label>
          <Input id="owner_name" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Telefone / Contato</Label>
            <Input id="ownerPhone" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} placeholder="(00) 00000-0000" />
          </div>
      </div>

      {practice === 'vet' && (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
            <Label htmlFor="species">{terms.species_label}</Label>
            <Select value={formData.species} onValueChange={val => setFormData({...formData, species: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="dog">Canino</SelectItem>
                <SelectItem value="cat">Felino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label htmlFor="breed">{terms.breed_label}</Label>
            <Input id="breed" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} />
            </div>

            <div className="space-y-2">
            <Label htmlFor="size">Porte</Label>
            <Select value={formData.size} onValueChange={val => setFormData({...formData, size: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sex">{terms.sex_label}</Label>
          <Select value={formData.sex} onValueChange={val => setFormData({...formData, sex: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{practice === 'vet' ? 'Macho' : 'Masculino'}</SelectItem>
              <SelectItem value="female">{practice === 'vet' ? 'Fêmea' : 'Feminino'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="age_calc" className="text-blue-600 font-semibold">{terms.age_label} (calc)</Label>
            <Input type="number" placeholder="Ex: 5" value={age} onChange={e => handleAgeChange(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label htmlFor="birth_year">Ano Nasc.</Label>
            <Input type="number" placeholder="Ex: 2020" value={formData.birth_year} onChange={e => {
                setFormData(prev => ({ ...prev, birth_year: e.target.value }));
                if (e.target.value.length === 4) setAge((currentYear - parseInt(e.target.value)).toString());
            }} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">{terms.weight_label}</Label>
          <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}