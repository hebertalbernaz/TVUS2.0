import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LicenseProvider } from './contexts/LicenseContext';
import { Sidebar } from './components/ui/Sidebar';

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

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Layout Wrapper for Private Routes
const AppLayout = ({ children }) => {
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

            </Routes>
            <Toaster />
          </Router>
        </LicenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
