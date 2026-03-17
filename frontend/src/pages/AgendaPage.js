import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Calendar, Plus, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPES = ['Consulta', 'Retorno', 'Exame', 'Cirurgia'];
const STATUS_MAP = {
  Agendado:   { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',   icon: Clock },
  Confirmado: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  Concluído:  { color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',       icon: CheckCircle2 },
  Cancelado:  { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',       icon: XCircle },
};

const toDateInput = (d) => d.toISOString().slice(0, 10);
const formatWeekday = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const EMPTY_FORM = {
  patientName: '', patientId: '', date: '', time: '', type: 'Consulta', notes: ''
};

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(() => toDateInput(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAppointments({ date: selectedDate });
    setAppointments(rows);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  const shiftDate = (days) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateInput(d));
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM, date: selectedDate, time: '08:00' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.patientName.trim()) return toast.error('Informe o nome do paciente.');
    if (!form.date || !form.time) return toast.error('Informe data e horário.');
    try {
      await db.createAppointment({
        patientName: form.patientName,
        patientId: form.patientId,
        date: form.date,
        time: form.time,
        type: form.type,
        notes: form.notes,
      });
      toast.success('Agendamento criado!');
      setModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar agendamento.');
    }
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await db.updateAppointment(id, { status: newStatus });
      toast.success(`Status alterado para ${newStatus}.`);
      load();
    } catch { toast.error('Erro ao atualizar status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este agendamento?')) return;
    try {
      await db.deleteAppointment(id);
      toast.success('Agendamento excluído.');
      load();
    } catch { toast.error('Erro ao excluir.'); }
  };

  const isToday = selectedDate === toDateInput(new Date());

  return (
    <div className="p-6 max-w-5xl mx-auto" data-testid="agenda-page">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="agenda-title">
            <Calendar className="h-6 w-6 text-primary" /> Agenda
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize" data-testid="agenda-date-label">
            {formatWeekday(selectedDate)}
            {isToday && <Badge variant="outline" className="ml-2 text-[10px]">Hoje</Badge>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} data-testid="agenda-prev-day">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            data-testid="agenda-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[160px]"
          />
          <Button variant="outline" size="icon" onClick={() => shiftDate(1)} data-testid="agenda-next-day">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(toDateInput(new Date()))} data-testid="agenda-today-btn">
              Hoje
            </Button>
          )}
          <Button onClick={openNew} data-testid="agenda-new-button">
            <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </header>

      {/* TABLE */}
      <Card className="bg-card" data-testid="agenda-list-card">
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Horários do Dia</CardTitle>
            <Badge variant="outline">{appointments.length} agendamento(s)</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center" data-testid="agenda-empty">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data.</p>
              <Button variant="outline" className="mt-3" onClick={openNew}>
                <Plus className="h-4 w-4 mr-1" /> Agendar Consulta
              </Button>
            </div>
          ) : (
            <Table data-testid="agenda-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="w-[110px]">Tipo</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[200px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => {
                  const st = STATUS_MAP[a.status] || STATUS_MAP.Agendado;
                  const Icon = st.icon;
                  return (
                    <TableRow key={a.id} data-testid={`appointment-row-${a.id}`}>
                      <TableCell className="font-mono font-semibold text-foreground" data-testid={`appointment-time-${a.id}`}>
                        {a.time}
                      </TableCell>
                      <TableCell data-testid={`appointment-patient-${a.id}`}>
                        <div className="font-medium text-sm">{a.patientName}</div>
                        {a.notes && <div className="text-xs text-muted-foreground truncate max-w-[250px]">{a.notes}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]" data-testid={`appointment-type-${a.id}`}>{a.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', st.color)} data-testid={`appointment-status-${a.id}`}>
                          <Icon className="h-3 w-3" /> {a.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {a.status === 'Agendado' && (
                            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => changeStatus(a.id, 'Confirmado')} data-testid={`appointment-confirm-${a.id}`}>
                              Confirmar
                            </Button>
                          )}
                          {(a.status === 'Agendado' || a.status === 'Confirmado') && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-[11px] text-green-700 border-green-200 hover:bg-green-50" onClick={() => changeStatus(a.id, 'Concluído')} data-testid={`appointment-complete-${a.id}`}>
                                Concluir
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50" onClick={() => changeStatus(a.id, 'Cancelado')} data-testid={`appointment-cancel-${a.id}`}>
                                Cancelar
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(a.id)} data-testid={`appointment-delete-${a.id}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* NEW APPOINTMENT MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[460px]" data-testid="agenda-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Novo Agendamento
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label className="text-sm">Nome do Paciente</Label>
              <Input data-testid="agenda-form-patient" className="mt-1" placeholder="Ex: Rex, Maria Silva..." value={form.patientName} onChange={(e) => setForm(p => ({ ...p, patientName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Data</Label>
                <Input data-testid="agenda-form-date" type="date" className="mt-1" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm">Hora</Label>
                <Input data-testid="agenda-form-time" type="time" className="mt-1" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-sm">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1" data-testid="agenda-form-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Observações</Label>
              <Textarea data-testid="agenda-form-notes" className="mt-1" rows={2} placeholder="Observações opcionais..." value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} data-testid="agenda-form-cancel">Cancelar</Button>
            <Button onClick={handleSave} data-testid="agenda-form-save">Salvar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
