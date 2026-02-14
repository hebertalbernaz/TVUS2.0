import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { db } from '@/services/database';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  FileCheck,
  FileText,
  ChevronDown,
  Dog,
  Cat,
  User,
  Weight,
  Calendar,
  Heart
} from 'lucide-react';

// ─── TEMPLATES VETERINÁRIOS ───
const VET_TEMPLATES = [
  {
    id: 'vet_health_cert',
    label: 'Atestado de Saude Animal',
    content: (p, d) => `ATESTADO DE SAUDE ANIMAL

Atesto para os devidos fins que o animal abaixo descrito encontra-se clinicamente saudavel na presente data, apto para [viagem / exposicao / competicao / adocao].

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}

EXAME CLINICO
Estado geral: Bom
Mucosas: Normocoradas
Hidratacao: Adequada
Temperatura: _____ C
Frequencia Cardiaca: _____ bpm
Frequencia Respiratoria: _____ mpm

OBSERVACOES:
_____________________________________________

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico Veterinario]'}
CRMV: _______________`
  },
  {
    id: 'vet_death_cert',
    label: 'Atestado de Obito Animal',
    content: (p, d) => `ATESTADO DE OBITO ANIMAL

Atesto para os devidos fins que o animal abaixo identificado veio a obito nesta data.

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}
Proprietario: ${p?.owner_name || '[Nome do Proprietario]'}

CAUSA MORTIS (provavel):
_____________________________________________

HISTORICO CLINICO RESUMIDO:
_____________________________________________

Data do Obito: ___/___/______ Hora: ___:___
Local: _______________________________________________

_____________________________________________
${d || '[Nome do Medico Veterinario]'}
CRMV: _______________`
  },
  {
    id: 'vet_surgical_referral',
    label: 'Encaminhamento Cirurgico',
    content: (p, d) => `ENCAMINHAMENTO CIRURGICO VETERINARIO

Prezado(a) Colega,

Encaminho para avaliacao e conduta cirurgica o paciente abaixo:

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}

DIAGNOSTICO:
_____________________________________________

EXAMES REALIZADOS:
_____________________________________________

MEDICACOES EM USO:
_____________________________________________

OBSERVACOES CLINICAS:
_____________________________________________

Desde ja agradeco a atencao.

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico Veterinario]'}
CRMV: _______________`
  },
  {
    id: 'vet_anamnesis',
    label: 'Anamnese Veterinaria Padrao',
    content: (p, d) => `ANAMNESE VETERINARIA

Data: ___/___/______
Profissional: ${d || '[Nome do Medico Veterinario]'}

IDENTIFICACAO DO PACIENTE
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}

1. QUEIXA PRINCIPAL:
_____________________________________________

2. HISTORICO DA MOLESTIA ATUAL:
_____________________________________________

3. HISTORICO PREGRESSO:
Vacinacao: ________________________
Vermifugacao: _____________________
Alimentacao: ______________________
Ambiente: _________________________
Doencas anteriores: _______________

4. EXAME FISICO:
Estado geral: _____________________
Temperatura: ______ C
FC: ______ bpm | FR: ______ mpm
Mucosas: __________________________
Hidratacao: _______________________
Linfonodos: _______________________

5. HIPOTESE DIAGNOSTICA:
_____________________________________________

6. CONDUTA / TRATAMENTO:
_____________________________________________`
  },
  {
    id: 'vet_clinical_report',
    label: 'Laudo Clinico Veterinario',
    content: (p, d) => `LAUDO CLINICO VETERINARIO

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}
Proprietario: ${p?.owner_name || '[Nome do Proprietario]'}

HISTORICO CLINICO:
_____________________________________________

EXAME FISICO:
_____________________________________________

EXAMES COMPLEMENTARES:
_____________________________________________

DIAGNOSTICO:
_____________________________________________

PROGNOSTICO:
_____________________________________________

TRATAMENTO INSTITUIDO:
_____________________________________________

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico Veterinario]'}
CRMV: _______________`
  },
  {
    id: 'vet_surgery_auth',
    label: 'Autorizacao Cirurgica',
    content: (p, d) => `TERMO DE AUTORIZACAO PARA PROCEDIMENTO CIRURGICO

Eu, _________________________________, portador(a) do CPF _______________, proprietario(a) do animal abaixo identificado, AUTORIZO a realizacao do procedimento cirurgico descrito.

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}

PROCEDIMENTO: ___________________________________

Declaro que fui devidamente informado(a) sobre:
- Os riscos inerentes ao procedimento cirurgico e anestesico;
- As possiveis complicacoes;
- Os cuidados pos-operatorios necessarios.

Local e Data: ___________________, ___/___/______

___________________________     ___________________________
Proprietario                    ${d || '[Medico Veterinario]'}
                                CRMV: _______________`
  },
  {
    id: 'vet_vaccination',
    label: 'Declaracao de Vacinacao',
    content: (p, d) => `DECLARACAO DE VACINACAO

Declaro para os devidos fins que o animal abaixo identificado recebeu as seguintes vacinas:

IDENTIFICACAO DO ANIMAL
Nome: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'}

VACINAS APLICADAS:
| Data       | Vacina            | Fabricante | Lote    | Validade   |
|------------|-------------------|------------|---------|------------|
| ___/___/__ | _________________ | __________ | _______ | ___/___/__ |
| ___/___/__ | _________________ | __________ | _______ | ___/___/__ |
| ___/___/__ | _________________ | __________ | _______ | ___/___/__ |

Proxima vacinacao prevista: ___/___/______

_____________________________________________
${d || '[Nome do Medico Veterinario]'}
CRMV: _______________`
  }
];

