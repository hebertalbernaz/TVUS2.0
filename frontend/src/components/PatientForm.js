import React, { useState, useEffect } from 'react';
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

  const [formData, setFormData] = useState({
    name: '',
    species: practice === 'vet' ? 'dog' : 'human',
    breed: '',
    sex: 'male',
    size: 'medium',
    birth_year: '',
    weight: '',
    owner_name: '',
    ownerPhone: ''
  });

  const [age, setAge] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      let year = patient.birth_year || '';
      if (!year && patient.birth_date) {
        try {
          year = new Date(patient.birth_date).getFullYear().toString();
        } catch (e) {
          console.warn('Invalid birth_date format:', patient.birth_date);
        }
      }

      const patientData = {
        name: patient.name || '',
        species: patient.species || (practice === 'vet' ? 'dog' : 'human'),
        breed: patient.breed || '',
        sex: patient.sex || 'male',
        size: patient.size || 'medium',
        birth_year: year ? String(year) : '',
        weight: patient.weight !== null && patient.weight !== undefined ? String(patient.weight) : '',
        owner_name: patient.owner_name || '',
        ownerPhone: patient.ownerPhone || ''
      };

      setFormData(patientData);
      setInitialData(JSON.stringify(patientData));

      if (year) {
        const calculatedAge = currentYear - parseInt(year);
        setAge(calculatedAge > 0 ? String(calculatedAge) : '');
      } else {
        setAge('');
      }
    } else {
      const emptyData = {
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
      setFormData(emptyData);
      setInitialData(null);
      setAge('');
    }
  }, [patient, practice, currentYear]);

  const hasChanges = () => {
    if (!patient) return true;
    return JSON.stringify(formData) !== initialData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      return toast.error('Por favor, informe o nome do paciente.');
    }

    if (patient && !hasChanges()) {
      return toast.info('Nenhuma alteração foi feita.');
    }

    setIsSubmitting(true);

    try {
      const dataToSave = {
        name: formData.name.trim(),
        scope: practice === 'human' ? 'HUMAN' : 'VET',
        species: practice === 'human' ? 'human' : (formData.species || 'dog'),
        breed: formData.breed?.trim() || '',
        sex: formData.sex || 'male',
        size: formData.size || 'medium',
        owner_name: formData.owner_name?.trim() || '',
        ownerPhone: formData.ownerPhone?.trim() || ''
      };

      if (formData.weight && formData.weight.trim() !== '') {
        const weightValue = parseFloat(formData.weight);
        if (!isNaN(weightValue) && weightValue > 0) {
          dataToSave.weight = weightValue;
        }
      }

      if (formData.birth_year && formData.birth_year.trim() !== '') {
        const yearValue = formData.birth_year.trim();
        if (yearValue.length === 4 && !isNaN(yearValue)) {
          dataToSave.birth_year = yearValue;
        }
      }

      if (patient?.birth_date) {
        dataToSave.birth_date = patient.birth_date;
      }

      if (patient?.id) {
        await db.updatePatient(patient.id, dataToSave);
        toast.success('Paciente atualizado com sucesso!');
      } else {
        const newPatient = await db.createPatient(dataToSave);
        toast.success('Paciente cadastrado com sucesso!');
        console.log('Patient created:', newPatient);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar paciente (RxDB):', error);

      let errorMessage = 'Erro ao salvar paciente. Verifique os campos.';

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.code === 'SCHEMA_ERROR' || error.message?.includes('schema')) {
        errorMessage = 'Erro de validação: verifique os campos obrigatórios.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgeChange = (val) => {
    setAge(val);
    if (val && val.trim() !== '' && !isNaN(val)) {
      const ageNum = parseInt(val);
      if (ageNum >= 0 && ageNum < 150) {
        const calculatedYear = currentYear - ageNum;
        setFormData(prev => ({ ...prev, birth_year: calculatedYear.toString() }));
      }
    } else {
      setFormData(prev => ({ ...prev, birth_year: '' }));
    }
  };

  const handleBirthYearChange = (val) => {
    setFormData(prev => ({ ...prev, birth_year: val }));
    if (val && val.length === 4 && !isNaN(val)) {
      const yearNum = parseInt(val);
      if (yearNum > 1900 && yearNum <= currentYear) {
        const calculatedAge = currentYear - yearNum;
        setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome do {terms.patient_label} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder={`Digite o nome do ${terms.patient_label.toLowerCase()}`}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_name">{terms.owner_label}</Label>
          <Input
            id="owner_name"
            value={formData.owner_name}
            onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
            placeholder={`Nome do ${terms.owner_label.toLowerCase()}`}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ownerPhone">Telefone / Contato</Label>
          <Input
            id="ownerPhone"
            value={formData.ownerPhone}
            onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
            placeholder="(00) 00000-0000"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {practice === 'vet' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="species">{terms.species_label}</Label>
            <Select
              value={formData.species}
              onValueChange={val => setFormData({ ...formData, species: val })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Canino</SelectItem>
                <SelectItem value="cat">Felino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">{terms.breed_label}</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={e => setFormData({ ...formData, breed: e.target.value })}
              placeholder="Raça"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Porte</Label>
            <Select
              value={formData.size}
              onValueChange={val => setFormData({ ...formData, size: val })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
          <Select
            value={formData.sex}
            onValueChange={val => setFormData({ ...formData, sex: val })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">
                {practice === 'vet' ? 'Macho' : 'Masculino'}
              </SelectItem>
              <SelectItem value="female">
                {practice === 'vet' ? 'Fêmea' : 'Feminino'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age_calc" className="text-blue-600 font-semibold">
            {terms.age_label} (calc)
          </Label>
          <Input
            id="age_calc"
            type="number"
            placeholder="Ex: 5"
            value={age}
            onChange={e => handleAgeChange(e.target.value)}
            min="0"
            max="150"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_year">Ano Nasc.</Label>
          <Input
            id="birth_year"
            type="number"
            placeholder="Ex: 2020"
            value={formData.birth_year}
            onChange={e => handleBirthYearChange(e.target.value)}
            min="1900"
            max={currentYear}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">{terms.weight_label}</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: e.target.value })}
            placeholder="Ex: 15.5"
            min="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (patient && !hasChanges())}
        >
          {isSubmitting
            ? 'Salvando...'
            : patient
            ? 'Salvar Alterações'
            : 'Cadastrar Paciente'}
        </Button>
      </div>
    </form>
  );
}
