import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserPlus,
  FileText,
  Pill,
  DollarSign,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  Scale,
  ChevronRight,
  Stethoscope,
  Calendar,
  Clock,
  Coffee,
} from 'lucide-react';
import { db } from '@/services/database';
import { useLicense } from '@/contexts/LicenseContext';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomePage() {
  const { terms, practice } = useLicense();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [todayAppts, setTodayAppts] = useState([]);
  const [metrics, setMetrics] = useState({ totalPatients: 0, monthIncome: 0, monthExpense: 0, balance: 0 });

  const activeScope = practice === 'human' ? 'HUMAN' : 'VET';

  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().slice(0, 10);
      const [allPatients, balanceData, appts] = await Promise.all([
        db.getPatients({ scope: activeScope }),
        db.getBalance({ month, year }),
        db.getAppointments({ date: todayStr }),
      ]);

      // Sort by latest created (assuming IDs are roughly chronological or there's a created_at)
      const sorted = [...allPatients].sort((a, b) => {
        const da = a.created_at || a.id;
        const db2 = b.created_at || b.id;
        return db2 > da ? 1 : -1;
      });

      setPatients(sorted.slice(0, 5));
      setTodayAppts(appts || []);
      setMetrics({
        totalPatients: allPatients.length,
        monthIncome: balanceData.totalIncome || 0,
        monthExpense: balanceData.totalExpense || 0,
        balance: balanceData.balance || 0,
      });
    } catch (e) {
      console.error('[Dashboard] loadDashboard FAILED:', e);
    } finally {
      setLoading(false);
    }
  }, [activeScope, month, year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const greeting = getGreeting();
  const contextLabel = practice === 'vet' ? 'Veterinário(a)' : 'Doutor(a)';
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const quickActions = [
    {
      id: 'new-patient',
      label: `Novo ${terms?.patient_label || 'Paciente'}`,
      icon: UserPlus,
      path: '/patients',
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
    },
    {
      id: 'clinical',
      label: 'Atendimento',
      icon: Stethoscope,
      path: '/patients',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
    },
    {
      id: 'prescription',
      label: 'Receituário',
      icon: Pill,
      path: '/prescription',
      color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/50',
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: DollarSign,
      path: '/financial',
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-watermark min-h-screen" data-testid="dashboard-page">
      {/* Watermark logo */}
      <img
        src={`${process.env.PUBLIC_URL}/logo.svg`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 m-auto"
        style={{ width: '45%', maxWidth: 520, opacity: 0.035, zIndex: 0 }}
        data-testid="dashboard-watermark"
      />
      {/* ═══ GREETING ═══ */}
      <header className="mb-8" data-testid="dashboard-greeting">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {contextLabel}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Central de Comando &bull; {monthLabel}
        </p>
      </header>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="dashboard-quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            data-testid={`quick-action-${action.id}`}
            onClick={() => navigate(action.path)}
            className={`group flex flex-col items-center gap-3 p-5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${action.color}`}
          >
            <action.icon className="h-7 w-7" />
            <span className="text-sm font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ METRICS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="dashboard-metrics">
        {loading ? (
          <>
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4 bg-card" data-testid="metric-total-patients">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" /> Total de {terms?.patient_label || 'Paciente'}s
              </div>
              <div className="text-2xl font-bold text-foreground">{metrics.totalPatients}</div>
            </Card>

            <Card className="p-4 bg-card" data-testid="metric-month-income">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ArrowUpCircle className="h-4 w-4 text-green-600" /> Receitas do Mês
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.monthIncome)}</div>
            </Card>

            <Card className="p-4 bg-card" data-testid="metric-month-expense">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ArrowDownCircle className="h-4 w-4 text-red-600" /> Despesas do Mês
              </div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.monthExpense)}</div>
            </Card>

            <Card className="p-4 bg-card" data-testid="metric-balance">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Scale className="h-4 w-4 text-primary" /> Saldo Líquido
              </div>
              <div className={`text-2xl font-bold ${metrics.balance >= 0 ? 'text-primary' : 'text-amber-500'}`}>
                {formatCurrency(metrics.balance)}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ═══ AGENDA DE HOJE ═══ */}
      <Card className="bg-card mb-8" data-testid="dashboard-today-agenda">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agenda de Hoje
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/agenda')}
              data-testid="dashboard-see-agenda"
            >
              Ver Agenda <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-14 rounded" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                </div>
              ))}
            </div>
          ) : todayAppts.length === 0 ? (
            <div className="p-10 text-center" data-testid="dashboard-no-appointments">
              <Coffee className="h-9 w-9 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum paciente agendado para hoje.</p>
              <p className="text-muted-foreground/60 text-xs mt-0.5">Aproveite o café!</p>
            </div>
          ) : (
            <div className="divide-y" data-testid="dashboard-today-appointments-list">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-6 py-3" data-testid={`today-appt-${a.id}`}>
                  <div className="font-mono text-sm font-semibold text-primary w-14 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {a.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground">{a.patientName}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{a.type}</Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      a.status === 'Confirmado' ? 'border-emerald-300 text-emerald-700' :
                      a.status === 'Concluído' ? 'border-zinc-300 text-zinc-500' :
                      a.status === 'Cancelado' ? 'border-red-300 text-red-600 line-through' :
                      'border-blue-300 text-blue-700'
                    }`}
                  >
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ RECENT PATIENTS ═══ */}
      <Card className="bg-card" data-testid="dashboard-recent-patients">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {terms?.patient_label || 'Paciente'}s Recentes
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patients')}
              data-testid="dashboard-see-all-patients"
            >
              Ver Todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center" data-testid="dashboard-no-patients">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum {(terms?.patient_label || 'paciente').toLowerCase()} cadastrado.</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => navigate('/patients')}
                data-testid="dashboard-create-first-patient"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Cadastrar Primeiro
              </Button>
            </div>
          ) : (
            <Table data-testid="dashboard-patients-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {practice === 'vet' && <TableHead className="w-[100px]">Espécie</TableHead>}
                  {practice === 'vet' && <TableHead className="w-[100px]">Peso</TableHead>}
                  {practice === 'human' && <TableHead className="w-[100px]">Idade</TableHead>}
                  <TableHead className="w-[130px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id} data-testid={`recent-patient-${p.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {p.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{p.name}</div>
                          {practice === 'vet' && p.owner_name && (
                            <div className="text-xs text-muted-foreground">{terms?.owner_label || 'Tutor'}: {p.owner_name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {practice === 'vet' && (
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {p.species === 'dog' ? 'Canino' : p.species === 'cat' ? 'Felino' : p.species || '--'}
                        </Badge>
                      </TableCell>
                    )}
                    {practice === 'vet' && (
                      <TableCell className="text-sm text-muted-foreground">
                        {p.weight ? `${p.weight} kg` : '--'}
                      </TableCell>
                    )}
                    {practice === 'human' && (
                      <TableCell className="text-sm text-muted-foreground">
                        {p.birth_year ? `${new Date().getFullYear() - parseInt(p.birth_year)} anos` : '--'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/history/${p.id}`)}
                        data-testid={`patient-history-btn-${p.id}`}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" /> Prontuário
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