// ─── TEMPLATES MEDICINA HUMANA ───
const HUMAN_TEMPLATES = [
  {
    id: 'human_health_cert',
    label: 'Atestado Medico',
    content: (p, d) => `ATESTADO MEDICO

Atesto para os devidos fins que ${p?.name || '[Nome do Paciente]'} foi atendido(a) em consulta medica nesta data, necessitando de afastamento de suas atividades por ______ dia(s).

CID (se autorizado pelo paciente): ___________

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  },
  {
    id: 'human_death_cert',
    label: 'Declaracao de Obito',
    content: (p, d) => `DECLARACAO DE OBITO

Declaro que ${p?.name || '[Nome do Paciente]'} veio a obito nesta data.

Data do Obito: ___/___/______ Hora: ___:___

CAUSA MORTIS:
Causa imediata: ___________________________________
Causa antecedente: ________________________________
Causa basica: _____________________________________

CONDICOES CONTRIBUINTES:
_____________________________________________

Local: _______________________________________________

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  },
  {
    id: 'human_referral',
    label: 'Encaminhamento para Especialista',
    content: (p, d) => `ENCAMINHAMENTO MEDICO

Prezado(a) Colega,

Encaminho para avaliacao e conduta o(a) paciente abaixo:

IDENTIFICACAO DO PACIENTE
Nome: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}

ESPECIALIDADE SOLICITADA: ________________________

HIPOTESE DIAGNOSTICA:
_____________________________________________

RESUMO CLINICO:
_____________________________________________

EXAMES REALIZADOS:
_____________________________________________

MEDICACOES EM USO:
_____________________________________________

Desde ja agradeco a atencao.

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  },
  {
    id: 'human_anamnesis',
    label: 'Anamnese Clinica Padrao',
    content: (p, d) => `ANAMNESE CLINICA

Data: ___/___/______
Profissional: ${d || '[Nome do Medico]'}

IDENTIFICACAO DO PACIENTE
Nome: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}
Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}

1. QUEIXA PRINCIPAL:
_____________________________________________

2. HISTORIA DA DOENCA ATUAL (HDA):
_____________________________________________

3. ANTECEDENTES PESSOAIS:
Doencas previas: __________________
Cirurgias: ________________________
Alergias: _________________________
Medicamentos em uso: ______________
Habitos: __________________________

4. ANTECEDENTES FAMILIARES:
_____________________________________________

5. EXAME FISICO:
Estado geral: _____________________
PA: _______ mmHg
FC: ______ bpm | FR: ______ mpm
Temperatura: ______ C
Peso: ______ kg | Altura: ______ cm

6. HIPOTESE DIAGNOSTICA:
_____________________________________________

7. CONDUTA:
_____________________________________________`
  },
  {
    id: 'human_clinical_report',
    label: 'Laudo Medico',
    content: (p, d) => `LAUDO MEDICO

IDENTIFICACAO DO PACIENTE
Nome: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}

