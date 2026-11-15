import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LicenseProvider } from './contexts/LicenseContext';
import { Sidebar } from './components/ui/Sidebar';

import HomePage from './pages/HomePage';
import ExamPage from './pages/ExamPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import SettingsPage from './pages/SettingsPage';
import ImageGalleryPage from './pages/ImageGalleryPage';
import PrescriptionPage from './modules/prescription/PrescriptionPage';
import PrescriptionModule from './modules/prescription/PrescriptionModule';
import CardioModule from './modules/cardio/CardioModule';
import LabVetModule from './modules/lab_vet/LabVetModule';
import UltrasoundModule from './modules/ultrasound/UltrasoundModule';
import FinancialModule from './modules/financial/FinancialModule';

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">{children}</main>
  </div>
);

const ROUTES = [
  ['/', HomePage],
  ['/ultrasound', UltrasoundModule],
  ['/exam', ExamPage],
  ['/exam/:examId', ExamPage],
  ['/history', PatientHistoryPage],
  ['/history/:patientId', PatientHistoryPage],
  ['/settings', SettingsPage],
  ['/gallery', ImageGalleryPage],
  ['/gallery/:examId', ImageGalleryPage],
  ['/prescription', PrescriptionModule],
  ['/prescription/new/:patientId', PrescriptionPage],
  ['/cardio', CardioModule],
  ['/lab', LabVetModule],
  ['/financial', FinancialModule]
];

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <LicenseProvider>
          <Router>
            <Routes>
              {ROUTES.map(([path, Page]) => (
                <Route key={path} path={path} element={<AppLayout><Page /></AppLayout>} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </LicenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
