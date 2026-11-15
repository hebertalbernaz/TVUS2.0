import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { useLicense } from '@/contexts/LicenseContext';
import { cn } from '@/lib/utils';

const Field = ({ id, label, children, strong }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className={cn(strong && 'font-semibold text-foreground')}>{label}</Label>
    {children}
  </div>
);

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
      species: isHuman ? 'human' : (patient?.species || 'dog'),
      breed: patient?.breed || '',
      sex: patient?.sex || 'male',
      neutered: patient?.neutered || 'unknown',
      size: patient?.size || 'medium',
      birth_year: year ? String(year) : '',
      weight: patient?.weight ?? '',
      owner_name: patient?.owner_name || '',
      ownerPhone: patient?.ownerPhone || ''
    };
  }, [patient, isHuman]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState(patient?.birth_year ? String(currentYear - parseInt(patient.birth_year)) : '');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const save = async (startUltrasound) => {
    const nextErrors = {
      name: !formData.name.trim(),
      species: !isHuman && !formData.species,
      breed: !isHuman && !formData.breed.trim()
    };
    setErrors(nextErrors);
    if (nextErrors.name) return toast.error(`Por favor, informe o nome do ${terms.patient_label.toLowerCase()}.`);
    if (nextErrors.species) return toast.error('Selecione a espécie do paciente.');
    if (nextErrors.breed) return toast.error('Informe a raça do paciente (use "SRD" se não tiver raça definida).');

    setSaving(true);
    try {
      const dataToSave = {
        name: formData.name.trim(),
        scope: isHuman ? 'HUMAN' : 'VET',
        species: isHuman ? 'human' : formData.species,
        breed: isHuman ? '' : formData.breed.trim(),
        sex: formData.sex || 'male',
        neutered: formData.neutered || 'unknown',
        size: formData.size || 'medium',
        owner_name: formData.owner_name || '',
        ownerPhone: formData.ownerPhone || '',
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_year: formData.birth_year ? String(formData.birth_year) : null,
        ...(patient?.birth_date ? { birth_date: patient.birth_date } : {})
      };

      const saved = patient
        ? await db.updatePatient(patient.id, dataToSave)
        : await db.createPatient(dataToSave);
      toast.success(patient ? 'Paciente atualizado!' : 'Paciente cadastrado!');
      onSuccess(saved, { startUltrasound });
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast.error(`Erro ao salvar paciente: ${error.message || 'Verifique os campos.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAgeChange = (val) => {
    setAge(val);
    updateField('birth_year', val && !isNaN(val) ? String(currentYear - parseInt(val)) : '');
  };

  const errorRing = (field) => errors[field] && 'border-destructive focus-visible:ring-destructive';

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(false); }} className="space-y-5" noValidate data-testid="patient-form">
      <div className="grid grid-cols-2 gap-4">
        <Field id="name" label={`Nome do ${terms.patient_label} *`} strong>
          <Input data-testid="patient-form-name" id="name" autoFocus aria-invalid={!!errors.name} className={cn(errorRing('name'))} value={formData.name} onChange={e => updateField('name', e.target.value)} />
        </Field>
        {!isHuman && (
          <Field id="species" label={`${terms.species_label} *`} strong>
            <Select value={formData.species} onValueChange={val => updateField('species', val)}>
              <SelectTrigger data-testid="patient-form-species" id="species" aria-invalid={!!errors.species} className={cn(errorRing('species'))}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {terms.species_options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>

      {!isHuman && (
        <div className="grid grid-cols-3 gap-4">
          <Field id="breed" label={`${terms.breed_label} *`} strong>
            <Input data-testid="patient-form-breed" id="breed" aria-invalid={!!errors.breed} className={cn(errorRing('breed'))} placeholder="Ex: SRD, Labrador" value={formData.breed} onChange={e => updateField('breed', e.target.value)} />
          </Field>
          <Field id="weight" label={terms.weight_label} strong>
            <Input data-testid="patient-form-weight" id="weight" type="number" step="0.01" placeholder="0,0" value={formData.weight} onChange={e => updateField('weight', e.target.value)} />
          </Field>
          <Field id="size" label="Porte">
            <Select value={formData.size} onValueChange={val => updateField('size', val)}>
              <SelectTrigger data-testid="patient-form-size" id="size"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Field id="sex" label={terms.sex_label} strong>
          <Select value={formData.sex} onValueChange={val => updateField('sex', val)}>
            <SelectTrigger data-testid="patient-form-sex" id="sex"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{terms.sex_male}</SelectItem>
              <SelectItem value="female">{terms.sex_female}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {!isHuman && (
          <Field id="neutered" label={terms.neutered_label} strong>
            <Select value={formData.neutered} onValueChange={val => updateField('neutered', val)}>
              <SelectTrigger data-testid="patient-form-neutered" id="neutered"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{terms.neutered_yes}</SelectItem>
                <SelectItem value="no">{terms.neutered_no}</SelectItem>
                <SelectItem value="unknown">{terms.neutered_unknown}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field id="age_calc" label={`${terms.age_label} (anos)`}>
          <Input data-testid="patient-form-age" id="age_calc" type="number" placeholder="Ex: 5" value={age} onChange={e => handleAgeChange(e.target.value)} />
        </Field>
        <Field id="birth_year" label="Ano Nasc.">
          <Input data-testid="patient-form-birth-year" id="birth_year" type="number" placeholder="Ex: 2020" value={formData.birth_year} onChange={e => {
            updateField('birth_year', e.target.value);
            if (e.target.value.length === 4) setAge(String(currentYear - parseInt(e.target.value)));
          }} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4">
        <Field id="owner_name" label={terms.owner_label} strong>
          <Input data-testid="patient-form-owner" id="owner_name" value={formData.owner_name} onChange={e => updateField('owner_name', e.target.value)} />
        </Field>
        <Field id="ownerPhone" label={`Telefone do ${terms.owner_label}`}>
          <Input data-testid="patient-form-phone" id="ownerPhone" value={formData.ownerPhone} onChange={e => updateField('ownerPhone', e.target.value)} placeholder="(00) 00000-0000" />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button data-testid="patient-form-cancel" type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button data-testid="patient-form-save" type="submit" variant="outline" disabled={saving}>Salvar</Button>
        {!isHuman && (
          <Button data-testid="patient-form-save-start-ultrasound" type="button" disabled={saving} onClick={() => save(true)}>
            <Activity className="h-4 w-4 mr-2" /> Salvar e iniciar Ultrassom
          </Button>
        )}
      </div>
    </form>
  );
}
