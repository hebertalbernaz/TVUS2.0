import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { db } from '@/services/database';
import { Calendar, FileText, ImageIcon, Pill, ArrowLeft, FlaskConical } from 'lucide-react';
import { getExamTypeName } from '@/lib/exam_types';

export default function PatientHistoryPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]); // unified: exams + prescriptions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const p = await db.getPatient(patientId);
        setPatient(p);

        // Unified timeline query: { collection: 'exams'|'prescriptions', date, data }
        const t = await db.getPatientTimeline(patientId);
        // Defensive: ensure contract contains { collection, date }
        setTimeline((t || []).filter(x => x?.collection && x?.date));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  const hasPatient = !!patientId;

  // --- FORMATADORES PARA PORTUGUÊS ---
  const formatSpecies = (s) => {
    if (!s) return '';
    const map = { dog: 'Canino', cat: 'Felino', other: 'Outro', human: 'Humano' };
    return map[s] || s;
  };

  const formatSex = (s) => {
    if (!s) return '';
    const map = { male: 'Macho', female: 'Fêmea', M: 'Macho', F: 'Fêmea' };
    return map[s] || s;
  };

  const formatExamType = (type) => {
    try {
      return getExamTypeName(type);
    } catch (e) {
      const map = {
        ultrasound_abd: 'Ultrassom Abdominal',
        echocardiogram: 'Ecocardiograma',
        ecg: 'Eletrocardiograma',
        radiography: 'Radiografia',
        tomography: 'Tomografia'
      };
      return map[type] || type;
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const emptyStateText = useMemo(() => {
    if (!hasPatient) return 'Abra o histórico a partir do card do paciente.';
    return 'Nenhum item no histórico deste paciente.';
  }, [hasPatient]);

  if (loading) return <div className="p-8 text-center text-muted-foreground" data-testid="patient-history-loading">Carregando histórico...</div>;

  // Se abriu /history sem patientId
  if (!hasPatient) {
    return (
      <div className="min-h-screen bg-background p-6" data-testid="patient-history-page">
        <div className="max-w-2xl mx-auto mt-10">
          <Card className="p-6">
            <h1 className="text-xl font-bold text-primary mb-2">Histórico Clínico</h1>
            <p className="text-sm text-muted-foreground">
              Para garantir a integridade dos dados, o histórico é aberto pelo card do paciente.
            </p>
            <div className="mt-4 flex justify-end">
              <Button data-testid="patient-history-back-button" variant="outline" onClick={() => navigate('/')}>Voltar</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient) return <div className="p-8 text-center text-muted-foreground" data-testid="patient-history-not-found">Paciente não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background p-6" data-testid="patient-history-page">
      {/* Cabeçalho Fixo */}
      <div className="mb-6 border-b pb-4 sticky top-0 bg-background z-10 pt-2 shadow-sm -mx-6 px-6">
        <div className="flex items-center gap-3 mb-3">
          <Button data-testid="patient-history-header-back" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Histórico Clínico</h1>
        </div>

        <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-3 rounded-lg" data-testid="patient-history-header">
          <div>
            <span className="font-bold block text-foreground">Paciente</span>
            {patient.name}
          </div>
          <div>
            <span className="font-bold block text-foreground">Detalhes</span>
            {formatSpecies(patient.species)} • {formatSex(patient.sex)} • {patient.breed}
          </div>
          <div>
            <span className="font-bold block text-foreground">Tutor</span>
            {patient.owner_name}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-190px)] pr-4">
        <div className="space-y-6 pb-10" data-testid="patient-history-timeline">
          {timeline.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/10" data-testid="patient-history-empty">
              <p className="text-muted-foreground">{emptyStateText}</p>
            </div>
          ) : (
            timeline.map((entry) => {
              const isExam = entry.collection === 'exams';
              const isPrescription = entry.collection === 'prescriptions';
              const isLab = entry.collection === 'lab_exams';
              const { date, time } = formatDate(entry.date);

              if (isExam) {
                const exam = entry.data;
                return (
                  <Card key={`exam-${exam.id}`} className="border-l-4 border-l-primary/60 shadow-sm hover:shadow transition-all" data-testid={`timeline-exam-${exam.id}`}>
                    <CardHeader className="pb-3 bg-muted/5 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">{date}</p>
                            <p className="text-xs text-muted-foreground capitalize">{time}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 uppercase tracking-wide" data-testid={`timeline-exam-type-${exam.id}`}>
                          {formatExamType(exam.exam_type)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-5">
                      {/* Laudo */}
                      <div className="space-y-4">
                        {exam.organs_data && exam.organs_data.map((organ, idx) => (
                          organ.report_text ? (
                            <div key={idx} className="text-sm group">
                              <h4 className="font-bold text-primary mb-1 flex items-center gap-2 text-xs uppercase tracking-wider">
                                <FileText className="h-3 w-3" /> {organ.organ_name}
                              </h4>
                              <div className="whitespace-pre-wrap text-foreground/80 pl-4 border-l-2 border-muted group-hover:border-primary/30 transition-colors ml-1.5 py-1 text-justify leading-relaxed">
                                {organ.report_text}
                              </div>
                            </div>
                          ) : null
                        ))}
                      </div>

                      {/* Galeria de Imagens */}
                      {exam.images && exam.images.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-3 w-3" /> Imagens Anexadas ({exam.images.length})
                          </h4>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {exam.images.map((img, index) => (
                              <div
                                key={img.id || index}
                                className="aspect-video bg-black rounded-md overflow-hidden cursor-zoom-in hover:ring-2 ring-primary transition-all relative group"
                                data-testid={`timeline-exam-image-${exam.id}-${index}`}
                                onClick={() => {
                                  const w = window.open('', '_blank');
                                  w.document.write(`
                                    <body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh;">
                                      <img src="${img.data}" style="max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 0 20px rgba(0,0,0,0.5);">
                                    </body>
                                  `);
                                }}
                              >
                                <img
                                  src={img.data}
                                  className="w-full h-full object-contain"
                                  alt={`Imagem ${index + 1}`}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }

              if (isPrescription) {
                const rx = entry.data;
                return (
                  <Card key={`prescription-${rx.id}`} className="border-l-4 border-l-green-500/60 shadow-sm hover:shadow transition-all" data-testid={`timeline-prescription-${rx.id}`}>
                    <CardHeader className="pb-3 bg-muted/5 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500/10 p-2.5 rounded-full text-green-700">
                            <Pill className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">{date}</p>
                            <p className="text-xs text-muted-foreground capitalize">{time}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 uppercase tracking-wide" data-testid={`timeline-prescription-badge-${rx.id}`}>
                          Receita
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Médico:</span> {rx.doctor_name || '--'}
                      </div>

                      <div className="space-y-2" data-testid={`timeline-prescription-items-${rx.id}`}>
                        {(rx.items || []).map((item, idx) => (
                          <div key={idx} className="p-3 rounded-md border bg-card">
                            <div className="font-semibold text-foreground">{item.drug_name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Posologia:</span> {item.dosage}
                              {item.quantity ? ` • ${item.quantity}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>

                      {rx.notes ? (
                        <div className="pt-3 border-t text-sm">
                          <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Observações</div>
                          <div className="whitespace-pre-wrap text-foreground/80">{rx.notes}</div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              }

              if (isLab) {
                const lab = entry.data;
                const examLabel = lab.exam_type_label || lab.exam_type || 'Exame Laboratorial';
                const abnormalCount = (lab.results || []).filter(r => r.flag && r.flag !== 'normal' && r.flag !== '').length;

                return (
                  <Card
                    key={`lab-${lab.id}`}
                    className="border-l-4 border-l-violet-500/60 shadow-sm hover:shadow transition-all"
                    data-testid={`timeline-lab-${lab.id}`}
                  >
                    <CardHeader className="pb-3 bg-muted/5 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-violet-500/10 p-2.5 rounded-full text-violet-700">
                            <FlaskConical className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">{date}</p>
                            <p className="text-xs text-muted-foreground capitalize">{time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold px-3 py-1 uppercase tracking-wide"
                            data-testid={`timeline-lab-badge-${lab.id}`}
                          >
                            Laboratório
                          </Badge>
                          <Badge variant="outline" className="text-xs" data-testid={`timeline-lab-type-${lab.id}`}>
                            {examLabel}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-semibold text-foreground">Veterinário:</span> {lab.veterinarian_name || '--'}
                        </div>
                        {lab.requesting_vet ? (
                          <div className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Solicitante:</span> {lab.requesting_vet}
                          </div>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid={`timeline-lab-stats-${lab.id}`}>
                        <div className="p-3 rounded-md border bg-card">
                          <div className="text-xs text-muted-foreground">Parâmetros</div>
                          <div className="text-lg font-bold text-foreground">{(lab.results || []).length}</div>
                        </div>
                        <div className="p-3 rounded-md border bg-card">
                          <div className="text-xs text-muted-foreground">Alterados</div>
                          <div className="text-lg font-bold text-foreground">{abnormalCount}</div>
                        </div>
                        <div className="p-3 rounded-md border bg-card">
                          <div className="text-xs text-muted-foreground">Status</div>
                          <div className="text-sm font-semibold text-foreground">{lab.status === 'finalized' ? 'Finalizado' : 'Rascunho'}</div>
                        </div>
                      </div>

                      {lab.conclusion ? (
                        <div className="pt-3 border-t text-sm">
                          <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Conclusão / Observações</div>
                          <div className="whitespace-pre-wrap text-foreground/80">{lab.conclusion}</div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              }


              return null;
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
