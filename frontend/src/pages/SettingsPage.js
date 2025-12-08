import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, FileText, Database, UserCog, Shield, Pill } from 'lucide-react';
import { db } from '@/services/database';
import { TemplatesManager } from '@/components/TemplatesManager';
import { ReferenceValuesManager } from '@/components/ReferenceValuesManager';
import { ProfilesManager } from '@/components/ProfilesManager';
import { DrugsManager } from '@/components/DrugsManager'; // <--- IMPORT NOVO
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [referenceValues, setReferenceValues] = useState([]);
  const [activeTab, setActiveTab] = useState('drugs'); // Começa em Drugs ou Profiles
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
      setError("Erro ao carregar configurações. Tente recarregar a página.");
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
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground text-sm">Gerencie perfis, textos, medicamentos e referências.</p>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <X className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1 rounded-lg">
             {/* Nova Aba de Medicamentos */}
            <TabsTrigger value="drugs" className="gap-2"><Pill className="h-4 w-4" /> Medicamentos</TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2"><UserCog className="h-4 w-4" /> Perfis</TabsTrigger>
            <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Textos Padrão</TabsTrigger>
            <TabsTrigger value="references" className="gap-2"><Database className="h-4 w-4" /> Valores Ref.</TabsTrigger>
            <TabsTrigger value="backup" className="gap-2"><Shield className="h-4 w-4" /> Backup</TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Conteúdo da Aba Medicamentos */}
            <TabsContent value="drugs">
                <DrugsManager />
            </TabsContent>

            <TabsContent value="profiles">
                <ProfilesManager onProfileChanged={loadAllData} />
            </TabsContent>

            <TabsContent value="templates">
                <TemplatesManager templates={templates} onUpdate={loadTemplates} />
            </TabsContent>

            <TabsContent value="references">
                <ReferenceValuesManager values={referenceValues} onUpdate={loadReferenceValues} />
            </TabsContent>
            
            <TabsContent value="backup">
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                    Funcionalidade de Backup em Manutenção (Use o Export no Desktop)
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}