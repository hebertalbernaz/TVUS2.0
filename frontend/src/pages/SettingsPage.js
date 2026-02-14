import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Settings2,
  FileText,
  Pill,
  MonitorDot,
  Stethoscope,
  Wallet,
  Database,
  UserCog,
  Shield,
  Wrench,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { db } from '@/services/database';
import { TemplatesManager } from '@/components/TemplatesManager';
import { ReferenceValuesManager } from '@/components/ReferenceValuesManager';
import { ProfilesManager } from '@/components/ProfilesManager';
import { DrugsManager } from '@/components/DrugsManager';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DevToolbar } from '@/components/DevToolbar';
import { cn } from '@/lib/utils';

// ─── SIDEBAR NAVIGATION CONFIG ───
const NAV_SECTIONS = [
  {
    id: 'geral',
    label: 'Geral',
    icon: Settings2,
    description: 'Tema, Backup e Dados da Clinica'
  },
  {
    id: 'clinica',
    label: 'Clinica & Anamnese',
    icon: FileText,
    description: 'Modelos de texto e Configuracoes de Atestados'
  },
  {
    id: 'receituario',
    label: 'Receituario',
    icon: Pill,
    description: 'Cadastro de Medicamentos e Calculadora'
  },
  {
    id: 'imagem',
    label: 'Diagnostico por Imagem',
    icon: MonitorDot,
    description: 'Ultrassom, Radiologia, Tomografia, Eco, Eletro'
  },
  {
    id: 'especialidades',
    label: 'Especialidades',
    icon: Stethoscope,
    description: 'Oftalmologia e Laboratorio'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    description: 'Configuracoes de moeda e servicos padrao'
  }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [referenceValues, setReferenceValues] = useState([]);
  const [activeSection, setActiveSection] = useState('geral');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadSettings = useCallback(async () => {
    try {
      const s = await db.getSettings();
      setSettings(s || {});
    } catch (e) {
      console.error("Erro loadSettings:", e);
      setSettings({});
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const t = await db.getTemplates();
      setTemplates(t || []);
    } catch (e) {
      console.error("Erro loadTemplates:", e);
      setTemplates([]);
    }
  }, []);

  const loadReferenceValues = useCallback(async () => {
    try {
      const rv = await db.getReferenceValues();
      setReferenceValues(rv || []);
    } catch (e) {
      console.error("Erro loadReferenceValues:", e);
      setReferenceValues([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);
      await loadSettings();
      await loadTemplates();
      await loadReferenceValues();
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar configuracoes. Tente recarregar a pagina.");
    }
  }, [loadSettings, loadTemplates, loadReferenceValues]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  if (error) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4" data-testid="settings-error">
      <p className="text-destructive">{error}</p>
      <Button onClick={loadAllData}>Tentar Novamente</Button>
    </div>
  );

  if (!settings) return (
    <div className="flex h-screen items-center justify-center text-muted-foreground" data-testid="settings-loading">
      Carregando...
    </div>
  );

  return (
    <div className="h-[calc(100vh-0px)] bg-background flex flex-col" data-testid="settings-page">
      {/* ─── TOP BAR ─── */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="settings-title">Configuracoes</h1>
          <p className="text-xs text-muted-foreground">Gerencie perfis, base de dados clinica e preferencias.</p>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" data-testid="settings-close-button">
            <X className="h-4 w-4 mr-1" /> Fechar
          </Button>
        </div>
      </div>

      {/* ─── MAIN CONTENT: Sidebar + Panel ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT SIDEBAR (Vertical Tabs) ─── */}
        <nav className="w-56 shrink-0 border-r bg-muted/20 overflow-y-auto" data-testid="settings-sidebar">
          <div className="p-3 space-y-1">
            {NAV_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  data-testid={`settings-nav-${section.id}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}

            <Separator className="my-3" />

            {/* Fixed utility links */}
            <button
              onClick={() => setActiveSection('perfis')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                activeSection === 'perfis'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              data-testid="settings-nav-perfis"
            >
              <UserCog className="h-4 w-4 shrink-0" />
              <span>Perfis Profissionais</span>
            </button>

            <button
              onClick={() => setActiveSection('backup')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                activeSection === 'backup'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              data-testid="settings-nav-backup"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => setActiveSection('devtools')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                activeSection === 'devtools'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              data-testid="settings-nav-devtools"
            >
              <Wrench className="h-4 w-4 shrink-0" />
              <span>Dev Tools</span>
            </button>
          </div>
        </nav>

        {/* ─── RIGHT CONTENT PANEL ─── */}
        <ScrollArea className="flex-1" data-testid="settings-content-panel">
          <div className="p-6 max-w-4xl">

            {/* SECTION HEADER */}
            <SectionHeader section={activeSection} />

            {/* ─── GERAL ─── */}
            {activeSection === 'geral' && (
              <div className="space-y-6" data-testid="settings-section-geral">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Aparencia
                    </CardTitle>
                    <CardDescription>Alterne entre tema claro e escuro.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                      <span className="text-sm text-muted-foreground">
                        Clique no icone para alternar o tema.
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Dados da Clinica
                    </CardTitle>
                    <CardDescription>Informacoes gerais da clinica. Gerencie nos Perfis Profissionais.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-dashed">
                        <span className="text-muted-foreground">Clinica:</span>
                        <span className="font-medium">{settings.clinic_name || 'Nao configurado'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed">
                        <span className="text-muted-foreground">Profissional:</span>
                        <span className="font-medium">{settings.veterinarian_name || 'Nao configurado'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed">
                        <span className="text-muted-foreground">Registro:</span>
                        <span className="font-medium">{settings.crmv || 'Nao configurado'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-muted-foreground">Perfil Ativo:</span>
                        <span className="font-medium">{settings.active_profile_name || 'Nenhum'}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveSection('perfis')}
                      data-testid="goto-profiles-btn"
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Gerenciar Perfis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── CLINICA & ANAMNESE ─── */}
            {activeSection === 'clinica' && (
              <div className="space-y-6" data-testid="settings-section-clinica">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Modelos de Texto / Templates
                    </CardTitle>
                    <CardDescription>
                      Gerencie modelos de laudo, atestados e textos padrao para os exames.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TemplatesManager templates={templates} onUpdate={loadTemplates} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── RECEITUARIO ─── */}
            {activeSection === 'receituario' && (
              <div className="space-y-6" data-testid="settings-section-receituario">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Cadastro de Medicamentos
                    </CardTitle>
                    <CardDescription>
                      Adicione, edite e remova medicamentos da base de dados para uso em receituarios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DrugsManager />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── DIAGNOSTICO POR IMAGEM ─── */}
            {activeSection === 'imagem' && (
              <div className="space-y-6" data-testid="settings-section-imagem">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Valores de Referencia
                    </CardTitle>
                    <CardDescription>
                      Configure valores normais para Ultrassom, Radiologia, Tomografia, Ecocardiograma e Eletrocardiograma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReferenceValuesManager values={referenceValues} onUpdate={loadReferenceValues} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Modelos de Laudo por Imagem
                    </CardTitle>
                    <CardDescription>
                      Templates especificos para laudos de Ultrassonografia, Radiografia, Tomografia, Ecocardiografia e ECG.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TemplatesManager templates={templates} onUpdate={loadTemplates} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── ESPECIALIDADES ─── */}
            {activeSection === 'especialidades' && (
              <div className="space-y-6" data-testid="settings-section-especialidades">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Oftalmologia e Laboratorio
                    </CardTitle>
                    <CardDescription>
                      Configuracoes especificas para modulos de Oftalmologia Humana e Laboratorio Veterinario.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/20">
                      <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Modulos de Especialidade</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As configuracoes especificas de Oftalmologia e Laboratorio estao disponiveis dentro de cada modulo respectivo.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acesse pelo menu lateral principal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── FINANCEIRO ─── */}
            {activeSection === 'financeiro' && (
              <div className="space-y-6" data-testid="settings-section-financeiro">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Configuracoes Financeiras
                    </CardTitle>
                    <CardDescription>
                      Moeda, servicos padrao e preferencias do modulo financeiro.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/20">
                      <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Modulo Financeiro</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As configuracoes financeiras (moeda BRL, servicos padrao, metodos de pagamento) podem ser gerenciadas diretamente no modulo Financeiro.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acesse pelo menu lateral: Financeiro.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── PERFIS PROFISSIONAIS ─── */}
            {activeSection === 'perfis' && (
              <div data-testid="settings-section-perfis">
                <ProfilesManager onProfileChanged={loadAllData} />
              </div>
            )}

            {/* ─── BACKUP ─── */}
            {activeSection === 'backup' && (
              <div data-testid="settings-section-backup">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Backup e Restauracao
                    </CardTitle>
                    <CardDescription>Exporte e importe seus dados para seguranca.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/20">
                      <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Funcionalidade de Backup em Manutencao</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use o Export no aplicativo Desktop para backup completo.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── DEV TOOLS ─── */}
            {activeSection === 'devtools' && (
              <div data-testid="settings-section-devtools">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Ferramentas de Desenvolvimento
                    </CardTitle>
                    <CardDescription>
                      Utilitarios para popular, testar e gerenciar o banco de dados durante desenvolvimento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <DevToolbar />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── SECTION HEADER HELPER ───
function SectionHeader({ section }) {
  const config = {
    geral: { title: 'Geral', desc: 'Tema, aparencia e dados da clinica.' },
    clinica: { title: 'Clinica & Anamnese', desc: 'Modelos de texto e configuracoes de atestados.' },
    receituario: { title: 'Receituario', desc: 'Cadastro de medicamentos para uso em prescricoes.' },
    imagem: { title: 'Diagnostico por Imagem', desc: 'Valores de referencia e templates para Ultrassom, RX, TC, Eco e ECG.' },
    especialidades: { title: 'Especialidades', desc: 'Configuracoes de Oftalmologia e Laboratorio.' },
    financeiro: { title: 'Financeiro', desc: 'Moeda, servicos padrao e preferencias financeiras.' },
    perfis: { title: 'Perfis Profissionais', desc: 'Gerencie perfis de medicos e dados do cabecalho.' },
    backup: { title: 'Backup & Restauracao', desc: 'Proteja seus dados com backup periodico.' },
    devtools: { title: 'Ferramentas de Desenvolvimento', desc: 'Utilitarios para debug e seeds de teste.' }
  };

  const c = config[section] || { title: 'Configuracoes', desc: '' };

  return (
    <div className="mb-6" data-testid="settings-section-header">
      <h2 className="text-lg font-bold text-foreground">{c.title}</h2>
      <p className="text-sm text-muted-foreground">{c.desc}</p>
    </div>
  );
}
