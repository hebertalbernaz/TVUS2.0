import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LicenseProvider } from './contexts/LicenseContext';
import { Sidebar } from './components/ui/Sidebar';
import { getDatabase, getLastSeedResult } from './core/database/db';

// Pages & Modules
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage'; // Core Module (Patient List)
import ExamPage from './pages/ExamPage'; // Core Module (Ultrasound)
import PatientHistoryPage from './pages/PatientHistoryPage';
import SettingsPage from './pages/SettingsPage';
import ImageGalleryPage from './pages/ImageGalleryPage';
import PrescriptionPage from './modules/prescription/PrescriptionPage'; // New Prescription Page

// New Modules
import PrescriptionModule from './modules/prescription/PrescriptionModule';
import CardioModule from './modules/cardio/CardioModule';
import LabVetModule from './modules/lab_vet/LabVetModule';
import OphthalmoHumanModule from './modules/ophthalmo_human/OphthalmoHumanModule';
import UltrasoundModule from './modules/ultrasound/UltrasoundModule';
import FinancialModule from './modules/financial/FinancialModule';
import ClinicalDocumentEditor from './modules/clinical/ClinicalDocumentEditor';
import AnamnesisPage from './pages/AnamnesisPage';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Layout Wrapper for Private Routes
const AppLayout = ({ children }) => {
  const [isDBReady, setIsDBReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('[App] Initializing database...');
        const result = await getDatabase();
        const db = result.db || result;
        const seedResult = result.seedResult;

        await db.settings.findOne('global_settings').exec();

        console.log('[App] Database initialized successfully');
        setIsDBReady(true);

        if (seedResult?.success && seedResult?.stats?.totalInserted > 0) {
          const { stats } = seedResult;
          toast.success('Banco de Dados Atualizado!', {
            description: `${stats.drugs.inserted} medicamentos, ${stats.templates.inserted} templates e ${stats.lab_references.inserted} valores de referência adicionados.`
          });
        }
      } catch (error) {
        console.error('[App] Database initialization failed:', error);
        setInitError(error.message);
        setIsDBReady(true);
      }
    };

    initializeDatabase();
  }, []);

  // Loading screen while database initializes
  if (!isDBReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg font-medium">Iniciando Sistema...</div>
          <div className="text-sm text-muted-foreground">Carregando banco de dados</div>
        </div>
      </div>
    );
  }

  // Error screen with option to continue anyway
  if (initError) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 p-8 max-w-md">
              <div className="text-red-500 text-4xl">⚠️</div>
              <div className="text-lg font-medium">Erro na Inicialização</div>
              <div className="text-sm text-muted-foreground">{initError}</div>
              <div className="text-xs text-muted-foreground mt-4">
                O sistema continuará, mas pode ter funcionalidade limitada.
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <LicenseProvider>
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Private Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              <Route path="/exam" element={
                <PrivateRoute>
                  <AppLayout>
                    <ExamPage />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Generic Exam Route */}
              <Route path="/exam/:examId" element={
                <PrivateRoute>
                  <AppLayout>
                    <ExamPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/history" element={
                <PrivateRoute>
                  <AppLayout>
                    <PatientHistoryPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/history/:patientId" element={
                <PrivateRoute>
                  <AppLayout>
                    <PatientHistoryPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/gallery" element={
                <PrivateRoute>
                  <AppLayout>
                    <ImageGalleryPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              {/* New Modular Routes */}
              <Route path="/prescription" element={
                <PrivateRoute>
                  <AppLayout>
                    <PrescriptionModule />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* New Specific Prescription Route */}
              <Route path="/prescription/new/:patientId" element={
                <PrivateRoute>
                  <AppLayout>
                    <PrescriptionPage />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/cardio" element={
                <PrivateRoute>
                  <AppLayout>
                    <CardioModule />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/lab" element={
                <PrivateRoute>
                  <AppLayout>
                    <LabVetModule />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/ophthalmo" element={
                <PrivateRoute>
                  <AppLayout>
                    <OphthalmoHumanModule />
                  </AppLayout>
                </PrivateRoute>
              } />

              <Route path="/financial" element={
                <PrivateRoute>
                  <AppLayout>
                    <FinancialModule />
                  </AppLayout>
                </PrivateRoute>
              } />

              {/* Clinical Documents Routes */}
              <Route path="/patient/:patientId/document/new/:documentType" element={
                <PrivateRoute>
                  <AppLayout>
                    <ClinicalDocumentEditor />
                  </AppLayout>
                </PrivateRoute>
              } />

              {/* Smart Anamnesis Routes */}
              <Route path="/patient/:patientId/anamnesis/new" element={
                <PrivateRoute>
                  <AnamnesisPage />
                </PrivateRoute>
              } />

              <Route path="/patient/:patientId/anamnesis/:anamnesisId/edit" element={
                <PrivateRoute>
                  <AnamnesisPage />
                </PrivateRoute>
              } />

            </Routes>
            <Toaster />
          </Router>
        </LicenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