HISTORICO CLINICO:
_____________________________________________

EXAME FISICO:
_____________________________________________

EXAMES COMPLEMENTARES:
_____________________________________________

DIAGNOSTICO:
_____________________________________________

PROGNOSTICO:
_____________________________________________

TRATAMENTO:
_____________________________________________

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  },
  {
    id: 'human_exam_request',
    label: 'Solicitacao de Exames',
    content: (p, d) => `SOLICITACAO DE EXAMES COMPLEMENTARES

Paciente: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}

HIPOTESE DIAGNOSTICA / CID:
_____________________________________________

EXAMES SOLICITADOS:
[ ] Hemograma completo
[ ] Glicemia de jejum
[ ] Funcao renal (ureia, creatinina)
[ ] Funcao hepatica (TGO, TGP, GGT)
[ ] Perfil lipidico
[ ] TSH / T4 livre
[ ] Urina tipo I
[ ] ___________________________________
[ ] ___________________________________
[ ] ___________________________________

JUSTIFICATIVA CLINICA:
_____________________________________________

Local e Data: ___________________, ___/___/______

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  },
  {
    id: 'human_followup',
    label: 'Relatorio de Acompanhamento',
    content: (p, d) => `RELATORIO DE ACOMPANHAMENTO CLINICO

Paciente: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}

DATA DA CONSULTA: ___/___/______

EVOLUCAO CLINICA:
_____________________________________________

EXAMES RECENTES:
_____________________________________________

AJUSTE TERAPEUTICO:
_____________________________________________

ORIENTACOES AO PACIENTE:
_____________________________________________

RETORNO PROGRAMADO: ___/___/______

_____________________________________________
${d || '[Nome do Medico]'}
CRM: _______________`
  }
];

// ─── ANAMNESIS PRE-LOAD TEMPLATES ───
const ANAMNESIS_PRELOAD = {
  vet: (p, d) => `ANAMNESE VETERINARIA

