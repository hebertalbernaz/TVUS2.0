import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Activity, Search, FileClock, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { localDb } from '@/core/database/localDb';
import { db } from '@/services/database';
import { getSpeciesLabel } from '@/config/dictionaries/vet_terms';

const matches = (p, term) => {
  const t = term.toLowerCase();
  return [p.name, p.owner_name, p.breed].some((v) => (v || '').toLowerCase().includes(t));
};

function RecentDrafts({ patientsById, onOpen }) {
  const drafts = useLiveQuery(
    () => localDb.exams.where('exam_type').equals('ultrasound_abd').reverse().sortBy('date'),
    [],
    []
  ) || [];
  const list = drafts.filter((e) => e.status === 'draft').slice(0, 8);
  return (
    <Card className="p-4 space-y-2" data-testid="ultrasound-recent-drafts">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><FileClock className="h-4 w-4" /> Laudos em andamento</h2>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum laudo em rascunho.</p>}
      {list.map((e) => (
        <button key={e.id} data-testid={`ultrasound-draft-${e.id}`} onClick={() => onOpen(e.id)} className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-primary/5 transition-colors">
          <span className="truncate"><strong>{patientsById[e.patient_id]?.name || 'Paciente'}</strong> • {new Date(e.date).toLocaleDateString('pt-BR')}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </Card>
  );
}

export default function UltrasoundModule() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [busyId, setBusyId] = useState(null);
  const patients = useLiveQuery(() => localDb.patients.where('scope').equals('VET').sortBy('name'), [], []) || [];
  const patientsById = Object.fromEntries(patients.map((p) => [p.id, p]));
  const filtered = term ? patients.filter((p) => matches(p, term)) : patients;

  const start = async (patient) => {
    setBusyId(patient.id);
    try {
      const exam = await db.createUltrasoundExam(patient);
      navigate(`/exam/${exam.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao iniciar ultrassom');
      setBusyId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6" data-testid="ultrasound-module">
      <header className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Activity className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Ultrassonografia Veterinária</h1>
          <p className="text-sm text-muted-foreground">Selecione o paciente para abrir um novo laudo abdominal.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input data-testid="ultrasound-patient-search" autoFocus className="pl-9 h-10" placeholder="Buscar paciente, tutor ou raça..." value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <Card className="divide-y overflow-hidden">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum paciente encontrado.{' '}
                <Button variant="link" className="px-1" data-testid="ultrasound-go-new-patient" onClick={() => navigate('/')}>Cadastrar paciente</Button>
              </div>
            )}
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {getSpeciesLabel(p.species)} • {p.breed || '--'} • {p.sex === 'female' ? 'Fêmea' : 'Macho'}{p.neutered === 'yes' ? ' castrado(a)' : ''} • {p.weight ? `${p.weight} kg` : 'peso n/i'} • Tutor: {p.owner_name || '--'}
                  </div>
                </div>
                <Button data-testid={`ultrasound-start-${p.id}`} size="sm" disabled={busyId === p.id} onClick={() => start(p)}>
                  {busyId === p.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />} Iniciar
                </Button>
              </div>
            ))}
          </Card>
        </div>
        <RecentDrafts patientsById={patientsById} onOpen={(id) => navigate(`/exam/${id}`)} />
      </div>
    </div>
  );
}
