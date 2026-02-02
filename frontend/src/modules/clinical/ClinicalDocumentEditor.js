import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { ArrowLeft, Save, FileCheck } from 'lucide-react';

const CERTIFICATE_PRESET_TEMPLATE = (patientName, doctorName) => `ATESTADO MÉDICO

Atesto para os devidos fins que ${patientName || '[Nome do Paciente]'} foi atendido(a) em consulta médica nesta data.

Local e Data: _________________

${doctorName || '[Nome do Médico]'}
[Registro Profissional]`;

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

        if (documentType === 'certificate') {
          setFormData({
            title: 'Atestado Médico',
            content: CERTIFICATE_PRESET_TEMPLATE(p?.name, doctorName),
            doctor_name: doctorName
          });
        } else if (documentType === 'anamnesis') {
          setFormData({
            title: 'Anamnese Clínica',
            content: '',
            doctor_name: doctorName
          });
        } else if (documentType === 'referral') {
          setFormData({
            title: 'Encaminhamento',
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
      toast.error('O conteúdo não pode estar vazio');
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

  const documentTypeLabel = {
    certificate: 'Atestado',
    anamnesis: 'Anamnese',
    referral: 'Encaminhamento'
  }[documentType] || 'Documento';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/history/${patientId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Novo {documentTypeLabel}
            </h1>
            <p className="text-sm text-muted-foreground">
              Paciente: {patient.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              {documentTypeLabel}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título do documento"
              />
            </div>

            <div>
              <Label htmlFor="doctor_name">Profissional Responsável</Label>
              <Input
                id="doctor_name"
                value={formData.doctor_name}
                onChange={(e) =>
                  setFormData({ ...formData, doctor_name: e.target.value })
                }
                placeholder="Nome do profissional"
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Digite o conteúdo do documento..."
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content.length} caracteres
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/history/${patientId}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Documento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
