import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FlaskConical, Plus, Save, Printer, Trash2, Edit, Search,
  FileText, CheckCircle, Clock, AlertTriangle, Dog, Cat,
  ArrowLeft, RefreshCw, Download, X, ChevronRight, Beaker
} from 'lucide-react';
import { getDatabase, genId } from '@/core/database/db';
import { db as dbService } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  PANEL_PRESETS, 
  getPanelReferences, 
  calculateFlag, 
  getCategoryLabel,
  getFlagStyles 
} from './lab_references';

// ============================================================================
// LAB REPORT VIEW (Print Component)
// ============================================================================
function LabReportView({ exam, settings, onClose }) {
  if (!exam) return null;

  // Group results by category
  const groupedResults = {};
  exam.results?.forEach(r => {
    const cat = r.category || 'outros';
    if (!groupedResults[cat]) groupedResults[cat] = [];
    groupedResults[cat].push(r);
  });

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-background overflow-auto print:static print:overflow-visible">
      {/* Print Header */}
      <div className="no-print sticky top-0 bg-muted border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Visualização do Laudo</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none" id="lab-report-print">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            {settings?.letterhead_path && (
              <img src={settings.letterhead_path} alt="Logo" className="h-16 mb-2" />
            )}
            <h1 className="text-xl font-bold">{settings?.clinic_name || 'Laboratório Veterinário'}</h1>
            <p className="text-sm text-gray-600">{settings?.clinic_address}</p>
            <p className="text-sm text-gray-600">{settings?.professional_phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary">LAUDO LABORATORIAL</h2>
            <p className="text-sm text-gray-500">Data: {new Date(exam.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-6 print:bg-gray-100">
          <div>
            <p><strong>Paciente:</strong> {exam.patient_name}</p>
            <p><strong>Espécie:</strong> {exam.patient_species === 'dog' ? 'Canino' : exam.patient_species === 'cat' ? 'Felino' : exam.patient_species}</p>
            <p><strong>Tutor:</strong> {exam.owner_name || '-'}</p>
          </div>
          <div>
            <p><strong>Exame:</strong> {exam.exam_type_label}</p>
            <p><strong>Solicitante:</strong> {exam.requesting_vet || '-'}</p>
            <p><strong>Status:</strong> {exam.status === 'finalized' ? 'Finalizado' : 'Rascunho'}</p>
          </div>
        </div>

        {/* Results Table */}
        {Object.entries(groupedResults).map(([category, results]) => (
          <div key={category} className="mb-6 avoid-break">
            <h3 className="text-lg font-bold bg-primary/10 px-3 py-2 rounded-t border-b-2 border-primary">
              {getCategoryLabel(category)}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="text-left p-2 border font-semibold w-2/5">Analito</th>
                  <th className="text-center p-2 border font-semibold w-1/5">Resultado</th>
                  <th className="text-center p-2 border font-semibold w-1/5">Unidade</th>
                  <th className="text-center p-2 border font-semibold w-1/5">Referência</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => {
                  const flagStyle = getFlagStyles(r.flag);
                  const isAbnormal = r.flag && r.flag !== 'normal' && r.flag !== '';
                  return (
                    <tr key={idx} className={cn("text-sm", isAbnormal && "bg-red-50 print:bg-red-100")}>
                      <td className="p-2 border">{r.parameter}</td>
                      <td className={cn(
                        "p-2 border text-center font-mono",
                        isAbnormal ? "font-bold text-red-700" : ""
                      )}>
                        {r.value}
                        {isAbnormal && (
                          <span className="ml-1 text-xs">
                            {r.flag === 'high' || r.flag === 'critical_high' ? '↑' : '↓'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 border text-center text-gray-600">{r.unit}</td>
                      <td className="p-2 border text-center text-gray-600 font-mono text-xs">
                        {r.ref_min !== undefined && r.ref_max !== undefined 
                          ? `${r.ref_min} - ${r.ref_max}` 
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* Conclusion */}
        {exam.conclusion && (
          <div className="mt-6 p-4 border-2 border-gray-300 rounded">
            <h3 className="font-bold mb-2">Conclusão / Observações:</h3>
            <p className="whitespace-pre-wrap text-sm">{exam.conclusion}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-8 border-t text-center">
          {settings?.signature_path && (
            <img src={settings.signature_path} alt="Assinatura" className="h-16 mx-auto mb-2" />
          )}
          <div className="w-64 mx-auto border-t border-gray-800 pt-2">
            <p className="font-bold">{settings?.veterinarian_name || exam.veterinarian_name}</p>
            <p className="text-sm text-gray-600">CRMV: {settings?.crmv}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
          <p>TVUSVET - Sistema de Laudos Veterinários</p>
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
      setPatients(list);
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
            placeholder="Buscar por nome ou tutor..." 
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
                    <div className={cn(
                      "p-2 rounded-full",
                      patient.species === 'cat' 
                        ? "bg-orange-100 text-orange-600" 
                        : "bg-blue-100 text-blue-600"
                    )}>
                      {patient.species === 'cat' ? <Cat className="h-4 w-4" /> : <Dog className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{patient.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.breed} • Tutor: {patient.owner_name || '-'}
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
// MAIN MODULE COMPONENT
// ============================================================================
export default function LabVetModule() {
  // State: List & Selection
  const [labExams, setLabExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  
  // State: Editor
  const [editMode, setEditMode] = useState(false);
  const [examData, setExamData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // State: Modals
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // State: Search
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on mount
  useEffect(() => {
    loadLabExams();
    loadSettings();
  }, []);

  const loadLabExams = async () => {
    try {
      setLoading(true);
      const rxdb = await getDatabase();
      const docs = await rxdb.lab_exams.find().sort({ date: 'desc' }).exec();
      setLabExams(docs.map(d => d.toJSON()));
    } catch (e) {
      console.error('Error loading lab exams:', e);
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

  // Create new exam
  const handleNewExam = () => {
    setShowPatientSelector(true);
  };

  const handlePatientSelected = (patient) => {
    setShowPatientSelector(false);
    
    // Initialize new exam data
    const newExam = {
      id: genId(),
      patient_id: patient.id,
      patient_name: patient.name,
      patient_species: patient.species || 'dog',
      owner_name: patient.owner_name,
      date: new Date().toISOString(),
      veterinarian_name: settings.veterinarian_name || '',
      requesting_vet: '',
      exam_type: '',
      exam_type_label: '',
      results: [],
      conclusion: '',
      notes: '',
      clinical_history: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setExamData(newExam);
    setSelectedExam(null);
    setEditMode(true);
  };

  // Select existing exam
  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setExamData({ ...exam });
    setEditMode(true);
  };

  // Apply panel preset
  const applyPanelPreset = (panelId) => {
    if (!examData) return;
    
    const preset = PANEL_PRESETS[panelId];
    const species = examData.patient_species || 'dog';
    const references = getPanelReferences(panelId, species);
    
    setExamData({
      ...examData,
      exam_type: panelId,
      exam_type_label: preset.label,
      results: references
    });
    
    toast.success(`Painel "${preset.label}" aplicado`);
  };

  // Update result value and auto-calculate flag
  const updateResultValue = (index, value) => {
    if (!examData) return;
    
    const newResults = [...examData.results];
    const result = newResults[index];
    
    // Update value
    result.value = value;
    
    // Auto-calculate flag
    if (result.ref_min !== undefined && result.ref_max !== undefined) {
      result.flag = calculateFlag(value, result.ref_min, result.ref_max);
    }
    
    setExamData({ ...examData, results: newResults });
  };

  // Add custom parameter
  const addCustomParameter = () => {
    if (!examData) return;
    
    const newParam = {
      parameter: '',
      value: '',
      unit: '',
      ref_min: 0,
      ref_max: 0,
      flag: '',
      category: 'outros'
    };
    
    setExamData({
      ...examData,
      results: [...examData.results, newParam]
    });
  };

  // Remove parameter
  const removeParameter = (index) => {
    if (!examData) return;
    
    const newResults = examData.results.filter((_, i) => i !== index);
    setExamData({ ...examData, results: newResults });
  };

  // Update parameter field
  const updateParameterField = (index, field, value) => {
    if (!examData) return;
    
    const newResults = [...examData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    
    // Recalculate flag if ref values changed
    if (field === 'ref_min' || field === 'ref_max') {
      const r = newResults[index];
      r.flag = calculateFlag(r.value, r.ref_min, r.ref_max);
    }
    
    setExamData({ ...examData, results: newResults });
  };

  // Save exam
  const handleSave = async (finalize = false) => {
    if (!examData) return;
    if (!examData.exam_type) {
      return toast.error('Selecione um tipo de exame');
    }
    
    try {
      setIsSaving(true);
      const rxdb = await getDatabase();
      
      const dataToSave = {
        ...examData,
        status: finalize ? 'finalized' : 'draft',
        updated_at: new Date().toISOString(),
        ...(finalize && {
          finalized_at: new Date().toISOString(),
          finalized_by: settings.veterinarian_name
        })
      };
      
      // Check if exists
      const existing = await rxdb.lab_exams.findOne(examData.id).exec();
      
      if (existing) {
        await existing.patch(dataToSave);
      } else {
        await rxdb.lab_exams.insert(dataToSave);
      }
      
      toast.success(finalize ? 'Exame finalizado!' : 'Exame salvo!');
      await loadLabExams();
      
      // Update selected exam reference
      setSelectedExam(dataToSave);
      setExamData(dataToSave);
      
    } catch (e) {
      console.error('Error saving:', e);
      toast.error('Erro ao salvar exame');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete exam
  const handleDelete = async (examId) => {
    if (!window.confirm('Excluir este exame laboratorial?')) return;
    
    try {
      const rxdb = await getDatabase();
      const doc = await rxdb.lab_exams.findOne(examId).exec();
      if (doc) {
        await doc.remove();
        toast.success('Exame excluído');
        await loadLabExams();
        
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

  // Filter exams
  const filteredExams = labExams.filter(exam => 
    exam.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.exam_type_label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group results by category for display
  const groupedResults = {};
  examData?.results?.forEach((r, idx) => {
    const cat = r.category || 'outros';
    if (!groupedResults[cat]) groupedResults[cat] = [];
    groupedResults[cat].push({ ...r, _index: idx });
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Laboratório Veterinário</h1>
              <p className="text-sm text-muted-foreground">Sistema de Análises Clínicas</p>
            </div>
          </div>
          <Button onClick={handleNewExam} className="gap-2">
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
                  <Beaker className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Nenhum exame encontrado</p>
                </div>
              ) : (
                filteredExams.map(exam => (
                  <Card 
                    key={exam.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedExam?.id === exam.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSelectExam(exam)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{exam.patient_name}</span>
                            {exam.patient_species === 'cat' 
                              ? <Cat className="h-3 w-3 text-orange-500" />
                              : <Dog className="h-3 w-3 text-blue-500" />
                            }
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {exam.exam_type_label || 'Sem tipo'}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                <FlaskConical className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
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
                  <div className={cn(
                    "p-2 rounded-full",
                    examData.patient_species === 'cat' 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-blue-100 text-blue-600"
                  )}>
                    {examData.patient_species === 'cat' ? <Cat className="h-5 w-5" /> : <Dog className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{examData.patient_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {examData.exam_type_label || 'Selecione o tipo de exame'}
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
                    disabled={examData.results.length === 0}
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

              {/* Panel Presets */}
              <div className="p-4 border-b bg-muted/30 shrink-0">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Painéis Pré-definidos
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PANEL_PRESETS).map(preset => (
                    <Button
                      key={preset.id}
                      variant={examData.exam_type === preset.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyPanelPreset(preset.id)}
                      className="gap-2"
                    >
                      <span>{preset.icon}</span>
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Results Editor */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Meta Fields */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Veterinário Solicitante</Label>
                      <Input 
                        placeholder="Dr(a). ..."
                        value={examData.requesting_vet || ''}
                        onChange={e => setExamData({...examData, requesting_vet: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data do Exame</Label>
                      <Input 
                        type="date"
                        value={examData.date?.split('T')[0] || ''}
                        onChange={e => setExamData({...examData, date: new Date(e.target.value).toISOString()})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">História Clínica</Label>
                      <Input 
                        placeholder="Resumo..."
                        value={examData.clinical_history || ''}
                        onChange={e => setExamData({...examData, clinical_history: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Results by Category */}
                  {examData.results.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Beaker className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground">
                        Selecione um painel acima para começar
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedResults).map(([category, results]) => (
                      <Card key={category} className="overflow-hidden">
                        <CardHeader className="py-2 px-4 bg-muted/50">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            {getCategoryLabel(category)}
                            <Badge variant="secondary" className="text-xs">
                              {results.length} parâmetros
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-muted-foreground border-b bg-muted/30">
                                <th className="text-left p-2 w-1/4">Parâmetro</th>
                                <th className="text-center p-2 w-1/6">Resultado</th>
                                <th className="text-center p-2 w-1/8">Unidade</th>
                                <th className="text-center p-2 w-1/8">Mín</th>
                                <th className="text-center p-2 w-1/8">Máx</th>
                                <th className="text-center p-2 w-1/8">Flag</th>
                                <th className="text-center p-2 w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((r) => {
                                const flagStyle = getFlagStyles(r.flag);
                                return (
                                  <tr key={r._index} className={cn("border-b hover:bg-muted/30", flagStyle.bg)}>
                                    <td className="p-2">
                                      <Input 
                                        value={r.parameter}
                                        onChange={e => updateParameterField(r._index, 'parameter', e.target.value)}
                                        className="h-8 text-sm font-medium"
                                        placeholder="Nome do parâmetro"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input 
                                        value={r.value}
                                        onChange={e => updateResultValue(r._index, e.target.value)}
                                        className={cn(
                                          "h-8 text-sm text-center font-mono",
                                          r.flag && r.flag !== 'normal' && r.flag !== '' && "font-bold",
                                          flagStyle.text
                                        )}
                                        placeholder="0.00"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input 
                                        value={r.unit}
                                        onChange={e => updateParameterField(r._index, 'unit', e.target.value)}
                                        className="h-8 text-xs text-center"
                                        placeholder="un"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input 
                                        type="number"
                                        step="0.01"
                                        value={r.ref_min ?? ''}
                                        onChange={e => updateParameterField(r._index, 'ref_min', parseFloat(e.target.value) || 0)}
                                        className="h-8 text-xs text-center"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input 
                                        type="number"
                                        step="0.01"
                                        value={r.ref_max ?? ''}
                                        onChange={e => updateParameterField(r._index, 'ref_max', parseFloat(e.target.value) || 0)}
                                        className="h-8 text-xs text-center"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      {r.flag && r.flag !== '' && (
                                        <Badge 
                                          variant="outline" 
                                          className={cn("text-xs", flagStyle.text, flagStyle.bg)}
                                        >
                                          {flagStyle.icon} {r.flag === 'normal' ? 'OK' : r.flag.toUpperCase()}
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => removeParameter(r._index)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {/* Add Custom Parameter */}
                  {examData.results.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={addCustomParameter}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Parâmetro Manual
                    </Button>
                  )}

                  {/* Conclusion */}
                  <div>
                    <Label className="text-xs font-semibold">Conclusão / Observações</Label>
                    <Textarea 
                      placeholder="Digite suas observações e conclusões..."
                      value={examData.conclusion || ''}
                      onChange={e => setExamData({...examData, conclusion: e.target.value})}
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                </div>
              </ScrollArea>
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
        <LabReportView 
          exam={examData}
          settings={settings}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
