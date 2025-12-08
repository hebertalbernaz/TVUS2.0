import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Upload, Save, Download, X, Check, ArrowLeft, Trash2, Plus, Printer, 
    Bold, Italic, Edit, RotateCcw, History, Images, FileDigit, ChevronRight, 
    Stethoscope, Maximize2, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/services/database';
import { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
  ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, SectionType, PageBreak 
} from 'docx';
import { getStructuresForExam, getExamTypeName } from '@/lib/exam_types';
import { translate, getAvailableLanguages } from '@/services/translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImageEditor } from '@/components/ImageEditor';
import { parseDicomTags } from '@/services/dicomService';
import { DicomViewer } from '@/components/DicomViewer';
import { dataURItoBlob, cn } from '@/lib/utils';
import '../print.css'; // CSS Atualizado

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

  // Campos do Header
  const [examWeight, setExamWeight] = useState('');
  const [examDateTime, setExamDateTime] = useState('');
  const [referringVet, setReferringVet] = useState('');

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
          
          if (examRes.organs_data && examRes.organs_data.length > 0) {
             const mergedData = allStructures.map(struct => {
                const saved = examRes.organs_data.find(od => od.organ_name === struct.label);
                return saved || { organ_name: struct.label, measurements: {}, report_text: '', visual_data: null };
             });
             setOrgansData(mergedData);
          } else {
             setOrgansData(allStructures.map(s => ({ organ_name: s.label, measurements: {}, report_text: '', visual_data: null })));
          }
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
  const saveExam = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        organs_data: organsData,
        date: examDateTime ? new Date(examDateTime).toISOString() : new Date().toISOString(),
        status: 'draft'
      };
      
      if (examWeight && !isNaN(parseFloat(examWeight))) payload.exam_weight = parseFloat(examWeight);
      if (referringVet && referringVet.trim() !== '') payload.referring_vet = referringVet;

      await db.updateExam(examId, payload);
      toast.success('Laudo salvo!');
    } catch (error) { 
        console.error("Erro ao salvar:", error);
        const msg = error?.parameters?.errors?.[0]?.message || error.message;
        toast.error(`Erro ao salvar: ${msg}`); 
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
                 originalData: base64, 
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
          
          if (imageIndex !== -1 && imagesClone[imageIndex].originalData) {
              imagesClone[imageIndex] = {
                  ...imagesClone[imageIndex],
                  data: imagesClone[imageIndex].originalData,
                  mimeType: 'application/dicom' 
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
            id: editingImage.id,
            filename: editingImage.filename,
            data: newDataBase64,
            originalData: editingImage.originalData || editingImage.data,
            mimeType: 'image/png', 
            tags: editingImage.tags || []
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
    const newOrgans = [...organsData];
    newOrgans[index] = { ...newOrgans[index], [field]: value };
    setOrgansData(newOrgans);
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

      const titleMap = {
          'echocardiogram': 'RELATÓRIO ECOCARDIOGRÁFICO',
          'ecg': 'RELATÓRIO ELETROCARDIOGRÁFICO',
          'radiography': 'RELATÓRIO RADIOGRÁFICO',
          'ultrasound_abd': 'RELATÓRIO ULTRASSONOGRÁFICO'
      };
      docChildren.push(new Paragraph({ 
          text: titleMap[exam.exam_type] || 'RELATÓRIO DE EXAME', 
          heading: HeadingLevel.HEADING_1, 
          alignment: AlignmentType.CENTER, 
          spacing: { after: 300 } 
      }));

      const processPlaceholders = (txt, ms) => {
          if(!txt) return '';
          let p = txt;
          if(ms?.m1) p = p.replace(/\{(MEDIDA1|M1)\}/gi, `${ms.m1.value} ${ms.m1.unit}`);
          if(ms?.m2) p = p.replace(/\{(MEDIDA2|M2)\}/gi, `${ms.m2.value} ${ms.m2.unit}`);
          if(ms?.m3) p = p.replace(/\{(MEDIDA3|M3)\}/gi, `${ms.m3.value} ${ms.m3.unit}`);
          return p;
      };

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
                  spacing: { before: 200, after: 100 } 
              }));
              
              const finalTxt = processPlaceholders(org.report_text, org.measurements);
              finalTxt.split('\n').forEach(line => {
                  docChildren.push(new Paragraph({ children: parseFormatting(line), alignment: AlignmentType.JUSTIFIED }));
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

  const getProcessedText = (text, ms) => {
      if(!text) return '';
      let p = text;
      if(ms?.m1) p = p.replace(/\{(MEDIDA1|M1)\}/gi, `${ms.m1.value} ${ms.m1.unit}`);
      if(ms?.m2) p = p.replace(/\{(MEDIDA2|M2)\}/gi, `${ms.m2.value} ${ms.m2.unit}`);
      if(ms?.m3) p = p.replace(/\{(MEDIDA3|M3)\}/gi, `${ms.m3.value} ${ms.m3.unit}`);
      return p;
  };

  const renderFormattedText = (text) => {
      const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, index) => {
          if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
          if (part.startsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
          return <span key={index}>{part}</span>;
      });
  };

  const calculateAge = (p) => {
      if (p.birth_year) return (new Date().getFullYear() - p.birth_year) + ' anos';
      return '';
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;
  if (!exam || !patient) return <div>Erro crítico de dados.</div>;

  const currentOrgan = organsData[currentOrganIndex];
  const activeTemplates = templates.filter(t => t.organ === currentOrgan?.organ_name && (t.lang === reportLanguage || (!t.lang && reportLanguage === 'pt')));

  const reportTitles = {
      'echocardiogram': 'RELATÓRIO ECOCARDIOGRÁFICO',
      'ecg': 'RELATÓRIO ELETROCARDIOGRÁFICO',
      'radiography': 'RELATÓRIO RADIOGRÁFICO',
      'ultrasound_abd': 'RELATÓRIO ULTRASSONOGRÁFICO'
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
        
        {/* === INTERFACE (ESCONDIDA NA IMPRESSÃO) === */}
        <div className="no-print h-full flex flex-col">
            {/* HEADER */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5"/></Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg leading-none">{patient.name}</span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">{getExamTypeName(exam.exam_type)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${patient.species === 'cat' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                                {patient.species === 'dog' ? 'Canino' : 'Felino'} • {patient.breed}
                            </span>
                            <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
                                <span>Peso:</span>
                                <input className="bg-transparent w-10 text-center font-medium focus:outline-none text-foreground" placeholder="0.0" value={examWeight} onChange={e => setExamWeight(e.target.value)} /> 
                                <span>kg</span>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
                                <span>Solic.:</span>
                                <input className="bg-transparent w-24 font-medium focus:outline-none text-foreground placeholder:text-muted-foreground/50" placeholder="Dr. Nome" value={referringVet} onChange={e => setReferringVet(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={reportLanguage} onValueChange={setReportLanguage}>
                        <SelectTrigger className="w-[70px] h-8 text-xs bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {getAvailableLanguages().map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {/* Botão de Imprimir com Delay para renderização */}
                    <Button variant="outline" size="sm" onClick={async () => { 
                        await saveExam(); // Salva texto primeiro
                        setTimeout(() => window.print(), 300); // Dá tempo do CSS carregar
                    }} title="Imprimir"><Printer className="h-4 w-4"/></Button>
                    <Button size="sm" onClick={exportToDocx} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"><Download className="h-4 w-4 mr-2"/> DOCX</Button>
                    <Button size="sm" variant="default" onClick={saveExam} disabled={isSaving} className={cn("min-w-[100px]", isSaving ? "opacity-80" : "")}>
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
                                                {img.originalData && img.data !== img.originalData && (
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
                        <OrganEditor organ={currentOrgan} templates={activeTemplates} onChange={(field, value) => updateOrganData(currentOrganIndex, field, value)} />
                    </ResizablePanel>
                    <ResizableHandle />

                    {/* DIREITA: Roteiro */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="border-l bg-muted/10 flex flex-col">
                        <div className="p-3 border-b bg-muted/5"><span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Roteiro</span></div>
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col p-2 gap-1">
                                {organsData.map((organ, idx) => (
                                    <button key={idx} onClick={() => setCurrentOrganIndex(idx)} className={cn("text-left px-3 py-2.5 text-sm rounded-md transition-all flex items-center justify-between group", currentOrganIndex === idx ? "bg-white border shadow-sm text-primary font-semibold" : "hover:bg-muted text-muted-foreground")}>
                                        <span className="truncate pr-4">{translate(organ.organ_name, reportLanguage)}</span>
                                        {organ.report_text && <Check className="h-3.5 w-3.5 text-green-600 absolute right-2" />}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>

        {/* === RELATÓRIO DE IMPRESSÃO (Oculto na tela, visível no print) === */}
        <div id="printable-report">
            {/* 1. Cabeçalho */}
            <div className="report-header">
                <div className="header-logo">
                    {settings?.letterhead_path && <img src={settings.letterhead_path} alt="Logo" />}
                </div>
                <div className="header-info">
                    <div className="clinic-name">{settings?.clinic_name || 'Clínica Veterinária'}</div>
                    <div className="header-details">
                        <div className="vet-name">{settings?.veterinarian_name}</div>
                        {settings?.crmv && <p>CRMV: {settings.crmv}</p>}
                        {settings?.professional_phone && <p>Tel: {settings.professional_phone}</p>}
                        {settings?.professional_email && <p>{settings.professional_email}</p>}
                        {settings?.clinic_address && <p>{settings.clinic_address}</p>}
                        {referringVet && <div className="solicitante">Solicitante: Dr(a). {referringVet}</div>}
                    </div>
                </div>
            </div>

            {/* 2. Dados Paciente */}
            <div className="patient-box">
                <div className="pb-col">
                    <div><strong>Paciente:</strong> {patient.name}</div>
                    <div><strong>Tutor:</strong> {patient.owner_name}</div>
                </div>
                <div className="pb-col">
                    <div><strong>Raça:</strong> {patient.breed} ({patient.species === 'dog' ? 'Canino' : 'Felino'})</div>
                    <div><strong>Data:</strong> {new Date(examDateTime).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            {/* 3. Título */}
            <div className="report-title-main">{reportTitles[exam.exam_type] || 'RELATÓRIO DE EXAME'}</div>

            {/* 4. Corpo do Laudo */}
            {organsData.map((organ, idx) => (
                organ.report_text ? (
                    <div key={idx} className="organ-section avoid-break">
                        <div className="organ-name">{translate(organ.organ_name, reportLanguage)}</div>
                        <div className="organ-content">
                            {renderFormattedText(getProcessedText(organ.report_text, organ.measurements))}
                        </div>
                    </div>
                ) : null
            ))}

            {/* 5. Imagens */}
            {examImages.length > 0 && (
                <div className="images-section avoid-break">
                    <div className="images-title">IMAGENS</div>
                    <div className="print-image-grid">
                        {examImages.map((img, i) => (
                            (!img.mimeType?.includes('dicom')) && (
                                <div key={i} className="print-image-item">
                                    <img src={img.data} alt={`Imagem ${i+1}`} />
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* 6. Assinatura */}
            {settings?.signature_path && (
                <div className="signature-section">
                    <img src={settings.signature_path} className="sig-img" alt="Assinatura" />
                    <div className="sig-line"></div>
                    <div>{settings.veterinarian_name}</div>
                    <div>CRMV {settings.crmv}</div>
                </div>
            )}
        </div>

        {/* MODAL EDITORES */}
        {editingImage && (
            (editingImage.mimeType === 'application/dicom' || editingImage.filename.toLowerCase().endsWith('.dcm')) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 animate-in fade-in no-print">
                    <div className="w-full h-full relative flex flex-col">
                        <button onClick={() => setEditingImage(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-50 bg-white/10 p-2 rounded-full"><X className="h-6 w-6"/></button>
                        <DicomViewer imageBlob={dataURItoBlob(editingImage.data)} />
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

// Subcomponente OrganEditor (Mantido igual)
function OrganEditor({ organ, templates, onChange }) {
    const [text, setText] = useState(organ.report_text || '');
    const [measurements, setMeasurements] = useState(organ.measurements || {});
    const textAreaRef = useRef(null);

    useEffect(() => { setText(organ.report_text || ''); setMeasurements(organ.measurements || {}); }, [organ.organ_name]);
    const updateText = (val) => { setText(val); onChange('report_text', val); };
    const addTemplate = (txt) => { const n = text ? text + '\n' + txt : txt; updateText(n); };
    const setMeasurement = (idx, val) => { const k = `m${idx}`; const m = { ...measurements }; if(val) m[k] = {value: val, unit: 'cm'}; else delete m[k]; setMeasurements(m); onChange('measurements', m); };
    const formatText = (t) => { if(!textAreaRef.current) return; const s = textAreaRef.current.selectionStart; const e = textAreaRef.current.selectionEnd; const sel = text.substring(s, e); if(!sel) return; const m = t === 'bold' ? '**' : '*'; updateText(text.substring(0, s) + `${m}${sel}${m}` + text.substring(e)); };

    if (organ.organ_name.includes('Fundo de Olho')) return <EyeFundusEditor onSave={(b64) => onChange('visual_data', b64)} />;
    if (organ.organ_name.includes('Campimetria')) return <CampimetryGrid value={organ.visual_data} onChange={(v) => onChange('visual_data', v)} />;

    return (
        <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={40}>
                <div className="flex flex-col h-full p-4 gap-3">
                    <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-primary">{organ.organ_name}</h2><div className="flex gap-2 bg-muted/30 px-2 py-1 rounded border">{[1,2,3].map(n=><div key={n} className="flex gap-1 items-center"><span className="text-[10px] font-bold">M{n}</span><input className="w-10 h-6 text-xs border rounded text-center" placeholder="0.0" value={measurements[`m${n}`]?.value||''} onChange={e=>setMeasurement(n,e.target.value)}/></div>)}</div></div>
                    <div className="flex-1 flex flex-col border rounded-md relative"><div className="flex gap-1 p-1 border-b bg-muted/10"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>formatText('bold')}><Bold className="h-3.5 w-3.5"/></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>formatText('italic')}><Italic className="h-3.5 w-3.5"/></Button></div><Textarea ref={textAreaRef} className="flex-1 border-none shadow-none resize-none p-3" value={text} onChange={e=>updateText(e.target.value)} placeholder="Laudo..."/></div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={15} className="bg-muted/5">
                <div className="flex flex-col h-full"><div className="p-2 border-b"><span className="text-xs font-bold text-muted-foreground">MODELOS</span></div><ScrollArea className="flex-1 p-2"><div className="grid grid-cols-2 gap-2">{templates.map(t=><button key={t.id} onClick={()=>addTemplate(t.text)} className="text-left p-2 border rounded bg-card hover:bg-primary/5"><div className="font-bold text-xs">{t.title}</div><div className="text-[10px] line-clamp-2">{t.text}</div></button>)}</div></ScrollArea></div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}