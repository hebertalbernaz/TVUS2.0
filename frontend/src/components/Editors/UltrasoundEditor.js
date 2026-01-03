import React, { useState, useEffect, useRef } from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Images, Plus, FileDigit, Maximize2, RotateCcw, Trash2, 
  Check, Bold, Italic, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/services/database';
import { getStructuresForExam } from '@/lib/exam_types';
import { translate } from '@/services/translation';
import { parseDicomTags } from '@/services/dicomService';
import { dataURItoBlob, cn } from '@/lib/utils';

// Componentes Auxiliares
import { ImageEditor } from '@/components/ImageEditor';
import { DicomViewer } from '@/components/DicomViewer';

export function UltrasoundEditor({ 
    exam, 
    patient, 
    onSave, 
    isSaving, 
    reportLanguage 
}) {
    // --- ESTADOS ---
    const [organsData, setOrgansData] = useState([]);
    const [images, setImages] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [currentOrganIndex, setCurrentOrganIndex] = useState(0);
    
    // Estados de Upload/Edição
    const [uploading, setUploading] = useState(false);
    const [editingImage, setEditingImage] = useState(null);

    // --- INICIALIZAÇÃO ---
    useEffect(() => {
        if (!exam || !patient) return;

        // 1. Inicializar Órgãos (Roteiro)
        const examType = exam.exam_type || 'ultrasound_abd';
        const allStructures = getStructuresForExam(examType, patient);
        
        if (exam.organs_data && exam.organs_data.length > 0) {
            // Mescla dados salvos com a estrutura padrão (caso novos órgãos tenham sido adicionados à estrutura)
            const mergedData = allStructures.map(struct => {
                const saved = exam.organs_data.find(od => od.organ_name === struct.label);
                return saved || { organ_name: struct.label, measurements: {}, report_text: '', visual_data: null };
            });
            setOrgansData(mergedData);
        } else {
            // Cria estrutura do zero
            setOrgansData(allStructures.map(s => ({ organ_name: s.label, measurements: {}, report_text: '', visual_data: null })));
        }

        // 2. Inicializar Imagens
        setImages(exam.images || []);

        // 3. Carregar Templates
        const loadTemplates = async () => {
            try {
                const t = await db.getTemplates();
                setTemplates(t || []);
            } catch (e) { console.error("Erro templates:", e); }
        };
        loadTemplates();

    }, [exam.id, patient.id]); // Recarrega se mudar o exame

    // --- SYNC COM O PAI (Auto-Save ou Manual trigger) ---
    // Toda vez que organsData ou images mudar, notificamos o pai (opcional) ou preparamos o objeto para o onSave manual
    // No caso do seu ExamPage, o onSave é chamado pelo botão no Header.
    // Vamos garantir que o estado local esteja sempre pronto para ser salvo.
    
    // Na verdade, como o botão de salvar está no pai (ExamPage), ele precisa de uma maneira de pegar os dados daqui.
    // O jeito mais React é: O pai passa uma função de ref ou o filho chama onSave quando muda.
    // Para simplificar e manter compatibilidade com seu código anterior:
    // Vamos interceptar a função onSave do pai e injetar os dados atuais.
    
    // SOLUÇÃO: O pai passa `onSave`. Nós chamamos `onSave({ organs_data: ..., images: ... })`
    // Mas o botão é do usuário.
    // Vamos usar um `useEffect` para atualizar um "buffer" no pai ou simplesmente salvar localmente e
    // expor uma função. 
    
    // SIMPLIFICAÇÃO: O UltrasoundEditor gerencia seus dados. Quando o usuário clica em "Salvar" lá em cima,
    // o pai não sabe os dados novos. 
    // MUDANÇA DE ESTRATÉGIA: Vamos salvar automaticamente a cada alteração importante (Debounce) 
    // OU o botão "Salvar" do pai deve ser removido/escondido e trazido para cá?
    // Não, o Header é comum. 
    // Então, vamos atualizar o objeto `exam` no pai sempre que houver mudança aqui.
    // Mas isso pode causar re-renders excessivos.
    
    // MELHOR ABORDAGEM AGORA: Fazer o botão "Salvar" do pai funcionar injetando uma função de "trigger".
    // Como não temos Redux ou Context complexo para isso, vamos fazer o seguinte:
    // O componente UltrasoundEditor vai salvar os dados chamando `onSave` periodicamente (Auto-save) 
    // ou expor um botão de salvar interno se preferir.
    // Para manter a UX do botão superior:
    // Vamos criar um botão flutuante ou interno de salvar neste editor também, ou confiar no Auto-Save.
    
    // Vamos implementar um "Auto-Sync" com o pai se a prop `onSave` aceitar callback.
    // Mas para o seu caso atual, vamos fazer o seguinte:
    // O `onSave` passado pelo pai espera receber `{ organs_data, images }`.
    // Vamos criar um botão "Salvar Alterações" DENTRO deste editor para garantir que o usuário saiba que está salvando o laudo.
    
    const handleManualSave = () => {
        onSave({
            organs_data: organsData,
            images: images
        });
    };

    // --- MANIPULADORES DE IMAGEM ---
    const handleImageUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;
        setUploading(true);
        try {
            const newImages = [];
            for (let file of files) {
                let isDicom = file.name.toLowerCase().endsWith('.dcm');
                // (Lógica de detecção DICOM mantida do original)
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
                             } catch(err) {}
                             resolve();
                         };
                         reader.readAsArrayBuffer(slice);
                     });
                }

                if (isDicom) {
                    try {
                        const tags = await parseDicomTags(file);
                        if (!patient.name && tags.PatientName) toast.info(`Paciente: ${tags.PatientName}`);
                    } catch (e) {}
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
                        const saved = await db.saveImage(exam.id, imgData);
                        if(saved) newImages.push(saved);
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
            const updatedList = [...images, ...newImages];
            setImages(updatedList);
            // Auto-update parent
            onSave({ images: updatedList }); 
            toast.success(`${newImages.length} imagens adicionadas.`);
        } finally { setUploading(false); event.target.value = ''; }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Apagar imagem?')) return;
        try {
            await db.deleteImage(exam.id, imageId);
            const updated = images.filter(img => img.id !== imageId);
            setImages(updated);
            onSave({ images: updated });
        } catch(e) { toast.error("Erro ao apagar"); }
    };

    const handleResetImage = async (imgId) => {
        if (!window.confirm('Restaurar original?')) return;
        try {
            const updated = images.map(img => {
                if (img.id === imgId && img.originalData) {
                    return { ...img, data: img.originalData, mimeType: 'application/dicom' };
                }
                return img;
            });
            await db.updateExam(exam.id, { images: updated });
            setImages(updated);
            toast.success('Restaurada!');
        } catch (e) { toast.error('Erro ao restaurar.'); }
    };

    const handleSaveEditedImage = async (newDataBase64) => {
        if (!editingImage) return;
        try {
            const updated = images.map(img => {
                if (img.id === editingImage.id) {
                    return { ...img, data: newDataBase64, mimeType: 'image/png' };
                }
                return img;
            });
            await db.updateExam(exam.id, { images: updated });
            setImages(updated);
            setEditingImage(null);
            toast.success('Edição salva!');
        } catch (e) { toast.error('Erro ao salvar edição.'); }
    };

    // --- MANIPULADOR DE DADOS DO ÓRGÃO ---
    const updateLocalOrganData = (index, field, value) => {
        const newOrgans = [...organsData];
        newOrgans[index] = { ...newOrgans[index], [field]: value };
        setOrgansData(newOrgans);
        // Opcional: Auto-save debounce poderia ir aqui
    };

    const currentOrgan = organsData[currentOrganIndex] || {};
    const activeTemplates = templates.filter(t => t.organ === currentOrgan.organ_name && (t.lang === reportLanguage || (!t.lang && reportLanguage === 'pt')));

    return (
        <div className="h-full flex flex-col">
            {/* Barra de Save Local (já que o botão do header pode não estar sincronizado 100% em tempo real sem context) */}
            <div className="bg-yellow-50/50 p-1 text-center text-xs text-muted-foreground border-b flex justify-between items-center px-4">
                <span>Modo Ultrassom</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs hover:bg-yellow-100 text-yellow-700" onClick={handleManualSave}>
                    {isSaving ? 'Salvando...' : 'Sincronizar/Salvar Agora'}
                </Button>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* ESQUERDA: Imagens */}
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r bg-muted/5 flex flex-col">
                    <div className="p-3 border-b bg-muted/20 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground"><Images className="h-4 w-4" /> Imagens ({images.length})</div>
                        <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary p-1.5 rounded-md transition-colors">
                            <Plus className="h-4 w-4" /><input type="file" multiple accept="image/*,.dcm" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                        </label>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                        <div className="grid grid-cols-2 gap-2">
                            {images.map(img => {
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
                    <OrganEditor 
                        key={currentOrganIndex} 
                        organ={currentOrgan} 
                        templates={activeTemplates} 
                        onChange={(field, value) => updateLocalOrganData(currentOrganIndex, field, value)} 
                    />
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

            {/* MODAL EDITORES DE IMAGEM */}
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

// --- SUBCOMPONENTE ORGAN EDITOR (Internalizado) ---
function OrganEditor({ organ, templates, onChange }) {
    const [text, setText] = useState(organ.report_text || '');
    const [measurements, setMeasurements] = useState(organ.measurements || {});
    const textAreaRef = useRef(null);

    useEffect(() => { 
        setText(organ.report_text || ''); 
        setMeasurements(organ.measurements || {}); 
    }, [organ]);

    const updateText = (val) => { setText(val); onChange('report_text', val); };
    const addTemplate = (txt) => { const n = text ? text + '\n' + txt : txt; updateText(n); };
    const setMeasurement = (idx, val) => { const k = `m${idx}`; const m = { ...measurements }; if(val) m[k] = {value: val, unit: 'cm'}; else delete m[k]; setMeasurements(m); onChange('measurements', m); };
    const formatText = (t) => { if(!textAreaRef.current) return; const s = textAreaRef.current.selectionStart; const e = textAreaRef.current.selectionEnd; const sel = text.substring(s, e); if(!sel) return; const m = t === 'bold' ? '**' : '*'; updateText(text.substring(0, s) + `${m}${sel}${m}` + text.substring(e)); };

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