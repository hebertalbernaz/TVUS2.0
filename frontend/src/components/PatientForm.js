import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';
import { cn } from '@/lib/utils';

export function PatientForm({ patient, onSuccess, onCancel }) {
  const { terms, practice } = useLicense();
  const isHuman = practice === 'human';
  const currentYear = new Date().getFullYear();

  const initialFormData = useMemo(() => {
    let year = patient?.birth_year || '';
    if (!year && patient?.birth_date) {
      try { year = new Date(patient.birth_date).getFullYear().toString(); } catch (e) { /* ignore */ }
    }
    return {
      name: patient?.name || '',
      species: isHuman ? 'human' : (patient?.species || ''),
      breed: patient?.breed || '',
      sex: patient?.sex || 'male',
      size: patient?.size || 'medium',
      birth_year: year ? String(year) : '',
      weight: patient?.weight ?? '',
      owner_name: patient?.owner_name || '',
      ownerPhone: patient?.ownerPhone || ''
    };
  }, [patient, isHuman]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const initialAge = useMemo(() => {
    if (patient?.birth_year) {
      return (currentYear - parseInt(patient.birth_year)).toString();
    }
    return '';
  }, [patient, currentYear]);

  const [age, setAge] = useState(initialAge);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      name: !formData.name.trim(),
      species: !isHuman && !formData.species,
      breed: !isHuman && !formData.breed.trim()
    };
    setErrors(nextErrors);

    if (nextErrors.name) return toast.error(`Por favor, informe o nome do ${terms.patient_label.toLowerCase()}.`);
    if (nextErrors.species) return toast.error('Selecione a espécie do paciente.');
    if (nextErrors.breed) return toast.error('Informe a raça do paciente (use "SRD" se não tiver raça definida).');

    try {
      const dataToSave = {
        name: formData.name.trim(),
        // Strict segregation (White Label safety)
        scope: isHuman ? 'HUMAN' : 'VET',
        species: isHuman ? 'human' : formData.species,
        breed: isHuman ? '' : formData.breed.trim(),
        sex: formData.sex || 'male',
        size: formData.size || 'medium',
        owner_name: formData.owner_name || '',
        ownerPhone: formData.ownerPhone || '',
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_year: formData.birth_year ? String(formData.birth_year) : null,
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
      updateField('birth_year', (currentYear - parseInt(val)).toString());
    } else {
      updateField('birth_year', '');
    }
  };

  const errorRing = (field) => errors[field] && 'border-destructive focus-visible:ring-destructive';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do {terms.patient_label} *</Label>
          <Input id="name" required aria-invalid={!!errors.name} className={cn(errorRing('name'))} value={formData.name} onChange={e => updateField('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">{terms.owner_label}</Label>
          <Input id="owner_name" value={formData.owner_name} onChange={e => updateField('owner_name', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Telefone / Contato</Label>
            <Input id="ownerPhone" value={formData.ownerPhone} onChange={e => updateField('ownerPhone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
      </div>

      {!isHuman && (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
            <Label htmlFor="species">{terms.species_label} *</Label>
            <Select value={formData.species} onValueChange={val => updateField('species', val)}>
                <SelectTrigger id="species" aria-invalid={!!errors.species} className={cn(errorRing('species'))}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {terms.species_options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label htmlFor="breed">{terms.breed_label} *</Label>
            <Input id="breed" required aria-invalid={!!errors.breed} className={cn(errorRing('breed'))} placeholder="Ex: SRD, Labrador" value={formData.breed} onChange={e => updateField('breed', e.target.value)} />
            </div>

            <div className="space-y-2">
            <Label htmlFor="size">Porte</Label>
            <Select value={formData.size} onValueChange={val => updateField('size', val)}>
                <SelectTrigger id="size"><SelectValue /></SelectTrigger>
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
          <Select value={formData.sex} onValueChange={val => updateField('sex', val)}>
            <SelectTrigger id="sex"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{terms.sex_male}</SelectItem>
              <SelectItem value="female">{terms.sex_female}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="age_calc" className="text-blue-600 font-semibold">{terms.age_label} (calc)</Label>
            <Input id="age_calc" type="number" placeholder="Ex: 5" value={age} onChange={e => handleAgeChange(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label htmlFor="birth_year">Ano Nasc.</Label>
            <Input id="birth_year" type="number" placeholder="Ex: 2020" value={formData.birth_year} onChange={e => {
                updateField('birth_year', e.target.value);
                if (e.target.value.length === 4) setAge((currentYear - parseInt(e.target.value)).toString());
            }} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">{terms.weight_label}</Label>
          <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={e => updateField('weight', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
