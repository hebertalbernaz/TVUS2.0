import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, Plus, Save, Printer, Trash2, Search, CheckCircle, Clock,
  ArrowLeft, ChevronRight, Sparkles, FileText, User, Calendar
} from 'lucide-react';
import { getDatabase, genId } from '@/core/database/db';
import { db as dbService } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EyeFundusEditor } from '@/components/ophthalmo/EyeFundusEditor';
import { CampimetryGrid } from '@/components/ophthalmo/CampimetryGrid';

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================
const NORMAL_DEFAULTS = {
  biomicroscopy: {
    lids: 'Sem alterações',
    conjunctiva: 'Calma, sem hiperemia',
    cornea: 'Transparente, sem lesões',
    anterior_chamber: 'Formada, sem células ou flare',
    iris: 'Trófica, sem sinéquias',
    pupil: 'Isocórica, fotorreagente',
    lens: 'Transparente, sem opacidades'
  },
  fundoscopy: {
    vitreous: 'Transparente',
    optic_disc: 'Normocorado, bordas nítidas',
    cup_disc_ratio: '0.3',
    macula: 'Reflexo foveal presente',
    retina: 'Aplicada, sem lesões',
    vessels: 'Relação A/V normal',
    choroid: 'Sem alterações visíveis'
  }
};

const VISUAL_ACUITY_OPTIONS = [
  '20/20', '20/25', '20/30', '20/40', '20/50', '20/60', '20/70', 
  '20/80', '20/100', '20/200', '20/400', 'CD 3m', 'CD 2m', 'CD 1m', 
  'CD 50cm', 'MM', 'PL', 'SPL', 'Não informado'
];

const IOP_METHODS = ['Tonometria de Goldmann', 'Tonometria de Aplanação', 'Tono-Pen', 'iCare', 'Pneumotonômetro'];

