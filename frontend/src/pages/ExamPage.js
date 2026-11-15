import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Upload, Save, Download, X, Check, ArrowLeft, Trash2, Plus, Printer, 
    Bold, Italic, Edit, RotateCcw, History, Images, FileDigit, ChevronRight, 
    Stethoscope, Maximize2, Loader2, Eye, Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/services/database';
import { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
  ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, SectionType, PageBreak 
} from 'docx';
import { getStructuresForExam, getExamTypeName, AGGREGATE_ORGANS } from '@/lib/exam_types';
import { translate, getAvailableLanguages } from '@/services/translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImageEditor } from '@/components/ImageEditor';
import { parseDicomTags } from '@/services/dicomService';
import { DicomViewer } from '@/components/DicomViewer';
import { dataURItoBlob, cn } from '@/lib/utils';
import { getSpeciesLabel } from '@/config/dictionaries/vet_terms';
import { ReportSearch } from '@/components/Editors/ReportSearch';
import { HighlightTextarea } from '@/components/Editors/HighlightTextarea';
import { useOrganSearch } from '@/components/Editors/useOrganSearch';
import { useAutoSave } from '@/shared/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { UltrasoundOrganEditor } from '@/components/Editors/UltrasoundEditor';
import { ReportDocument, PrintPortal, REPORT_TITLES, findMissingMeasures } from '@/components/Report/ReportDocument';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fillPlaceholders, mergeOrgans } from '@/lib/ultrasound';
import '../print.css';