Data: ${new Date().toLocaleDateString('pt-BR')}
Profissional: ${d || '[Nome do Medico Veterinario]'}
Paciente: ${p?.name || '[Nome do Animal]'}
Especie: ${p?.species === 'dog' ? 'Canina' : p?.species === 'cat' ? 'Felina' : p?.species || '[Especie]'}
Raca: ${p?.breed || '[Raca]'} | Peso: ${p?.weight ? p.weight + ' kg' : '[Peso]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUEIXA PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HISTORICO DA MOLESTIA ATUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAME FISICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado geral:
Temperatura:       C
FC:       bpm
FR:       mpm
Mucosas:
Hidratacao:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIPOTESE DIAGNOSTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`,
  human: (p, d) => `ANAMNESE CLINICA

Data: ${new Date().toLocaleDateString('pt-BR')}
Profissional: ${d || '[Nome do Medico]'}
Paciente: ${p?.name || '[Nome do Paciente]'}
Idade: ${p?.birth_year ? (new Date().getFullYear() - parseInt(p.birth_year)) + ' anos' : '[Idade]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUEIXA PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HISTORIA DA DOENCA ATUAL (HDA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAME FISICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado geral:
PA:          mmHg
FC:       bpm
FR:       mpm
Temperatura:       C

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIPOTESE DIAGNOSTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`
};

// ─── HELPER: calc age label ───
function calcAge(patient) {
  if (!patient) return null;
  const now = new Date();
  if (patient.birth_date) {
    const b = new Date(patient.birth_date);
    const years = now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
    if (years < 1) {
      const months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
      return months <= 0 ? '< 1 mes' : `${months} meses`;
    }
    return `${years} ano${years > 1 ? 's' : ''}`;
  }
  if (patient.birth_year) {
    const years = now.getFullYear() - parseInt(patient.birth_year);
    return years <= 0 ? '< 1 ano' : `${years} ano${years > 1 ? 's' : ''}`;
  }
  return null;
}

function speciesLabel(species) {
  const map = { dog: 'Canino', cat: 'Felino', bird: 'Ave', reptile: 'Reptil', rodent: 'Roedor', horse: 'Equino', rabbit: 'Lagomorfo' };
  return map[species] || species || 'N/I';
}

function SpeciesIcon({ species, className }) {
  if (species === 'dog') return <Dog className={className} />;
  if (species === 'cat') return <Cat className={className} />;
  return <User className={className} />;
}

// ─── PATIENT VITALS HEADER ───
function PatientVitalsHeader({ patient }) {
  if (!patient) return null;
  const isHuman = patient.scope === 'HUMAN';
  const age = calcAge(patient);

  return (
    <div
      data-testid="patient-vitals-header"
      className="flex items-center gap-4 px-5 py-3 rounded-lg border bg-muted/40 mb-4"
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shrink-0">
        {isHuman ? <User className="h-5 w-5" /> : <SpeciesIcon species={patient.species} className="h-5 w-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate" data-testid="vitals-patient-name">
          {patient.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
          {!isHuman && (
            <Badge variant="outline" className="text-xs font-normal" data-testid="vitals-species">
              {speciesLabel(patient.species)}
              {patient.breed ? ` - ${patient.breed}` : ''}
            </Badge>
          )}
          {age && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="vitals-age">
              <Calendar className="h-3 w-3" /> {age}
            </span>
          )}
          {patient.weight && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="vitals-weight">
              <Weight className="h-3 w-3" /> {patient.weight} kg
            </span>
          )}
          {patient.sex && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="vitals-sex">
              <Heart className="h-3 w-3" /> {patient.sex === 'M' ? 'Macho' : patient.sex === 'F' ? 'Femea' : patient.sex}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function ClinicalDocumentEditor() {
  const navigate = useNavigate();
  const { patientId, documentType } = useParams();

  const [patient, setPatient] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    doctor_name: ''
  });

  // Template insertion dialog state
  const [templateDialog, setTemplateDialog] = useState({
    open: false,
    templateContent: '',
    templateLabel: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s] = await Promise.all([
          db.getPatient(patientId),
          db.getSettings()
        ]);

        setPatient(p);
        setSettings(s);

        const doctorName = s?.veterinarian_name || '';
        const isHuman = p?.scope === 'HUMAN';

        if (documentType === 'certificate') {
          setFormData({
            title: isHuman ? 'Atestado Medico' : 'Atestado de Saude Animal',
            content: isHuman
              ? HUMAN_TEMPLATES[0].content(p, doctorName)
              : VET_TEMPLATES[0].content(p, doctorName),
            doctor_name: doctorName
          });
        } else if (documentType === 'anamnesis') {
          const preload = isHuman
            ? ANAMNESIS_PRELOAD.human(p, doctorName)
            : ANAMNESIS_PRELOAD.vet(p, doctorName);
          setFormData({
            title: 'Anamnese Clinica',
            content: preload,
            doctor_name: doctorName
          });
        } else if (documentType === 'referral') {
          setFormData({
            title: 'Encaminhamento',
            content: isHuman
              ? HUMAN_TEMPLATES[2].content(p, doctorName)
              : VET_TEMPLATES[2].content(p, doctorName),
            doctor_name: doctorName
          });
        } else {
          setFormData({
            title: '',
            content: '',
            doctor_name: doctorName
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (patientId && documentType) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [patientId, documentType]);

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast.error('O conteudo nao pode estar vazio');
      return;
    }

    try {
      setSaving(true);

      await db.createClinicalDocument({
        patient_id: patientId,
        type: documentType,
        title: formData.title,
        content: formData.content,
        doctor_name: formData.doctor_name
      });

      toast.success('Documento salvo com sucesso');
      navigate(`/history/${patientId}`);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Erro ao salvar documento');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = (template) => {
    const generatedContent = template.content(patient, formData.doctor_name);

    if (!formData.content.trim()) {
      // Content is empty, just insert directly
      setFormData(prev => ({ ...prev, content: generatedContent }));
      toast.success(`Modelo "${template.label}" inserido`);
    } else {
      // Content exists, ask the user
      setTemplateDialog({
        open: true,
        templateContent: generatedContent,
        templateLabel: template.label
      });
    }
  };

  const handleTemplateReplace = () => {
    setFormData(prev => ({ ...prev, content: templateDialog.templateContent }));
    setTemplateDialog({ open: false, templateContent: '', templateLabel: '' });
    toast.success('Conteudo substituido pelo modelo');
  };

  const handleTemplateAppend = () => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + templateDialog.templateContent
    }));
    setTemplateDialog({ open: false, templateContent: '', templateLabel: '' });
    toast.success('Modelo adicionado ao final');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground" data-testid="loading-state">
        Carregando...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center" data-testid="patient-not-found">
        <p className="text-destructive mb-4">Paciente nao encontrado</p>
        <Button onClick={() => navigate('/')} data-testid="go-back-btn">Voltar</Button>
      </div>
    );
  }

  const documentTypeLabel = {
    certificate: 'Atestado',
    anamnesis: 'Anamnese',
    referral: 'Encaminhamento'
  }[documentType] || 'Documento';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" data-testid="clinical-document-editor">
      <div className="max-w-4xl mx-auto">

        {/* ─── TOP BAR ─── */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/history/${patientId}`)}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="page-title">
                Novo {documentTypeLabel}
              </h1>
              <p className="text-sm text-muted-foreground">
                Paciente: {patient.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/history/${patientId}`)}
              disabled={saving}
              data-testid="cancel-button"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="save-button">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* ─── PATIENT VITALS ─── */}
        <PatientVitalsHeader patient={patient} />

        {/* ─── DOCUMENT META ─── */}
        <Card className="mb-4 border-dashed" data-testid="document-meta-card">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Titulo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titulo do documento"
                  data-testid="document-title-input"
                />
              </div>
              <div>
                <Label htmlFor="doctor_name" className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Profissional</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="Nome do profissional"
                  data-testid="doctor-name-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── TEMPLATE SELECTOR ─── */}
        <div className="flex items-center gap-3 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="insert-template-button">
                <FileText className="h-4 w-4" />
                Inserir Modelo
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider">Modelos Disponíveis</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger data-testid="vet-templates-submenu">
                  <Dog className="h-4 w-4 mr-2" />
                  Medicina Veterinaria
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-64">
                  {VET_TEMPLATES.map((tpl) => (
                    <DropdownMenuItem
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      data-testid={`template-${tpl.id}`}
                    >
                      {tpl.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger data-testid="human-templates-submenu">
                  <User className="h-4 w-4 mr-2" />
                  Medicina Humana
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-64">
                  {HUMAN_TEMPLATES.map((tpl) => (
                    <DropdownMenuItem
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      data-testid={`template-${tpl.id}`}
                    >
                      {tpl.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <span className="text-xs text-muted-foreground" data-testid="char-count">
            {formData.content.length} caracteres
          </span>
        </div>

        {/* ─── A4 PAPER EDITOR ─── */}
        <div
          className="bg-white rounded-sm border border-border/60 mx-auto"
          style={{
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.04)',
            maxWidth: '210mm',
            minHeight: '297mm',
            padding: '20mm 18mm'
          }}
          data-testid="a4-paper-container"
        >
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Digite o conteudo do documento..."
            className="w-full border-none shadow-none focus-visible:ring-0 resize-none p-0 text-foreground placeholder:text-muted-foreground/50"
            style={{
              fontFamily: "'Libre Baskerville', 'Georgia', serif",
              fontSize: '13px',
              lineHeight: '1.85',
              minHeight: 'calc(297mm - 40mm)',
              background: 'transparent',
              color: '#1a1a1a'
            }}
            data-testid="document-content-textarea"
          />
        </div>

        {/* ─── BOTTOM ACTIONS ─── */}
        <div className="flex justify-end gap-2 pt-6 pb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/history/${patientId}`)}
            disabled={saving}
            data-testid="cancel-button-bottom"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} data-testid="save-button-bottom">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Documento'}
          </Button>
        </div>
      </div>

      {/* ─── TEMPLATE INSERT DIALOG ─── */}
      <Dialog
        open={templateDialog.open}
        onOpenChange={(open) => {
          if (!open) setTemplateDialog({ open: false, templateContent: '', templateLabel: '' });
        }}
      >
        <DialogContent data-testid="template-insert-dialog">
          <DialogHeader>
            <DialogTitle>Inserir Modelo</DialogTitle>
            <DialogDescription>
              O editor ja possui conteudo. Como deseja inserir o modelo "{templateDialog.templateLabel}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleTemplateAppend}
              className="flex-1"
              data-testid="template-append-button"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Adicionar ao Final
            </Button>
            <Button
              onClick={handleTemplateReplace}
              className="flex-1"
              data-testid="template-replace-button"
            >
              <FileText className="h-4 w-4 mr-2" />
              Substituir Conteudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