// ============================================================================
// EYE FORM COMPONENT (OD or OS)
// ============================================================================
function EyeForm({ eyeKey, eyeLabel, data, onChange, onSetNormal }) {
  const updateField = (section, field, value) => {
    if (section) {
      onChange({
        ...data,
        [section]: {
          ...(data?.[section] || {}),
          [field]: value
        }
      });
    } else {
      onChange({
        ...data,
        [field]: value
      });
    }
  };

  const biomicroscopy = data?.biomicroscopy || {};
  const fundoscopy = data?.fundoscopy || {};

  return (
    <div className="space-y-6">
      {/* Header with Normal Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className={cn("h-5 w-5", eyeKey === 'right_eye' ? "text-blue-500" : "text-green-500")} />
          {eyeLabel}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSetNormal}
          className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
        >
          <Sparkles className="h-4 w-4" /> Normal
        </Button>
      </div>

      {/* Visual Acuity & IOP Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold">Acuidade Visual (s/c)</Label>
          <Select 
            value={data?.visual_acuity || ''} 
            onValueChange={(v) => updateField(null, 'visual_acuity', v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {VISUAL_ACUITY_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold">AV Corrigida (c/c)</Label>
          <Select 
            value={data?.visual_acuity_corrected || ''} 
            onValueChange={(v) => updateField(null, 'visual_acuity_corrected', v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {VISUAL_ACUITY_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold">PIO (mmHg)</Label>
          <Input 
            type="number"
            className="mt-1"
            placeholder="Ex: 14"
            value={data?.iop || ''}
            onChange={(e) => updateField(null, 'iop', parseFloat(e.target.value) || '')}
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Método Tonometria</Label>
          <Select 
            value={data?.iop_method || ''} 
            onValueChange={(v) => updateField(null, 'iop_method', v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {IOP_METHODS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Biomicroscopy Section */}
      <Card>
        <CardHeader className="py-2 px-3 bg-blue-50 dark:bg-blue-950/30">
          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Biomicroscopia (Segmento Anterior)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 grid grid-cols-2 gap-3">
          {[
            { key: 'lids', label: 'Pálpebras' },
            { key: 'conjunctiva', label: 'Conjuntiva' },
            { key: 'cornea', label: 'Córnea' },
            { key: 'anterior_chamber', label: 'Câmara Anterior' },
            { key: 'iris', label: 'Íris' },
            { key: 'pupil', label: 'Pupila' },
            { key: 'lens', label: 'Cristalino' }
          ].map(field => (
            <div key={field.key}>
              <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
              <Input 
                className="h-8 text-sm mt-0.5"
                value={biomicroscopy[field.key] || ''}
                onChange={(e) => updateField('biomicroscopy', field.key, e.target.value)}
                placeholder="Descreva..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fundoscopy Section */}
      <Card>
        <CardHeader className="py-2 px-3 bg-orange-50 dark:bg-orange-950/30">
          <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
            Fundoscopia (Segmento Posterior)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 grid grid-cols-2 gap-3">
          {[
            { key: 'vitreous', label: 'Vítreo' },
            { key: 'optic_disc', label: 'Disco Óptico' },
            { key: 'cup_disc_ratio', label: 'Relação E/D' },
            { key: 'macula', label: 'Mácula' },
            { key: 'retina', label: 'Retina' },
            { key: 'vessels', label: 'Vasos' },
            { key: 'choroid', label: 'Coroide' }
          ].map(field => (
            <div key={field.key}>
              <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
              <Input 
                className="h-8 text-sm mt-0.5"
                value={fundoscopy[field.key] || ''}
                onChange={(e) => updateField('fundoscopy', field.key, e.target.value)}
                placeholder="Descreva..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Diagnosis & Conduct for this eye */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-xs font-semibold">Diagnóstico ({eyeLabel})</Label>
          <Textarea 
            className="mt-1 min-h-[60px]"
            value={data?.diagnosis || ''}
            onChange={(e) => updateField(null, 'diagnosis', e.target.value)}
            placeholder="Ex: Catarata senil incipiente..."
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Conduta ({eyeLabel})</Label>
          <Textarea 
            className="mt-1 min-h-[60px]"
            value={data?.conduct || ''}
            onChange={(e) => updateField(null, 'conduct', e.target.value)}
            placeholder="Ex: Acompanhamento semestral..."
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PATIENT SELECTOR MODAL
// ============================================================================
function PatientSelector({ isOpen, onClose, onSelect }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const list = await dbService.getPatients();
      // Filter only human patients for ophthalmology
      setPatients(list.filter(p => p.practice === 'human' || !p.practice));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Selecionar Paciente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input 
            placeholder="Buscar por nome..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum paciente encontrado</div>
            ) : (
              <div className="space-y-2">
                {filtered.map(patient => (
                  <div 
                    key={patient.id}
                    onClick={() => onSelect(patient)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{patient.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.birth_year ? `Nasc: ${patient.birth_year}` : ''} 
                        {patient.document ? ` • Doc: ${patient.document}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// PRINT REPORT VIEW
// ============================================================================
function OphthalmoReportView({ exam, settings, onClose }) {
  if (!exam) return null;

  const renderEyeSection = (eyeData, label) => {
    if (!eyeData) return null;
    const bio = eyeData.biomicroscopy || {};
    const fund = eyeData.fundoscopy || {};

    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold border-b-2 border-primary pb-1 mb-3">{label}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <p><strong>Acuidade Visual (s/c):</strong> {eyeData.visual_acuity || '-'}</p>
          <p><strong>AV Corrigida (c/c):</strong> {eyeData.visual_acuity_corrected || '-'}</p>
          <p><strong>PIO:</strong> {eyeData.iop ? `${eyeData.iop} mmHg` : '-'} {eyeData.iop_method ? `(${eyeData.iop_method})` : ''}</p>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-sm bg-gray-100 px-2 py-1">Biomicroscopia</h4>
          <div className="grid grid-cols-2 gap-2 text-sm p-2">
            <p><strong>Pálpebras:</strong> {bio.lids || '-'}</p>
            <p><strong>Conjuntiva:</strong> {bio.conjunctiva || '-'}</p>
            <p><strong>Córnea:</strong> {bio.cornea || '-'}</p>
            <p><strong>Câmara Anterior:</strong> {bio.anterior_chamber || '-'}</p>
            <p><strong>Íris:</strong> {bio.iris || '-'}</p>
            <p><strong>Pupila:</strong> {bio.pupil || '-'}</p>
            <p><strong>Cristalino:</strong> {bio.lens || '-'}</p>
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-sm bg-gray-100 px-2 py-1">Fundoscopia</h4>
          <div className="grid grid-cols-2 gap-2 text-sm p-2">
            <p><strong>Vítreo:</strong> {fund.vitreous || '-'}</p>
            <p><strong>Disco Óptico:</strong> {fund.optic_disc || '-'}</p>
            <p><strong>Relação E/D:</strong> {fund.cup_disc_ratio || '-'}</p>
            <p><strong>Mácula:</strong> {fund.macula || '-'}</p>
            <p><strong>Retina:</strong> {fund.retina || '-'}</p>
            <p><strong>Vasos:</strong> {fund.vessels || '-'}</p>
          </div>
        </div>

        {(eyeData.diagnosis || eyeData.conduct) && (
          <div className="border-l-4 border-primary pl-3 mt-3">
            {eyeData.diagnosis && <p><strong>Diagnóstico:</strong> {eyeData.diagnosis}</p>}
            {eyeData.conduct && <p><strong>Conduta:</strong> {eyeData.conduct}</p>}
          </div>
        )}

        {eyeData.eye_fundus_drawing && (
          <div className="mt-3">
            <p className="text-sm font-semibold mb-1">Retinografia Esquemática:</p>
            <img src={eyeData.eye_fundus_drawing} alt="Fundoscopia" className="max-w-[300px] border" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto print:static">
      <div className="no-print sticky top-0 bg-muted border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Laudo Oftalmológico</span>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">{settings?.clinic_name || 'Clínica Oftalmológica'}</h1>
            <p className="text-sm">{settings?.veterinarian_name}</p>
            {settings?.crmv && <p className="text-sm">CRM: {settings.crmv}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary">LAUDO OFTALMOLÓGICO</h2>
            <p className="text-sm text-gray-500">Data: {new Date(exam.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Paciente:</strong> {exam.patient_name}</p>
            <p><strong>Médico Solicitante:</strong> {exam.requesting_doctor || '-'}</p>
          </div>
          {exam.chief_complaint && (
            <p className="mt-2"><strong>Queixa Principal:</strong> {exam.chief_complaint}</p>
          )}
        </div>

        {/* OD Section */}
        {renderEyeSection(exam.right_eye, 'Olho Direito (OD)')}
        
        {/* OS Section */}
        {renderEyeSection(exam.left_eye, 'Olho Esquerdo (OS)')}

        {/* General Diagnosis & Plan */}
        {(exam.general_diagnosis || exam.treatment_plan) && (
          <div className="mt-6 p-4 border-2 rounded">
            <h3 className="font-bold mb-2">Conclusão Geral</h3>
            {exam.general_diagnosis && <p><strong>Diagnóstico:</strong> {exam.general_diagnosis}</p>}
            {exam.treatment_plan && <p><strong>Conduta:</strong> {exam.treatment_plan}</p>}
            {exam.follow_up && <p><strong>Retorno:</strong> {exam.follow_up}</p>}
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-8 border-t text-center">
          <div className="w-64 mx-auto border-t border-gray-800 pt-2">
            <p className="font-bold">{settings?.veterinarian_name}</p>
            <p className="text-sm">CRM: {settings?.crmv}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN MODULE COMPONENT
// ============================================================================
export default function OphthalmoHumanModule() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  
  const [editMode, setEditMode] = useState(false);
  const [examData, setExamData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState('right_eye');
  
  const [searchTerm, setSearchTerm] = useState('');

  // Visual editors state
  const [showFundusEditor, setShowFundusEditor] = useState(false);
  const [showCampimetry, setShowCampimetry] = useState(false);
  const [editingEye, setEditingEye] = useState(null);

  useEffect(() => {
    loadExams();
    loadSettings();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const rxdb = await getDatabase();
      const docs = await rxdb.ophthalmo.find().sort({ date: 'desc' }).exec();
      setExams(docs.map(d => d.toJSON()));
    } catch (e) {
      console.error('Error loading ophthalmo exams:', e);
      toast.error('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await dbService.getSettings();
      setSettings(s);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewExam = () => {
    setShowPatientSelector(true);
  };

  const handlePatientSelected = (patient) => {
    setShowPatientSelector(false);
    
    const newExam = {
      id: genId(),
      patient_id: patient.id,
      patient_name: patient.name,
      date: new Date().toISOString(),
      doctor_name: settings.veterinarian_name || '',
      requesting_doctor: '',
      chief_complaint: '',
      clinical_history: '',
      current_medications: '',
      allergies: '',
      right_eye: {},
      left_eye: {},
      general_diagnosis: '',
      treatment_plan: '',
      follow_up: '',
      notes: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setExamData(newExam);
    setSelectedExam(null);
    setEditMode(true);
    setActiveTab('right_eye');
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setExamData({ ...exam });
    setEditMode(true);
  };

  const setEyeNormal = (eyeKey) => {
    if (!examData) return;
    
    setExamData({
      ...examData,
      [eyeKey]: {
        ...(examData[eyeKey] || {}),
        visual_acuity: '20/20',
        visual_acuity_corrected: '20/20',
        iop: 14,
        biomicroscopy: { ...NORMAL_DEFAULTS.biomicroscopy },
        fundoscopy: { ...NORMAL_DEFAULTS.fundoscopy },
        diagnosis: 'Exame dentro dos limites da normalidade',
        conduct: 'Acompanhamento anual'
      }
    });
    
    toast.success(`${eyeKey === 'right_eye' ? 'OD' : 'OS'} preenchido como normal`);
  };

  const updateEyeData = (eyeKey, newData) => {
    if (!examData) return;
    setExamData({
      ...examData,
      [eyeKey]: newData
    });
  };

  const handleSave = async (finalize = false) => {
    if (!examData) return;
    
    try {
      setIsSaving(true);
      const rxdb = await getDatabase();
      
      const dataToSave = {
        ...examData,
        status: finalize ? 'finalized' : 'draft',
        updated_at: new Date().toISOString(),
        ...(finalize && {
          finalized_at: new Date().toISOString()
        })
      };
      
      const existing = await rxdb.ophthalmo.findOne(examData.id).exec();
      
      if (existing) {
        await existing.patch(dataToSave);
      } else {
        await rxdb.ophthalmo.insert(dataToSave);
      }
      
      toast.success(finalize ? 'Exame finalizado!' : 'Exame salvo!');
      await loadExams();
      setSelectedExam(dataToSave);
      setExamData(dataToSave);
    } catch (e) {
      console.error('Error saving:', e);
      toast.error('Erro ao salvar exame');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Excluir este exame oftalmológico?')) return;
    
    try {
      const rxdb = await getDatabase();
      const doc = await rxdb.ophthalmo.findOne(examId).exec();
      if (doc) {
        await doc.remove();
        toast.success('Exame excluído');
        await loadExams();
        
        if (selectedExam?.id === examId) {
          setSelectedExam(null);
          setExamData(null);
          setEditMode(false);
        }
      }
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const handleSaveFundusDrawing = (base64, eyeKey) => {
    if (!examData) return;
    setExamData({
      ...examData,
      [eyeKey]: {
        ...(examData[eyeKey] || {}),
        eye_fundus_drawing: base64
      }
    });
    setShowFundusEditor(false);
    toast.success('Desenho salvo');
  };

  const handleSaveCampimetry = (gridData, eyeKey) => {
    if (!examData) return;
    setExamData({
      ...examData,
      [eyeKey]: {
        ...(examData[eyeKey] || {}),
        campimetry_grid: gridData
      }
    });
    setShowCampimetry(false);
    toast.success('Campimetria salva');
  };

  const filteredExams = exams.filter(exam => 
    exam.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Oftalmologia</h1>
              <p className="text-sm text-muted-foreground">Exames Oftalmológicos Completos</p>
            </div>
          </div>
          <Button onClick={handleNewExam} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" /> Novo Exame
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Exam List */}
        <div className="w-80 border-r flex flex-col bg-muted/20">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar exames..." 
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Nenhum exame encontrado</p>
                </div>
              ) : (
                filteredExams.map(exam => (
                  <Card 
                    key={exam.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedExam?.id === exam.id && "ring-2 ring-purple-500"
                    )}
                    onClick={() => handleSelectExam(exam)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold truncate block">{exam.patient_name}</span>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(exam.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge 
                          variant={exam.status === 'finalized' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {exam.status === 'finalized' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Final</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Rascunho</>
                          )}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!editMode || !examData ? (
            <div className="flex-1 flex items-center justify-center bg-muted/10">
              <div className="text-center">
                <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">
                  Selecione um exame ou crie um novo
                </p>
                <Button onClick={handleNewExam} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Novo Exame
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b bg-card flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{examData.patient_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(examData.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedExam && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(examData.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowReport(true)}
                  >
                    <Printer className="h-4 w-4 mr-2" /> Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" /> Salvar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSave(true)}
                    disabled={isSaving || examData.status === 'finalized'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Finalizar
                  </Button>
                </div>
              </div>

              {/* Clinical Info */}
              <div className="p-4 border-b bg-muted/20 shrink-0">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Médico Solicitante</Label>
                    <Input 
                      className="mt-1 h-8"
                      placeholder="Dr(a)..."
                      value={examData.requesting_doctor || ''}
                      onChange={e => setExamData({...examData, requesting_doctor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Queixa Principal</Label>
                    <Input 
                      className="mt-1 h-8"
                      placeholder="Ex: Baixa visual..."
                      value={examData.chief_complaint || ''}
                      onChange={e => setExamData({...examData, chief_complaint: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Medicações em Uso</Label>
                    <Input 
                      className="mt-1 h-8"
                      placeholder="Listar..."
                      value={examData.current_medications || ''}
                      onChange={e => setExamData({...examData, current_medications: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Alergias</Label>
                    <Input 
                      className="mt-1 h-8"
                      placeholder="NKDA..."
                      value={examData.allergies || ''}
                      onChange={e => setExamData({...examData, allergies: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Eye Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b px-4 shrink-0">
                  <TabsList className="h-12">
                    <TabsTrigger value="right_eye" className="gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                      <Eye className="h-4 w-4" /> Olho Direito (OD)
                    </TabsTrigger>
                    <TabsTrigger value="left_eye" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                      <Eye className="h-4 w-4" /> Olho Esquerdo (OS)
                    </TabsTrigger>
                    <TabsTrigger value="conclusion" className="gap-2">
                      <FileText className="h-4 w-4" /> Conclusão
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <TabsContent value="right_eye" className="p-4 m-0">
                    <EyeForm 
                      eyeKey="right_eye"
                      eyeLabel="Olho Direito (OD)"
                      data={examData.right_eye}
                      onChange={(newData) => updateEyeData('right_eye', newData)}
                      onSetNormal={() => setEyeNormal('right_eye')}
                    />
                    
                    {/* Visual Editors */}
                    <div className="mt-6 flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => { setEditingEye('right_eye'); setShowFundusEditor(true); }}
                      >
                        Desenhar Fundoscopia (OD)
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { setEditingEye('right_eye'); setShowCampimetry(true); }}
                      >
                        Campimetria (OD)
                      </Button>
                    </div>
                    
                    {examData.right_eye?.eye_fundus_drawing && (
                      <div className="mt-4">
                        <Label className="text-xs">Desenho Fundoscopia (OD)</Label>
                        <img src={examData.right_eye.eye_fundus_drawing} alt="Fundus OD" className="mt-1 max-w-[300px] border rounded" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="left_eye" className="p-4 m-0">
                    <EyeForm 
                      eyeKey="left_eye"
                      eyeLabel="Olho Esquerdo (OS)"
                      data={examData.left_eye}
                      onChange={(newData) => updateEyeData('left_eye', newData)}
                      onSetNormal={() => setEyeNormal('left_eye')}
                    />
                    
                    {/* Visual Editors */}
                    <div className="mt-6 flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => { setEditingEye('left_eye'); setShowFundusEditor(true); }}
                      >
                        Desenhar Fundoscopia (OS)
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { setEditingEye('left_eye'); setShowCampimetry(true); }}
                      >
                        Campimetria (OS)
                      </Button>
                    </div>
                    
                    {examData.left_eye?.eye_fundus_drawing && (
                      <div className="mt-4">
                        <Label className="text-xs">Desenho Fundoscopia (OS)</Label>
                        <img src={examData.left_eye.eye_fundus_drawing} alt="Fundus OS" className="mt-1 max-w-[300px] border rounded" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="conclusion" className="p-4 m-0 space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Diagnóstico Geral</Label>
                      <Textarea 
                        className="mt-1 min-h-[100px]"
                        value={examData.general_diagnosis || ''}
                        onChange={e => setExamData({...examData, general_diagnosis: e.target.value})}
                        placeholder="Resumo diagnóstico de ambos os olhos..."
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Plano de Tratamento</Label>
                      <Textarea 
                        className="mt-1 min-h-[100px]"
                        value={examData.treatment_plan || ''}
                        onChange={e => setExamData({...examData, treatment_plan: e.target.value})}
                        placeholder="Conduta terapêutica..."
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Retorno</Label>
                      <Input 
                        className="mt-1"
                        value={examData.follow_up || ''}
                        onChange={e => setExamData({...examData, follow_up: e.target.value})}
                        placeholder="Ex: 6 meses..."
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Observações</Label>
                      <Textarea 
                        className="mt-1 min-h-[80px]"
                        value={examData.notes || ''}
                        onChange={e => setExamData({...examData, notes: e.target.value})}
                        placeholder="Notas adicionais..."
                      />
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <PatientSelector 
        isOpen={showPatientSelector}
        onClose={() => setShowPatientSelector(false)}
        onSelect={handlePatientSelected}
      />

      {showReport && examData && (
        <OphthalmoReportView 
          exam={examData}
          settings={settings}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Fundus Editor Modal */}
      {showFundusEditor && (
        <Dialog open={showFundusEditor} onOpenChange={setShowFundusEditor}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Desenho de Fundoscopia ({editingEye === 'right_eye' ? 'OD' : 'OS'})</DialogTitle>
            </DialogHeader>
            <EyeFundusEditor 
              onSave={(base64) => handleSaveFundusDrawing(base64, editingEye)}
              initialImage={examData?.[editingEye]?.eye_fundus_drawing}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Campimetry Modal */}
      {showCampimetry && (
        <Dialog open={showCampimetry} onOpenChange={setShowCampimetry}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Campimetria ({editingEye === 'right_eye' ? 'OD' : 'OS'})</DialogTitle>
            </DialogHeader>
            <CampimetryGrid 
              value={examData?.[editingEye]?.campimetry_grid || []}
              onChange={(gridData) => handleSaveCampimetry(gridData, editingEye)}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowCampimetry(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
