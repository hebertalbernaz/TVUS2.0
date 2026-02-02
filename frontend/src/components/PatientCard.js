import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Stethoscope,
  FileText,
  Pill,
  Dog,
  Cat,
  User,
  Trash2,
  MoreVertical,
  FlaskConical,
  Eye,
  Edit,
  ClipboardList,
  FileCheck,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { useLicense } from '../contexts/LicenseContext';
import { getAllExamTypes } from '@/lib/exam_types';
import { db } from '@/services/database';

const calcAgeLabel = (patient) => {
  try {
    const now = new Date();

    if (patient?.birth_date) {
      const b = new Date(patient.birth_date);
      const years = now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
      if (years <= 0) {
        const months = Math.max(0, (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth()));
        return months > 0 ? `${months}m` : '--';
      }
      return `${years}a`;
    }

    if (patient?.birth_year) {
      const y = Number(patient.birth_year);
      if (!Number.isNaN(y)) {
        const years = now.getFullYear() - y;
        return years > 0 ? `${years}a` : '--';
      }
    }

    return '--';
  } catch (e) {
    return '--';
  }
};

const formatSpecies = (species, practice) => {
  if (practice === 'human') return 'Humano';
  const map = { dog: 'Canino', cat: 'Felino', other: 'Outro' };
  return map[species] || species || '--';
};

const formatSex = (sex) => {
  const map = { male: 'Macho', female: 'Fêmea', M: 'Masculino', F: 'Feminino' };
  return map[sex] || sex || '--';
};

export function PatientCard({ patient, onUpdate }) {
  const { terms, practice, hasModule } = useLicense();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const ageLabel = useMemo(() => calcAgeLabel(patient), [patient]);

  // Ícone e cor dinâmicos por espécie
  let SpeciesIcon = User;
  let iconColor = 'text-slate-600 bg-slate-100';

  if (patient?.species === 'cat') {
    SpeciesIcon = Cat;
    iconColor = 'text-amber-600 bg-amber-100';
  } else if (patient?.species === 'dog') {
    SpeciesIcon = Dog;
    iconColor = 'text-blue-600 bg-blue-100';
  } else if (practice === 'human') {
    SpeciesIcon = User;
    iconColor = 'text-emerald-600 bg-emerald-100';
  }

  const canUsePrescription = hasModule?.('prescription');
  const canUseOphthalmo = practice === 'human' && hasModule?.('ophthalmo_human');
  const canUseLab = practice === 'vet' && hasModule?.('lab_vet');

  const openHistory = () => {
    navigate(`/history/${patient.id}`);
  };

  const createNewExam = async (examType) => {
    try {
      setBusy(true);
      const newExam = await db.createExam({
        patient_id: patient.id,
        exam_weight: patient.weight,
        exam_type: examType
      });
      toast.success('Exame criado!');
      navigate(`/exam/${newExam.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar exame');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      setBusy(true);
      await db.deletePatient(patient.id);
      toast.success('Paciente excluído com sucesso');
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao excluir paciente');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/40"
      data-testid={`patient-card-${patient.id}`}
    >
      {/* HEADER: Avatar + Name + Badges | Menu */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-3 rounded-xl ${iconColor} flex-shrink-0 shadow-sm`}>
              <SpeciesIcon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="text-lg font-bold text-foreground truncate leading-tight mb-1"
                title={patient.name}
                data-testid={`patient-card-name-${patient.id}`}
              >
                {patient.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {formatSpecies(patient.species, practice)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatSex(patient.sex)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {ageLabel}
                </Badge>
                {practice === 'vet' && patient.breed && (
                  <Badge variant="outline" className="text-xs">
                    {patient.breed}
                  </Badge>
                )}
                {practice === 'vet' && patient.weight && (
                  <Badge variant="outline" className="text-xs">
                    {patient.weight}kg
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`patient-card-menu-button-${patient.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => toast.info('Edição em desenvolvimento')}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar paciente
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    data-testid={`patient-card-delete-button-${patient.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir paciente
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir <strong>{patient.name}</strong>?
                      Esta ação não pode ser desfeita e todos os exames e histórico serão removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* CONTENT: Owner and secondary info */}
      <CardContent className="pb-4">
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">{terms.owner_label}:</span>
            <span className="text-foreground truncate ml-2" data-testid={`patient-card-owner-${patient.id}`}>
              {patient.owner_name || '--'}
            </span>
          </div>

          {patient.ownerPhone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Contato:</span>
              <span className="text-foreground">{patient.ownerPhone}</span>
            </div>
          )}
        </div>
      </CardContent>

      <Separator />

      {/* FOOTER: Primary actions */}
      <CardFooter className="pt-4 pb-4 flex flex-wrap gap-2">
        {/* Primary: Iniciar Atendimento */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              disabled={busy}
              data-testid={`patient-card-start-care-button-${patient.id}`}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Iniciar Atendimento
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {/* Section 1: Diagnóstico (Exams) */}
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Diagnóstico
            </DropdownMenuLabel>
            {getAllExamTypes().map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => createNewExam(type.id)}
                className="cursor-pointer gap-2 py-2"
                data-testid={`patient-card-exam-${patient.id}-${type.id}`}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </DropdownMenuItem>
            ))}

            {/* Ophthalmo (if human practice) */}
            {canUseOphthalmo && (
              <DropdownMenuItem
                onClick={() => navigate(`/ophthalmo?patientId=${patient.id}`)}
                className="cursor-pointer gap-2 py-2"
                data-testid={`patient-card-ophthalmo-${patient.id}`}
              >
                <Eye className="h-4 w-4" />
                <span className="font-medium">Oftalmologia</span>
              </DropdownMenuItem>
            )}

            {/* Lab (if vet practice) */}
            {canUseLab && (
              <DropdownMenuItem
                onClick={() => navigate(`/lab?patientId=${patient.id}`)}
                className="cursor-pointer gap-2 py-2"
                data-testid={`patient-card-lab-${patient.id}`}
              >
                <FlaskConical className="h-4 w-4" />
                <span className="font-medium">Exame Laboratorial</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Section 2: Clínica */}
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Clínica
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigate(`/prescription/new/${patient.id}`)}
              disabled={!canUsePrescription}
              className="cursor-pointer gap-2 py-2"
              data-testid={`patient-card-prescription-${patient.id}`}
            >
              <Pill className="h-4 w-4" />
              <span className="font-medium">Nova Receita</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.info('Anamnese: funcionalidade em desenvolvimento')}
              className="cursor-pointer gap-2 py-2"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="font-medium">Anamnese</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toast.info('Atestado: funcionalidade em desenvolvimento')}
              className="cursor-pointer gap-2 py-2"
            >
              <FileCheck className="h-4 w-4" />
              <span className="font-medium">Atestado</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Section 3: Arquivos */}
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Arquivos
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => toast.info('Anexar documento: funcionalidade em desenvolvimento')}
              className="cursor-pointer gap-2 py-2"
            >
              <Paperclip className="h-4 w-4" />
              <span className="font-medium">Anexar Documento</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Secondary: Prontuário/History */}
        <Button
          variant="outline"
          onClick={openHistory}
          className="shadow-sm"
          data-testid={`patient-card-history-button-${patient.id}`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Prontuário
        </Button>
      </CardFooter>
    </Card>
  );
}
