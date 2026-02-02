import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, FileText, Pill, Dog, Cat, HelpCircle, User, Trash2, MoreVertical, FlaskConical, Eye } from 'lucide-react';
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

export function PatientCard({ patient, onUpdate }) {
  const { terms, practice, hasModule } = useLicense();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const ageLabel = useMemo(() => calcAgeLabel(patient), [patient]);

  // Ícone Dinâmico
  let SpeciesIcon = HelpCircle;
  if (patient?.species === 'cat') SpeciesIcon = Cat;
  else if (patient?.species === 'dog') SpeciesIcon = Dog;
  else if (practice === 'human') SpeciesIcon = User;

  const canUsePrescription = hasModule?.('prescription');

  const openHistory = () => {
    navigate(`/history/${patient.id}`);
  };

  const createNewExam = async (examType) => {
    try {
      setBusy(true);
      const newExam = await db.createExam({ patient_id: patient.id, exam_weight: patient.weight, exam_type: examType });
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
    <TooltipProvider>
      <Card className="rounded-xl shadow-sm border border-border/60 hover:shadow-md hover:border-primary/30 transition-all duration-300 bg-background overflow-hidden" data-testid={`patient-card-${patient.id}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <SpeciesIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold leading-tight truncate" title={patient.name} data-testid={`patient-card-name-${patient.id}`}>
                {patient.name}
              </CardTitle>
              <div className="mt-1 text-xs text-muted-foreground truncate" data-testid={`patient-card-subtitle-${patient.id}`}>
                {practice === 'vet' ? (patient.breed || '--') : 'Paciente'}
                {' • '}
                {terms.owner_label}: {patient.owner_name || '--'}
                {' • '}
                Idade: {ageLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid={`patient-card-history-button-${patient.id}`}
                  onClick={openHistory}
                  variant="secondary"
                  className="h-9"
                >
                  <FileText className="h-4 w-4 mr-2" /> Prontuário
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir prontuário/histórico</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid={`patient-card-menu-button-${patient.id}`}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      data-testid={`patient-card-delete-button-${patient.id}`}
                      onSelect={(e) => e.preventDefault()}
                      onClick={(e) => e.stopPropagation()}
                      className="text-destructive focus:text-destructive cursor-pointer"
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
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          {/* Ações clínicas */}
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-testid={`patient-card-new-exam-button-${patient.id}`}
                      className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={busy}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Novo Exame
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {getAllExamTypes().map((type) => (
                      <DropdownMenuItem
                        key={type.id}
                        onClick={() => createNewExam(type.id)}
                        className="cursor-pointer gap-2 py-2"
                        data-testid={`patient-card-new-exam-${patient.id}-${type.id}`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Criar novo exame</TooltipContent>
            </Tooltip>


            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid={`patient-card-prescription-button-${patient.id}`}
                  onClick={() => navigate(`/prescription/new/${patient.id}`)}
                  className="h-9 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!canUsePrescription}
                >
                  <Pill className="h-4 w-4 mr-2" /> Receita
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {canUsePrescription ? 'Nova receita' : 'Módulo de prescrição não habilitado na licença'}
              </TooltipContent>
            </Tooltip>

            {practice === 'human' && hasModule?.('ophthalmo_human') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-testid={`patient-card-ophthalmo-button-${patient.id}`}
                    onClick={() => navigate(`/ophthalmo?patientId=${patient.id}`)}
                    className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Oftalmo
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Novo exame oftalmológico</TooltipContent>
              </Tooltip>
            )}

            {practice === 'vet' && hasModule?.('lab_vet') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-testid={`patient-card-lab-button-${patient.id}`}
                    onClick={() => navigate(`/lab?patientId=${patient.id}`)}
                    className="h-9 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FlaskConical className="h-4 w-4 mr-2" /> Lab
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Novo exame laboratorial</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Info extra compacta */}
          <div className="text-xs text-muted-foreground" data-testid={`patient-card-vitals-${patient.id}`}>
            {practice === 'vet' && patient.weight ? `Peso: ${patient.weight}kg` : null}
          </div>
        </div>
      </CardContent>
      </Card>
    </TooltipProvider>
  );
}
