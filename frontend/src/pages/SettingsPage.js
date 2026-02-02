import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, FileText, Database, UserCog, Shield, Pill, BookOpen } from 'lucide-react';
import { db } from '@/services/database';
import { TemplatesManager } from '@/components/TemplatesManager';
import { ReferenceValuesManager } from '@/components/ReferenceValuesManager';
import { ProfilesManager } from '@/components/ProfilesManager';
import { DrugsManager } from '@/components/DrugsManager';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [referenceValues, setReferenceValues] = useState([]);
  const [activeTab, setActiveTab] = useState('profiles');
  const [databaseSubTab, setDatabaseSubTab] = useState('drugs');
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
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="text-red-500">{error}</p>
      <Button onClick={loadAllData}>Tentar Novamente</Button>
    </div>
  );

  if (!settings) return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto max-w-6xl p-6">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuracoes</h1>
            <p className="text-muted-foreground text-sm">Gerencie perfis profissionais e base de dados clinica.</p>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <X className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="profiles" className="gap-2">
              <UserCog className="h-4 w-4" /> Perfis Profissionais
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="h-4 w-4" /> Base de Dados
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <Shield className="h-4 w-4" /> Backup
            </TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TabsContent value="profiles">
              <ProfilesManager onProfileChanged={loadAllData} />
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Base de Dados Clinica
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gerencie medicamentos, modelos de texto e valores de referencia.
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={databaseSubTab} onValueChange={setDatabaseSubTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="drugs" className="gap-2">
                        <Pill className="h-4 w-4" /> Medicamentos
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="gap-2">
                        <FileText className="h-4 w-4" /> Textos/Modelos
                      </TabsTrigger>
                      <TabsTrigger value="references" className="gap-2">
                        <BookOpen className="h-4 w-4" /> Valores Referencia
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="drugs" className="mt-0">
                      <DrugsManager />
                    </TabsContent>

                    <TabsContent value="templates" className="mt-0">
                      <TemplatesManager templates={templates} onUpdate={loadTemplates} />
                    </TabsContent>

                    <TabsContent value="references" className="mt-0">
                      <ReferenceValuesManager values={referenceValues} onUpdate={loadReferenceValues} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Backup e Restauracao
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">
                      Funcionalidade de Backup em Manutencao
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use o Export no aplicativo Desktop para backup completo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}