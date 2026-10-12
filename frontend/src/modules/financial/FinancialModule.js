import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Filter,
  Plus,
  Trash2,
  Wallet,
  XCircle
} from 'lucide-react';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = {
  income: ['Consultas', 'Exames', 'Procedimentos', 'Cirurgias', 'Vacinas', 'Medicamentos', 'Outros'],
  expense: ['Fornecedor', 'Aluguel', 'Salários', 'Impostos', 'Manutenção', 'Material', 'Outros']
};

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' }
];

const STATUS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'cancelled', label: 'Cancelado' }
];

const isoToDateInput = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
};

const dateInputToIso = (d) => {
  if (!d) return null;
  return new Date(`${d}T12:00:00.000Z`).toISOString();
};

const getStatusBadge = (status) => {
  if (status === 'paid') {
    return { icon: CheckCircle2, label: 'Pago', className: 'bg-green-600 text-white hover:bg-green-600' };
  }
  if (status === 'pending') {
    return { icon: Clock, label: 'Pendente', className: 'bg-amber-500 text-white hover:bg-amber-500' };
  }
  return { icon: XCircle, label: 'Cancelado', className: 'bg-muted text-foreground hover:bg-muted' };
};

export default function FinancialModule() {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`; // YYYY-MM
  });

  const { month, year } = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return { year: Number(y), month: Number(m) };
  }, [selectedMonth]);

  const [kpis, setKpis] = useState({ totalIncome: 0, totalExpense: 0, pendingForecast: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',

    status: 'paid',
    payment_method: 'cash',

    due_date: isoToDateInput(now.toISOString()),
    paid_at: isoToDateInput(now.toISOString())
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        db.getBalance({ month, year }),
        db.getTransactions({ month, year })
      ]);

      setKpis({
        totalIncome: balanceData.totalIncome || 0,
        totalExpense: balanceData.totalExpense || 0,
        pendingForecast: balanceData.pendingForecast || 0,
        balance: balanceData.balance || 0
      });
      setTransactions(transactionsData || []);
    } catch (e) {
      console.error('Error loading financial data:', e);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatShortDate = (iso) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = (typeOrTransaction) => {
    // If string => new record
    if (typeof typeOrTransaction === 'string') {
      setEditingTransaction(null);
      const baseType = typeOrTransaction;
      const today = isoToDateInput(new Date().toISOString());
      setFormData({
        type: baseType,
        category: '',
        amount: '',
        description: '',
        status: 'paid',
        payment_method: baseType === 'income' ? 'pix' : 'transfer',
        due_date: today,
        paid_at: today
      });
      setIsModalOpen(true);
      return;
    }

    // else edit
    const t = typeOrTransaction;
    setEditingTransaction(t);
    setFormData({
      type: t.type,
      category: t.category || '',
      amount: String(t.amount ?? ''),
      description: t.description || '',
      status: t.status || 'paid',
      payment_method: t.payment_method || 'cash',
      due_date: isoToDateInput(t.due_date || t.date),
      paid_at: isoToDateInput(t.paid_at || t.date)
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error('Informe um valor válido');
    }
    if (!formData.category) {
      return toast.error('Selecione uma categoria');
    }

    try {
      const dueIso = dateInputToIso(formData.due_date);
      const paidIso = formData.status === 'paid' ? dateInputToIso(formData.paid_at) : null;

      // Keep legacy date as something consistent for sorting
      const legacyDate = (formData.status === 'paid' ? paidIso : dueIso) || new Date().toISOString();

      const payload = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,

        status: formData.status,
        payment_method: formData.payment_method,
        due_date: dueIso,
        paid_at: paidIso,

        date: legacyDate
      };

      if (editingTransaction) {
        await db.updateTransaction(editingTransaction.id, payload);
        toast.success('Lançamento atualizado!');
      } else {
        await db.addTransaction(payload);
        toast.success('Lançamento registrado!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar lançamento');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    try {
      await db.deleteTransaction(id);
      toast.success('Lançamento excluído');
      loadData();
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const handleMarkAsPaid = async (t) => {
    try {
      await db.updateTransaction(t.id, { status: 'paid' });
      toast.success('Lançamento baixado como pago!');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao baixar lançamento');
    }
  };

  const monthLabel = useMemo(() => {
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [month, year]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64" data-testid="financial-loading">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="financial-page">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="financial-title">
            <Wallet className="h-6 w-6 text-primary" /> Fluxo de Caixa
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="financial-subtitle">
            {monthLabel} • Gestão profissional de entradas, saídas e pendências
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            data-testid="new-income-button"
            onClick={() => handleOpenModal('income')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Receita
          </Button>
          <Button
            data-testid="new-expense-button"
            onClick={() => handleOpenModal('expense')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Despesa
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-testid="financial-kpis">
        <Card className="border-green-200 dark:border-green-900/50" data-testid="kpi-income-paid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <ArrowUpCircle className="h-4 w-4 text-green-600" /> Entradas (Recebido)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalIncome)}</div>
            <div className="text-xs text-muted-foreground mt-1">Somente lançamentos pagos</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50" data-testid="kpi-expense-paid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <ArrowDownCircle className="h-4 w-4 text-red-600" /> Saídas (Pago)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(kpis.totalExpense)}</div>
            <div className="text-xs text-muted-foreground mt-1">Somente lançamentos pagos</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/50" data-testid="kpi-pending-forecast">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-amber-500" /> Previsão (Aberto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{formatCurrency(kpis.pendingForecast)}</div>
            <div className="text-xs text-muted-foreground mt-1">Pendente (a receber / pagar)</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions / Filters */}
      <Card className="mb-6" data-testid="financial-filters">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Mês</Label>
              <Input
                data-testid="month-filter-input"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[170px]"
              />
            </div>

            <div className="text-sm text-muted-foreground" data-testid="financial-balance-summary">
              <span className="font-semibold text-foreground">Saldo do mês:</span> {formatCurrency(kpis.balance)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card data-testid="financial-transactions">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-12 text-center" data-testid="financial-empty">
              <p className="text-muted-foreground">Nenhum lançamento encontrado para este mês.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Use “Nova Receita” ou “Nova Despesa” para começar.</p>
            </div>
          ) : (
            <ScrollArea className="h-[460px]">
              <div className="divide-y">
                {transactions.map((t) => {
                  const statusBadge = getStatusBadge(t.status || 'paid');
                  const StatusIcon = statusBadge.icon;
                  const dateLabel = t.status === 'paid' ? (t.paid_at || t.date) : (t.due_date || t.date);

                  return (
                    <div
                      key={t.id}
                      data-testid={`transaction-row-${t.id}`}
                      className="p-4 hover:bg-muted/50 transition-colors flex items-start justify-between gap-4"
                      onClick={() => handleOpenModal(t)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleOpenModal(t); }}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            'mt-0.5 p-2 rounded-full border',
                            t.type === 'income'
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
                              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
                          )}
                        >
                          {t.type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground truncate" data-testid={`transaction-category-${t.id}`}>{t.category}</span>
                            <Badge
                              data-testid={`transaction-status-badge-${t.id}`}
                              className={cn('text-[10px] gap-1', statusBadge.className)}
                            >
                              <StatusIcon className="h-3 w-3" /> {statusBadge.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]" data-testid={`transaction-type-badge-${t.id}`}>
                              {t.type === 'income' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </div>

                          {t.description ? (
                            <p className="text-sm text-muted-foreground truncate" data-testid={`transaction-description-${t.id}`}>{t.description}</p>
                          ) : null}

                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" data-testid={`transaction-date-${t.id}`}>
                            <Calendar className="h-3 w-3" />
                            {t.status === 'paid' ? 'Pago em:' : 'Vence em:'} {formatShortDate(dateLabel)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div
                          className={cn(
                            'font-bold text-lg',
                            t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )}
                          data-testid={`transaction-amount-${t.id}`}
                        >
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </div>

                        <div className="flex gap-1">
                          {t.status === 'pending' ? (
                            <Button
                              data-testid={`transaction-mark-paid-${t.id}`}
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleMarkAsPaid(t)}
                            >
                              Baixar
                            </Button>
                          ) : null}

                          <Button
                            data-testid={`transaction-edit-${t.id}`}
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9"
                            onClick={() => handleOpenModal(t)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            data-testid={`transaction-delete-${t.id}`}
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-destructive"
                            onClick={() => handleDeleteTransaction(t.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[520px]" data-testid="financial-transaction-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {editingTransaction ? 'Editar Lançamento' : (formData.type === 'income' ? 'Nova Receita' : 'Nova Despesa')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Type (readonly-ish) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tipo</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Badge variant="outline" data-testid="financial-form-type">
                  {formData.type === 'income' ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => {
                  setFormData((p) => ({
                    ...p,
                    status: val,
                    // When becoming pending, clear paid_at
                    paid_at: val === 'paid' ? p.paid_at : ''
                  }));
                }}
              >
                <SelectTrigger className="col-span-3" data-testid="financial-form-status">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Categoria</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData((p) => ({ ...p, category: val }))}>
                <SelectTrigger className="col-span-3" data-testid="financial-form-category">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(CATEGORIES[formData.type] || []).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Valor (R$)</Label>
              <Input
                data-testid="financial-form-amount"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pagamento</Label>
              <Select value={formData.payment_method} onValueChange={(val) => setFormData((p) => ({ ...p, payment_method: val }))}>
                <SelectTrigger className="col-span-3" data-testid="financial-form-payment-method">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Vencimento</Label>
              <Input
                data-testid="financial-form-due-date"
                type="date"
                className="col-span-3"
                value={formData.due_date}
                onChange={(e) => setFormData((p) => ({ ...p, due_date: e.target.value }))}
              />
            </div>

            {/* Paid at */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pago em</Label>
              <Input
                data-testid="financial-form-paid-at"
                type="date"
                className="col-span-3"
                disabled={formData.status !== 'paid'}
                value={formData.paid_at}
                onChange={(e) => setFormData((p) => ({ ...p, paid_at: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Descrição</Label>
              <Textarea
                data-testid="financial-form-description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Ex: consulta do paciente, mensalidade, aluguel, etc."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button data-testid="financial-form-cancel" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              data-testid="financial-form-save"
              onClick={handleSaveTransaction}
              className={cn(formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