// Módulos Visuais
import { EyeFundusEditor } from '@/components/ophthalmo/EyeFundusEditor';
import { CampimetryGrid } from '@/components/ophthalmo/CampimetryGrid';

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Estados de Dados
  const [exam, setExam] = useState(null);
  const [patient, setPatient] = useState(null);
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [referenceValues, setReferenceValues] = useState([]);
  const [organsData, setOrgansData] = useState([]);
  const [examImages, setExamImages] = useState([]);
  
  // Estados de Controle
  const [currentOrganIndex, setCurrentOrganIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null); 
  const [reportLanguage, setReportLanguage] = useState('pt');
  const [showPreview, setShowPreview] = useState(false);

  // Campos do Header
  const [examWeight, setExamWeight] = useState('');
  const [examDateTime, setExamDateTime] = useState('');
  const [referringVet, setReferringVet] = useState('');

  const pageRef = useRef(null);
  const search = useOrganSearch({
    organs: organsData,
    currentIndex: currentOrganIndex,
    setCurrentIndex: setCurrentOrganIndex,
    language: reportLanguage,
    containerRef: pageRef,
  });

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    const loadExamData = async () => {
        try {
          const examRes = await db.getExam(examId);
          if (!examRes) return navigate('/');
          
          setExam(examRes);
          setExamWeight(examRes.exam_weight || '');
          setReferringVet(examRes.referring_vet || '');
          
          let initialDate = new Date();
          const dateSource = examRes.date || examRes.exam_date;
          if (dateSource) {
            const savedDate = new Date(dateSource);
            if (!isNaN(savedDate.getTime())) initialDate = savedDate;
          }
          const tzOffset = initialDate.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(initialDate - tzOffset)).toISOString().slice(0, 16);
          setExamDateTime(localISOTime);
    
          setExamImages(examRes.images || []);
          
          const patientRes = await db.getPatient(examRes.patient_id);
          setPatient(patientRes);
          
          const settingsRes = await db.getSettings();
          setSettings(settingsRes);
          
          const templatesRes = await db.getTemplates();
          setTemplates(templatesRes);
          
          const refValuesRes = await db.getReferenceValues();
          setReferenceValues(refValuesRes);
    
          const examType = examRes.exam_type || 'ultrasound_abd';
          const allStructures = getStructuresForExam(examType, patientRes);
          
          setOrgansData(mergeOrgans(allStructures, examRes.organs_data || []));
        } catch (error) { 
            console.error(error);
            toast.error('Erro ao carregar dados do exame.'); 
        } finally {
            setLoading(false);
        }
    };
    loadExamData();
  }, [examId, navigate]);

  // --- AÇÕES DO HEADER ---
  const autoSaveData = useMemo(
    () => ({ organsData, examWeight, examDateTime, referringVet }),
    [organsData, examWeight, examDateTime, referringVet]
  );

  const persistExam = useCallback(async ({ organsData: od, examWeight: w, examDateTime: dt, referringVet: rv }) => {
    const payload = {
      organs_data: od,
      date: dt ? new Date(dt).toISOString() : new Date().toISOString(),
      status: 'draft',
      updated_at: new Date().toISOString(),
      referring_vet: (rv || '').trim()
    };
    if (w !== '' && !isNaN(parseFloat(w))) payload.exam_weight = parseFloat(w);
    await db.updateExam(examId, payload);
  }, [examId]);

  const autoSave = useAutoSave({ data: autoSaveData, onSave: persistExam, enabled: !loading && !!exam });

  const saveExam = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      autoSave.cancel();
      await persistExam(autoSaveData);
      autoSave.markSaved();
      toast.success('Laudo salvo!');
    } catch (error) { 
        console.error("Erro ao salvar:", error);
        toast.error(`Erro ao salvar: ${error.message}`); 
    } finally {
        setIsSaving(false);
    }
  };

  const handleOpenHistory = () => {
      if (!patient) return;
      const baseUrl = window.location.href.split('#')[0];
      const historyUrl = `${baseUrl}#/history/${patient.id}`; 
      window.open(historyUrl, 'Histórico', 'width=600,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
  };

  const handleOpenGallery = () => {
      const baseUrl = window.location.href.split('#')[0];
      const galleryUrl = `${baseUrl}#/gallery/${examId}`;
      window.open(galleryUrl, 'Galeria', 'width=1000,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
  };

  // --- GERENCIAMENTO DE IMAGENS ---
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const newImages = [];
      for (let file of files) {
        let isDicom = file.name.toLowerCase().endsWith('.dcm');
        
        if (!isDicom) {
             await new Promise((resolve) => {
                 const slice = file.slice(0, 132);
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     try {
                         const view = new DataView(e.target.result);
                         if (view.byteLength >= 132) {
                             const magic = String.fromCharCode(view.getUint8(128), view.getUint8(129), view.getUint8(130), view.getUint8(131));
                             if (magic === 'DICM') isDicom = true;
                         }
                     } catch(err) { }
                     resolve();
                 };
                 reader.readAsArrayBuffer(slice);
             });
        }

        if (isDicom) {
            try {
                const tags = await parseDicomTags(file);
                if (!patient.name && tags.PatientName) toast.info(`Paciente detectado: ${tags.PatientName}`);
            } catch (e) { }
        }

        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
             const base64 = e.target.result;
             const imgData = { 
                 filename: file.name, 
                 data: base64, 
                 file,
                 mimeType: isDicom ? 'application/dicom' : (file.type || 'application/octet-stream') 
             };
             const saved = await db.saveImage(examId, imgData);
             newImages.push(saved);
             resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setExamImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagens adicionadas.`);
    } finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Apagar esta imagem?')) return;
    try {
        await db.deleteImage(examId, imageId);
        setExamImages(prev => prev.filter(img => img.id !== imageId));
    } catch(e) { toast.error("Erro ao apagar imagem"); }
  };

  const handleResetImage = async (imgId) => {
      if (!window.confirm('Restaurar imagem original?')) return;
      try {
          const examData = await db.getExam(examId);
          const imagesClone = JSON.parse(JSON.stringify(examData.images || []));
          const imageIndex = imagesClone.findIndex(i => i.id === imgId);
          
          if (imageIndex !== -1) {
              const original = await db.getOriginalImage(imagesClone[imageIndex]);
              if (!original) return;
              imagesClone[imageIndex] = {
                  ...imagesClone[imageIndex],
                  data: original.data,
                  mimeType: original.mimeType,
                  edited: false
              };
              
              await db.updateExam(examId, { images: imagesClone });
              setExamImages(imagesClone);
              toast.success('Restaurada!');
          }
      } catch (e) { 
          console.error(e);
          toast.error('Erro ao restaurar.'); 
      }
  };

  const handleSaveEditedImage = async (newDataBase64) => {
    if (!editingImage) return;
    try {
        const updatedImage = { 
            ...editingImage,
            data: newDataBase64,
            mimeType: 'image/png', 
            edited: true
        };

        const examData = await db.getExam(examId);
        const currentImages = JSON.parse(JSON.stringify(examData.images || []));
        const imageIndex = currentImages.findIndex(img => img.id === editingImage.id);
        
        if (imageIndex !== -1) {
            currentImages[imageIndex] = updatedImage;
            await db.updateExam(examId, { images: currentImages });
            setExamImages(currentImages);
            toast.success('Edição salva!');
        }
        setEditingImage(null);
    } catch (e) { 
        console.error("Erro ao salvar edição:", e);
        toast.error('Erro ao salvar edição.'); 
    }
  };

  // --- EDITOR DO ÓRGÃO (Central) ---
  const updateOrganData = (index, field, value) => {
    setOrgansData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // --- GERAÇÃO DE DOCX ---
  const exportToDocx = async () => {
    try {
      await saveExam(); 
      const t = (txt) => translate(txt, reportLanguage);
      const docChildren = [];
      
      let logoCell = new TableCell({ children: [], borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } });
      
      const getImageSize = (base64, targetWidth = 250) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { const ratio = img.height / img.width; resolve({ width: targetWidth, height: targetWidth * ratio }); };
          img.onerror = () => resolve({ width: targetWidth, height: targetWidth * 0.75 });
          img.src = base64;
        });
      };

      const dataURLToUint8Array = (dataURL) => {
        const base64 = dataURL.split(',')[1];
        const binary = atob(base64);
        const len = binary.length; const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
      };

      if (settings?.letterhead_path?.startsWith('data:image')) {
          const dims = await getImageSize(settings.letterhead_path, 200);
          const imgData = dataURLToUint8Array(settings.letterhead_path);
          logoCell = new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} },
              children: [new Paragraph({ children: [new ImageRun({ data: imgData, transformation: { width: dims.width, height: dims.height } })] })]
          });
      }

      const infoRows = [
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: settings?.clinic_name || '', bold: true, size: 28, font: "Arial" })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: settings?.veterinarian_name || '', bold: true, size: 20, font: "Arial" })] }),
          settings?.crmv ? new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `CRMV: ${settings.crmv}`, size: 20, font: "Arial" })] }) : null,
          referringVet ? new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Solicitante: Dr(a). ${referringVet}`, bold: true, size: 20, font: "Arial" })], spacing: { before: 100 } }) : null
      ].filter(Boolean);

      const infoCell = new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideHorizontal: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} },
          children: infoRows
      });

      docChildren.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.SINGLE, size: 12}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} }, 
          rows: [new TableRow({ children: [logoCell, infoCell] })],
      }));

      docChildren.push(new Paragraph({ text: " " }));

      const patientTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { fill: "F5F5F5" },
          borders: { top: {style: BorderStyle.SINGLE, color: "CCCCCC"}, bottom: {style: BorderStyle.SINGLE, color: "CCCCCC"}, left: {style: BorderStyle.SINGLE, color: "CCCCCC"}, right: {style: BorderStyle.SINGLE, color: "CCCCCC"} },
          rows: [
              new TableRow({ children: [
                  new TableCell({ width: {size: 50, type: WidthType.PERCENTAGE}, children: [
                      new Paragraph({ children: [new TextRun({ text: `${t('Paciente')}: `, bold: true }), new TextRun(patient.name)] }),
                      new Paragraph({ children: [new TextRun({ text: `${t('Tutor')}: `, bold: true }), new TextRun(patient.owner_name || '-')] }),
                  ]}),
                  new TableCell({ width: {size: 50, type: WidthType.PERCENTAGE}, children: [
                      new Paragraph({ children: [new TextRun({ text: `${t('Raça')}: `, bold: true }), new TextRun(patient.breed)] }),
                      new Paragraph({ children: [new TextRun({ text: `${t('Data')}: `, bold: true }), new TextRun(new Date(examDateTime).toLocaleDateString())] }),
                  ]})
              ]})
          ]
      });
      docChildren.push(patientTable);
      docChildren.push(new Paragraph({ text: " " }));

      const titleMap = REPORT_TITLES;
      docChildren.push(new Paragraph({ 
          text: titleMap[exam.exam_type] || 'RELATÓRIO DE EXAME', 
          heading: HeadingLevel.HEADING_1, 
          alignment: AlignmentType.CENTER, 
          spacing: { after: 300 } 
      }));

      const processPlaceholders = (txt, ms) => fillPlaceholders(txt, ms);

      const parseFormatting = (txt) => {
          return txt.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map(part => {
              if (part.startsWith('**')) return new TextRun({ text: part.slice(2, -2), bold: true });
              if (part.startsWith('*')) return new TextRun({ text: part.slice(1, -1), italics: true });
              return new TextRun({ text: part });
          });
      };

      organsData.forEach(org => {
          if (org.report_text) {
              docChildren.push(new Paragraph({ 
                  text: t(org.organ_name), 
                  heading: HeadingLevel.HEADING_3, 
                  keepNext: true,
                  keepLines: true,
                  spacing: { before: 200, after: 100 } 
              }));
              
              const finalTxt = processPlaceholders(org.report_text, org.measurements);
              finalTxt.split('\n').forEach(line => {
                  docChildren.push(new Paragraph({ children: parseFormatting(line), alignment: AlignmentType.JUSTIFIED, keepLines: true }));
              });
              docChildren.push(new Paragraph({ text: " " }));
          }
      });

      const validImages = examImages.filter(img => !img.mimeType?.includes('dicom') && !img.filename.toLowerCase().endsWith('.dcm'));
      
      if (validImages.length > 0) {
          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          docChildren.push(new Paragraph({ text: t('IMAGENS'), heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
          
          const imgRows = [];
          for (let i = 0; i < validImages.length; i += 2) {
              // YIELD: Pausa para a UI não travar
              await new Promise(r => setTimeout(r, 0));

              const cells = [];
              const addImgCell = async (img) => {
                  const dims = await getImageSize(img.data, 220);
                  return new TableCell({ 
                      borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideHorizontal: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} }, 
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: dataURLToUint8Array(img.data), transformation: { width: dims.width, height: dims.height } })] })] 
                  });
              };
              cells.push(await addImgCell(validImages[i]));
              if(i+1 < validImages.length) cells.push(await addImgCell(validImages[i+1]));
              imgRows.push(new TableRow({ children: cells }));
          }
          docChildren.push(new Table({ 
              rows: imgRows, 
              width: { size: 100, type: WidthType.PERCENTAGE }, 
              borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE}, insideHorizontal: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} } 
          }));
      }

      if (settings?.signature_path?.startsWith('data:image')) {
          const sigData = dataURLToUint8Array(settings.signature_path);
          const sigDims = await getImageSize(settings.signature_path, 150);
          docChildren.push(new Paragraph({ text: " ", spacing: { before: 400 } }));
          docChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: sigData, transformation: { width: sigDims.width, height: sigDims.height } })] }));
          docChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "_________________________________", color: "000000" })] }));
          docChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: settings.veterinarian_name, bold: true })] }));
          if (settings.crmv) docChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `CRMV: ${settings.crmv}` })] }));
      }

      const doc = new Document({ 
          styles: { default: { document: { run: { font: "Arial", size: 22 }, paragraph: { spacing: { line: 276 } } } } }, 
          sections: [{ properties: { type: SectionType.CONTINUOUS, page: { margin: { top: 700, right: 700, bottom: 700, left: 700 } } }, children: docChildren }] 
      });
      
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_${patient.name}_${new Date().toISOString().slice(0,10)}.docx`;
      link.click();
      toast.success('DOCX Gerado e Baixado!');

    } catch (e) { 
        console.error(e); 
        toast.error('Erro ao gerar DOCX. Verifique imagens/dados.'); 
    }
  };

  const fillEmptyWithNormal = () => {
      const names = organsData.map(o => o.organ_name);
      const normalFor = (o) => templates.find(t => t.organ === o.organ_name && (t.category || 'normal') === 'normal' && (t.lang || 'pt') === reportLanguage);
      // Estruturas agrupadas (ex.: "Rins") são puladas quando o roteiro já tem os lados separados.
      const skip = (o) => (AGGREGATE_ORGANS[o.organ_name] || []).some(part => names.includes(part));
      const targets = new Set(organsData.filter(o => !(o.report_text || '').trim() && !skip(o) && normalFor(o)).map(o => o.organ_name));
      setOrgansData(prev => prev.map(o => (targets.has(o.organ_name) && !(o.report_text || '').trim() ? { ...o, report_text: normalFor(o).text } : o)));
      toast.success(targets.size ? `Texto normal aplicado em ${targets.size} órgão(s) vazio(s).` : 'Nenhum órgão vazio com texto normal disponível.');
  };

  const handlePrint = async () => {
      await autoSave.flush();
      await saveExam();
      setTimeout(() => window.print(), 300);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;
  if (!exam || !patient) return <div>Erro crítico de dados.</div>;

  const currentOrgan = organsData[currentOrganIndex];
  const activeTemplates = templates.filter(t => t.organ === currentOrgan?.organ_name && (t.lang === reportLanguage || (!t.lang && reportLanguage === 'pt')));

  const reportProps = { exam, patient, settings, organs: organsData, images: examImages, examDateTime, referringVet, examWeight, language: reportLanguage, referenceValues };
  const missingMeasures = findMissingMeasures(organsData);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
        
        {/* === INTERFACE (ESCONDIDA NA IMPRESSÃO) === */}
        <div ref={pageRef} className="no-print h-full flex flex-col">
            {/* HEADER */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <Button data-testid="exam-back-button" variant="ghost" size="icon" onClick={async () => { await autoSave.flush(); navigate('/'); }} className="rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5"/></Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg leading-none">{patient.name}</span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">{getExamTypeName(exam.exam_type)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${patient.species === 'cat' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                                {getSpeciesLabel(patient.species)} • {patient.breed}
                            </span>
                            <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
                                <span>Peso:</span>
                                <input data-testid="exam-weight-input" className="bg-transparent w-10 text-center font-medium focus:outline-none text-foreground" placeholder="0.0" value={examWeight} onChange={e => setExamWeight(e.target.value)} /> 
                                <span>kg</span>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
                                <span>Solic.:</span>
                                <input data-testid="exam-referring-vet-input" className="bg-transparent w-24 font-medium focus:outline-none text-foreground placeholder:text-muted-foreground/50" placeholder="Dr. Nome" value={referringVet} onChange={e => setReferringVet(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AutoSaveIndicator status={autoSave.status} lastSavedAt={autoSave.lastSavedAt} />
                    <Select value={reportLanguage} onValueChange={setReportLanguage}>
                        <SelectTrigger className="w-[70px] h-8 text-xs bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {getAvailableLanguages().map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {/* Botão de Imprimir com Delay para renderização */}
                    <Button data-testid="exam-preview-button" variant="outline" size="sm" onClick={() => setShowPreview(true)} title="Pré-visualizar laudo"><Eye className="h-4 w-4 mr-1"/> Prévia</Button>
                    <Button data-testid="exam-print-button" variant="outline" size="sm" onClick={handlePrint} title="Imprimir / PDF"><Printer className="h-4 w-4"/></Button>
                    <Button data-testid="exam-docx-button" size="sm" onClick={exportToDocx} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"><Download className="h-4 w-4 mr-2"/> DOCX</Button>
                    <Button data-testid="exam-save-button" size="sm" variant="default" onClick={saveExam} disabled={isSaving} className={cn("min-w-[100px]", isSaving ? "opacity-80" : "")}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} Salvar
                    </Button>
                </div>
            </div>

            {/* LAYOUT WORKSTATION */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* ESQUERDA: Imagens */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r bg-muted/5 flex flex-col">
                        <div className="p-3 border-b bg-muted/20 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground"><Images className="h-4 w-4" /> Imagens ({examImages.length})</div>
                            <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary p-1.5 rounded-md transition-colors">
                                <Plus className="h-4 w-4" /><input type="file" multiple accept="image/*,.dcm" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                            </label>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {examImages.map(img => {
                                    const isDicom = img.mimeType === 'application/dicom' || (img.filename.toLowerCase().endsWith('.dcm') && img.mimeType !== 'image/png');
                                    return (
                                        <div key={img.id} className="relative group aspect-square bg-black/5 rounded-lg overflow-hidden border border-border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setEditingImage(img)}>
                                            {isDicom ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                                                    <FileDigit className="h-8 w-8 mb-1 opacity-80" />
                                                    <span className="text-[10px] font-bold tracking-wider">DICOM</span>
                                                </div>
                                            ) : (
                                                <img src={img.data} className="w-full h-full object-cover" alt="" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-[1px]">
                                                <Maximize2 className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(img.edited || (img.originalData && img.data !== img.originalData)) && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleResetImage(img.id); }} className="bg-yellow-500/90 text-white p-1 rounded hover:bg-yellow-600 shadow-sm"><RotateCcw className="h-3 w-3" /></button>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="bg-destructive/90 text-white p-1 rounded hover:bg-destructive shadow-sm"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </ResizablePanel>
                    <ResizableHandle />
                    
                    {/* CENTRO: Editor */}
                    <ResizablePanel defaultSize={55} className="bg-background flex flex-col">
                        <div className="h-11 shrink-0 border-b bg-muted/5 px-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Laudo</span>
                                {search.hasTerm && (
                                    <span data-testid="search-summary" className="text-[11px] text-muted-foreground truncate animate-in fade-in duration-150">
                                        {search.byName
                                            ? `${search.total} ${search.total === 1 ? 'órgão' : 'órgãos'} com esse nome no roteiro`
                                            : search.total
                                            ? `${search.total} ${search.total === 1 ? 'ocorrência' : 'ocorrências'} em ${search.sectionsWithMatches} ${search.sectionsWithMatches === 1 ? 'seção' : 'seções'}`
                                            : 'Nenhuma ocorrência no texto'}
                                    </span>
                                )}
                            </div>
                            <ReportSearch
                                value={search.searchTerm}
                                onChange={search.setSearchTerm}
                                total={search.total}
                                current={search.current}
                                onNext={search.onNext}
                                onPrev={search.onPrev}
                                onGoToText={search.onGoToText}
                                inputRef={search.inputRef}
                            />
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">
                            <OrganEditor
                                key={currentOrganIndex}
                                organ={currentOrgan}
                                patient={patient}
                                referenceValues={referenceValues}
                                templates={activeTemplates}
                                onChange={(field, value) => updateOrganData(currentOrganIndex, field, value)}
                                searchTerm={search.searchTerm}
                                activeMatchIndex={search.activeIndexInCurrent}
                                selectNonce={search.selectNonce}
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />

                    {/* DIREITA: Roteiro */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="border-l bg-muted/10 flex flex-col">
                        <div className="p-2 border-b bg-muted/5 flex items-center justify-between gap-2"><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Roteiro</span><Button data-testid="roteiro-fill-normal" size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-green-700 dark:text-green-400" onClick={fillEmptyWithNormal} title="Preencher órgãos vazios com o texto Normal"><Wand2 className="h-3.5 w-3.5 mr-1"/> Normal nos vazios</Button></div>
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col p-2 gap-1">
                                {organsData.map((organ, idx) => {
                                    const stat = search.stats[idx] || { count: 0, nameMatch: false };
                                    const dimmed = search.hasTerm && !stat.count && !stat.nameMatch && currentOrganIndex !== idx;
                                    return (
                                        <button key={idx} data-testid={`organ-nav-${idx}`} ref={search.organButtonRef(idx)} onClick={() => search.selectOrgan(idx)} className={cn("text-left px-3 py-2.5 text-sm rounded-md transition-all flex items-center justify-between gap-2 group", currentOrganIndex === idx ? "bg-card border shadow-sm text-primary font-semibold" : "hover:bg-muted text-muted-foreground", dimmed && "opacity-40")}>
                                            <span className="truncate">{translate(organ.organ_name, reportLanguage)}</span>
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                {search.hasTerm && stat.count > 0 && (
                                                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold inline-flex items-center justify-center tabular-nums animate-in zoom-in-50 duration-150">{stat.count}</span>
                                                )}
                                                {organ.report_text && <Check className="h-3.5 w-3.5 text-green-600" />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>

        <PrintPortal settings={settings}><ReportDocument {...reportProps} /></PrintPortal>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-[230mm] w-[95vw] max-h-[94vh] overflow-y-auto bg-neutral-300 dark:bg-neutral-800 p-4" data-testid="report-preview-dialog">
                <DialogHeader className="bg-card rounded-md p-3">
                    <DialogTitle className="flex items-center justify-between gap-3">
                        <span>Pré-visualização do laudo (A4)</span>
                        <span className="flex gap-2">
                            <Button data-testid="preview-print-button" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1"/> Imprimir / PDF</Button>
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {missingMeasures.length
                            ? <span data-testid="preview-missing-measures" className="text-amber-700 dark:text-amber-400 font-medium">Medidas não preenchidas em: {missingMeasures.join(', ')} (aparecem como ___).</span>
                            : 'A impressão sai exatamente como abaixo, sempre em fundo branco.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="report-sheet"><ReportDocument {...reportProps} /></div>
            </DialogContent>
        </Dialog>

        {/* MODAL EDITORES */}
        {editingImage && (
            (editingImage.mimeType === 'application/dicom' || editingImage.filename.toLowerCase().endsWith('.dcm')) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 animate-in fade-in no-print">
                    <div className="w-full h-full relative flex flex-col">
                        <button onClick={() => setEditingImage(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-50 bg-white/10 p-2 rounded-full"><X className="h-6 w-6"/></button>
                        <DicomViewer imageBlob={dataURItoBlob(editingImage.data)} mediaId={editingImage.original_media_id} />
                    </div>
                </div>
            ) : (
                <ImageEditor 
                    isOpen={!!editingImage}
                    imageUrl={editingImage.data}
                    onClose={() => setEditingImage(null)}
                    onSave={handleSaveEditedImage}
                />
            )
        )}
    </div>
  );
}

function OrganEditor(props) {
    const { organ, onChange } = props;
    if (organ.organ_name.includes('Fundo de Olho')) return <EyeFundusEditor onSave={(b64) => onChange('visual_data', b64)} />;
    if (organ.organ_name.includes('Campimetria')) return <CampimetryGrid value={organ.visual_data} onChange={(v) => onChange('visual_data', v)} />;
    return <UltrasoundOrganEditor {...props} />;
}
