import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Users } from 'lucide-react';
import { db } from '@/services/database';
import { PatientCard } from '@/components/PatientCard';
import { PatientForm } from '@/components/PatientForm';
import { useLicense } from '@/contexts/LicenseContext';

export default function PatientsPage() {
  const { terms, practice } = useLicense();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const navigate = useNavigate();

  const activeScope = practice === 'human' ? 'HUMAN' : 'VET';

  const loadPatients = useCallback(async () => {
    try {
      const scopedPatients = await db.getPatients({ scope: activeScope });
      setPatients(scopedPatients);
    } catch (error) {
      console.error('[PatientsPage] loadPatients FAILED:', error);
    }
  }, [activeScope]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.breed && p.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.owner_name && p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const searchPlaceholder = practice === 'vet'
      ? `Buscar ${(terms?.patient_label || 'paciente').toLowerCase()}, ${(terms?.owner_label || 'proprietário').toLowerCase()} ou ${(terms?.breed_label || 'raça').toLowerCase()}...`
      : `Buscar ${(terms?.patient_label || 'paciente').toLowerCase()} ou ${(terms?.owner_label || 'proprietário').toLowerCase()}...`;

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="patients-page" data-scope={activeScope}>
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> {terms?.patient_label || 'Paciente'}s
        </h1>
        <Button
          data-testid="new-patient-button"
          onClick={() => { setEditingPatient(null); setShowNewPatient(true); }}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo {terms?.patient_label || 'Paciente'}
        </Button>
      </header>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          data-testid="patient-search-input"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-11"
        />
      </div>

      {/* PATIENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
        {filteredPatients.map(patient => (
          <PatientCard key={patient.id} patient={patient} onUpdate={loadPatients} />
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredPatients.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-muted bg-card/50 mt-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {searchTerm ? `Nenhum ${(terms?.patient_label || 'paciente').toLowerCase()} encontrado` : 'Lista vazia'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            {searchTerm ? 'Verifique a grafia ou tente outro termo.' : 'Comece cadastrando agora.'}
          </p>
          {!searchTerm && (
            <Button
              data-testid="empty-state-create-patient-button"
              onClick={() => { setEditingPatient(null); setShowNewPatient(true); }}
              variant="outline"
              className="mt-4 border-primary/20 text-primary hover:bg-primary/5"
            >
              Cadastrar {terms?.patient_label || 'Paciente'}
            </Button>
          )}
        </Card>
      )}

      {/* MODAL */}
      <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary font-bold">
              {editingPatient ? `Editar ${terms?.patient_label || 'Paciente'}` : `Novo ${terms?.patient_label || 'Paciente'}`}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            patient={editingPatient}
            onSuccess={() => {
              setShowNewPatient(false);
              setEditingPatient(null);
              setTimeout(() => loadPatients(), 150);
            }}
            onCancel={() => { setShowNewPatient(false); setEditingPatient(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
