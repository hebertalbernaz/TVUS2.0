import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { db } from '@/services/database';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Copy,
  MessageCircle,
  FileText,
  Clipboard,
  Stethoscope,
  Activity,
  CheckCircle,
  Heart,
  Utensils,
  Droplets,
  Brain,
  Brush,
  Eye,
  Plus,
  X,
  Thermometer
} from 'lucide-react';
import { ANAMNESIS_TAGS, TAB_CONFIG } from './anamnesis_tags';

const ICON_MAP = {
  MessageCircle,
  FileText,
  Clipboard,
  Stethoscope,
  Activity,
  CheckCircle,
  Heart,
  Utensils,
  Droplets,
  Brain,
  Brush,
  Eye
};

function QuickChips({ tags, onSelect, selectedField }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {tags.map((tag, idx) => (
        <Badge
          key={idx}
          variant="outline"
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1 px-2"
          onClick={() => onSelect(tag.text)}
        >
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}

function SmartTextarea({ label, value, onChange, tags, placeholder, rows = 4 }) {
  const handleChipClick = (text) => {
    onChange((value || '') + text);
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      {tags && <QuickChips tags={tags} onSelect={handleChipClick} />}
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none"
      />
    </div>
  );
}

export default function AnamnesisEditor() {
  const navigate = useNavigate();
  const { patientId, anamnesisId } = useParams();
  const isEditMode = !!anamnesisId;

  const [patient, setPatient] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('complaint');

  const [formData, setFormData] = useState({
    chief_complaint: '',
    history_current_illness: '',
    physiological_data: {
      feeding: '',
      feeding_type: '',
      appetite: '',
      water_intake: '',
      vaccine_status: '',
      deworming_status: '',
      environment: '',
      contact_animals: '',
      reproductive_status: '',
      last_heat: '',
      previous_diseases: '',
      previous_surgeries: '',
      current_medications: '',
      allergies: ''
    },
    systems_review: {
      digestive: '',
      cardio_resp: '',
      genitourinary: '',
      neuro_locomotor: '',
      tegumentary: '',
      eyes_ears: '',
      lymphatic: ''
    },
    physical_exam: {
      general_state: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      weight: '',
      hydration: '',
      mucous_membranes: '',
      capillary_refill: '',
      lymph_nodes: '',
      body_condition_score: '',
      observations: ''
    },
    diagnosis_hypothesis: [],
    treatment_plan: '',
    additional_exams: '',
    prognosis: '',
    notes: '',
    doctor_name: ''
  });

  const [newDiagnosis, setNewDiagnosis] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s] = await Promise.all([
          db.getPatient(patientId),
          db.getSettings()
        ]);

        setPatient(p);
        setSettings(s);

        if (isEditMode) {
          const existing = await db.getAnamnesisById(anamnesisId);
          if (existing) {
            setFormData({
              chief_complaint: existing.chief_complaint || existing.main_complaint || '',
              history_current_illness: existing.history_current_illness || existing.history || '',
              physiological_data: existing.physiological_data || existing.general_data || {},
              systems_review: existing.systems_review || {},
              physical_exam: existing.physical_exam || {},
              diagnosis_hypothesis: existing.diagnosis_hypothesis || [],
              treatment_plan: existing.treatment_plan || existing.conduct || '',
              additional_exams: existing.additional_exams || '',
              prognosis: existing.prognosis || '',
              notes: existing.notes || '',
              doctor_name: existing.doctor_name || s?.veterinarian_name || ''
            });
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            doctor_name: s?.veterinarian_name || '',
            physical_exam: {
              ...prev.physical_exam,
              weight: p?.weight || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [patientId, anamnesisId, isEditMode]);

  const handleCopyPrevious = async () => {
    try {
      const latest = await db.getLatestAnamnesis(patientId);
      if (latest) {
        setFormData({
          chief_complaint: latest.chief_complaint || latest.main_complaint || '',
          history_current_illness: latest.history_current_illness || latest.history || '',
          physiological_data: latest.physiological_data || latest.general_data || {},
          systems_review: latest.systems_review || {},
          physical_exam: {
            ...latest.physical_exam,
            temperature: '',
            heart_rate: '',
            respiratory_rate: ''
          },
          diagnosis_hypothesis: [],
          treatment_plan: '',
          additional_exams: '',
          prognosis: '',
          notes: '',
          doctor_name: settings?.veterinarian_name || ''
        });
        toast.success('Dados da última anamnese copiados');
      } else {
        toast.info('Nenhuma anamnese anterior encontrada');
      }
    } catch (error) {
      toast.error('Erro ao copiar anamnese anterior');
    }
  };

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedField = useCallback((parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  }, []);

  const addDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setFormData((prev) => ({
        ...prev,
        diagnosis_hypothesis: [...prev.diagnosis_hypothesis, newDiagnosis.trim()]
      }));
      setNewDiagnosis('');
    }
  };

  const removeDiagnosis = (index) => {
    setFormData((prev) => ({
      ...prev,
      diagnosis_hypothesis: prev.diagnosis_hypothesis.filter((_, i) => i !== index)
    }));
  };

  const addDiagnosisFromChip = (text) => {
    if (!formData.diagnosis_hypothesis.includes(text)) {
      setFormData((prev) => ({
        ...prev,
        diagnosis_hypothesis: [...prev.diagnosis_hypothesis, text]
      }));
    }
  };

  const handleSave = async (status = 'draft') => {
    try {
      setSaving(true);
      const type = patient?.scope === 'HUMAN' ? 'human' : 'vet';

      const payload = {
        patient_id: patientId,
        type,
        ...formData,
        status
      };

      if (isEditMode) {
        await db.updateAnamnesis(anamnesisId, payload);
        toast.success('Anamnese atualizada');
      } else {
        await db.createAnamnesis(payload);
        toast.success('Anamnese salva');
      }

      navigate(`/history/${patientId}`);
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      toast.error('Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/history/${patientId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-primary">
              {isEditMode ? 'Editar Anamnese' : 'Nova Anamnese'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {patient.name} - {patient.species === 'dog' ? 'Canino' : patient.species === 'cat' ? 'Felino' : patient.species}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode && (
            <Button variant="outline" size="sm" onClick={handleCopyPrevious}>
              <Copy className="h-4 w-4 mr-2" />
              Repetir Última
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            Salvar Rascunho
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave('finalized')}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-muted/30 p-3">
              <div className="space-y-1">
                {TAB_CONFIG.map((tab) => {
                  const Icon = ICON_MAP[tab.icon] || Activity;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-2 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Profissional
                </Label>
                <Input
                  value={formData.doctor_name}
                  onChange={(e) => updateField('doctor_name', e.target.value)}
                  placeholder="Nome do profissional"
                  className="text-sm"
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={80}>
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {activeTab === 'complaint' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Queixa Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SmartTextarea
                        label="Motivo da consulta"
                        value={formData.chief_complaint}
                        onChange={(v) => updateField('chief_complaint', v)}
                        tags={ANAMNESIS_TAGS.chief_complaint}
                        placeholder="Descreva a queixa principal do paciente..."
                        rows={6}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'history' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        Historia da Molestia Atual (HMA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SmartTextarea
                        label="Descreva o historico da doenca atual"
                        value={formData.history_current_illness}
                        onChange={(v) => updateField('history_current_illness', v)}
                        placeholder="Quando comecou, evolucao, tratamentos anteriores..."
                        rows={8}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'physiological' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clipboard className="h-5 w-5 text-primary" />
                        Dados Fisiologicos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartTextarea
                          label="Alimentacao"
                          value={formData.physiological_data.feeding}
                          onChange={(v) => updateNestedField('physiological_data', 'feeding', v)}
                          tags={ANAMNESIS_TAGS.feeding}
                          rows={2}
                        />
                        <SmartTextarea
                          label="Apetite"
                          value={formData.physiological_data.appetite}
                          onChange={(v) => updateNestedField('physiological_data', 'appetite', v)}
                          tags={ANAMNESIS_TAGS.appetite}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartTextarea
                          label="Vacinacao"
                          value={formData.physiological_data.vaccine_status}
                          onChange={(v) => updateNestedField('physiological_data', 'vaccine_status', v)}
                          tags={ANAMNESIS_TAGS.vaccine_status}
                          rows={2}
                        />
                        <SmartTextarea
                          label="Ambiente"
                          value={formData.physiological_data.environment}
                          onChange={(v) => updateNestedField('physiological_data', 'environment', v)}
                          tags={ANAMNESIS_TAGS.environment}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Contato com outros animais</Label>
                          <Textarea
                            value={formData.physiological_data.contact_animals || ''}
                            onChange={(e) => updateNestedField('physiological_data', 'contact_animals', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Doencas anteriores</Label>
                          <Textarea
                            value={formData.physiological_data.previous_diseases || ''}
                            onChange={(e) => updateNestedField('physiological_data', 'previous_diseases', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Medicacoes em uso</Label>
                          <Textarea
                            value={formData.physiological_data.current_medications || ''}
                            onChange={(e) => updateNestedField('physiological_data', 'current_medications', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Alergias conhecidas</Label>
                          <Textarea
                            value={formData.physiological_data.allergies || ''}
                            onChange={(e) => updateNestedField('physiological_data', 'allergies', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'systems' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Stethoscope className="h-5 w-5 text-primary" />
                          Revisao por Sistemas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Utensils className="h-4 w-4 text-orange-500" />
                              Sistema Digestorio
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.digestive}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'digestive',
                                  (formData.systems_review.digestive || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.digestive || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'digestive', e.target.value)
                              }
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Heart className="h-4 w-4 text-red-500" />
                              Sistema Cardiorrespiratorio
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.cardio_resp}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'cardio_resp',
                                  (formData.systems_review.cardio_resp || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.cardio_resp || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'cardio_resp', e.target.value)
                              }
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              Sistema Genitourinario
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.genitourinary}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'genitourinary',
                                  (formData.systems_review.genitourinary || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.genitourinary || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'genitourinary', e.target.value)
                              }
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Brain className="h-4 w-4 text-purple-500" />
                              Sistema Neuro-Locomotor
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.neuro_locomotor}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'neuro_locomotor',
                                  (formData.systems_review.neuro_locomotor || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.neuro_locomotor || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'neuro_locomotor', e.target.value)
                              }
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Brush className="h-4 w-4 text-amber-600" />
                              Sistema Tegumentar
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.tegumentary}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'tegumentary',
                                  (formData.systems_review.tegumentary || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.tegumentary || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'tegumentary', e.target.value)
                              }
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Eye className="h-4 w-4 text-teal-500" />
                              Olhos e Ouvidos
                            </div>
                            <QuickChips
                              tags={ANAMNESIS_TAGS.eyes_ears}
                              onSelect={(text) =>
                                updateNestedField(
                                  'systems_review',
                                  'eyes_ears',
                                  (formData.systems_review.eyes_ears || '') + text
                                )
                              }
                            />
                            <Textarea
                              value={formData.systems_review.eyes_ears || ''}
                              onChange={(e) =>
                                updateNestedField('systems_review', 'eyes_ears', e.target.value)
                              }
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Activity className="h-4 w-4 text-green-500" />
                            Sistema Linfatico
                          </div>
                          <QuickChips
                            tags={ANAMNESIS_TAGS.lymphatic}
                            onSelect={(text) =>
                              updateNestedField(
                                'systems_review',
                                'lymphatic',
                                (formData.systems_review.lymphatic || '') + text
                              )
                            }
                          />
                          <Textarea
                            value={formData.systems_review.lymphatic || ''}
                            onChange={(e) =>
                              updateNestedField('systems_review', 'lymphatic', e.target.value)
                            }
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'physical' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-primary" />
                        Exame Fisico
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            Temperatura (C)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.physical_exam.temperature || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'temperature', e.target.value)
                            }
                            placeholder="38.5"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            FC (bpm)
                          </Label>
                          <Input
                            type="number"
                            value={formData.physical_exam.heart_rate || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'heart_rate', e.target.value)
                            }
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <Label>FR (mpm)</Label>
                          <Input
                            type="number"
                            value={formData.physical_exam.respiratory_rate || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'respiratory_rate', e.target.value)
                            }
                            placeholder="20"
                          />
                        </div>
                        <div>
                          <Label>Peso (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.physical_exam.weight || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'weight', e.target.value)
                            }
                            placeholder="10.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartTextarea
                          label="Estado Geral"
                          value={formData.physical_exam.general_state}
                          onChange={(v) => updateNestedField('physical_exam', 'general_state', v)}
                          tags={ANAMNESIS_TAGS.general_state}
                          rows={2}
                        />
                        <SmartTextarea
                          label="Hidratacao"
                          value={formData.physical_exam.hydration}
                          onChange={(v) => updateNestedField('physical_exam', 'hydration', v)}
                          tags={ANAMNESIS_TAGS.hydration}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartTextarea
                          label="Mucosas"
                          value={formData.physical_exam.mucous_membranes}
                          onChange={(v) => updateNestedField('physical_exam', 'mucous_membranes', v)}
                          tags={ANAMNESIS_TAGS.mucous}
                          rows={2}
                        />
                        <div>
                          <Label>TPC (seg)</Label>
                          <Input
                            value={formData.physical_exam.capillary_refill || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'capillary_refill', e.target.value)
                            }
                            placeholder="< 2 segundos"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Linfonodos</Label>
                          <Textarea
                            value={formData.physical_exam.lymph_nodes || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'lymph_nodes', e.target.value)
                            }
                            rows={2}
                            placeholder="Palpaveis, tamanho, consistencia..."
                          />
                        </div>
                        <div>
                          <Label>ECC (1-9)</Label>
                          <Input
                            value={formData.physical_exam.body_condition_score || ''}
                            onChange={(e) =>
                              updateNestedField('physical_exam', 'body_condition_score', e.target.value)
                            }
                            placeholder="5/9"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Observacoes do Exame Fisico</Label>
                        <Textarea
                          value={formData.physical_exam.observations || ''}
                          onChange={(e) =>
                            updateNestedField('physical_exam', 'observations', e.target.value)
                          }
                          rows={4}
                          placeholder="Outras observacoes relevantes..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'diagnosis' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          Hipoteses Diagnosticas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm mb-2 block">Diagnosticos comuns (clique para adicionar)</Label>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {ANAMNESIS_TAGS.diagnosis_common.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => addDiagnosisFromChip(tag.text)}
                              >
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={newDiagnosis}
                            onChange={(e) => setNewDiagnosis(e.target.value)}
                            placeholder="Adicionar hipotese diagnostica..."
                            onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                          />
                          <Button onClick={addDiagnosis} size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {formData.diagnosis_hypothesis.length > 0 && (
                          <div className="space-y-2">
                            <Label>Hipoteses selecionadas:</Label>
                            <div className="flex flex-wrap gap-2">
                              {formData.diagnosis_hypothesis.map((diag, idx) => (
                                <Badge key={idx} variant="secondary" className="py-1.5 px-3">
                                  {diag}
                                  <button
                                    onClick={() => removeDiagnosis(idx)}
                                    className="ml-2 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Plano Terapeutico</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Tratamento proposto</Label>
                          <Textarea
                            value={formData.treatment_plan}
                            onChange={(e) => updateField('treatment_plan', e.target.value)}
                            rows={4}
                            placeholder="Descreva o plano de tratamento..."
                          />
                        </div>

                        <div>
                          <Label>Exames complementares solicitados</Label>
                          <Textarea
                            value={formData.additional_exams}
                            onChange={(e) => updateField('additional_exams', e.target.value)}
                            rows={2}
                            placeholder="Hemograma, US abdominal, RX..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Prognostico</Label>
                            <Textarea
                              value={formData.prognosis}
                              onChange={(e) => updateField('prognosis', e.target.value)}
                              rows={2}
                              placeholder="Favoravel, reservado, desfavoravel..."
                            />
                          </div>
                          <div>
                            <Label>Observacoes gerais</Label>
                            <Textarea
                              value={formData.notes}
                              onChange={(e) => updateField('notes', e.target.value)}
                              rows={2}
                              placeholder="Outras observacoes..."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
