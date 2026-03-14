import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Plus,
  Scale,
  Trash2,
  Wallet,
} from 'lucide-react';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = {
  income: [
    'Consulta',
    'Exame',
    'Procedimento',
    'Cirurgia',
    'Vacina',
    'Medicamento',
    'Outros',
  ],
  expense: [
    'Despesa Administrativa',
    'Fornecedor',
    'Aluguel',
    'Salários',
    'Impostos',
    'Manutenção',
    'Material',
    'Outros',
  ],
};

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' },
];

const PAYMENT_LABELS = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label]));

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const formatShortDate = (iso) => {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('pt-BR');
};

const isoToDateInput = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return ''; }
};

const dateInputToIso = (d) => {
  if (!d) return null;
  return new Date(`${d}T12:00:00.000Z`).toISOString();
};

const EMPTY_FORM = {
  type: 'income',
  category: '',
  amount: '',
  description: '',
  payment_method: 'pix',
  date: isoToDateInput(new Date().toISOString()),
};

export default function FinancialModule() {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const { month, year } = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return { year: Number(y), month: Number(m) };
  }, [selectedMonth]);

  const [kpis, setKpis] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        db.getBalance({ month, year }),
        db.getTransactions({ month, year }),
      ]);
      setKpis({
        totalIncome: balanceData.totalIncome || 0,
        totalExpense: balanceData.totalExpense || 0,
        balance: balanceData.balance || 0,
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

  const handleOpenModal = () => {
    setFormData({ ...EMPTY_FORM, date: isoToDateInput(new Date().toISOString()) });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error('Informe um valor válido.');
    }
    if (!formData.category) {
      return toast.error('Selecione uma categoria.');
    }

    try {
      const dateIso = dateInputToIso(formData.date) || new Date().toISOString();
      await db.addTransaction({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        payment_method: formData.payment_method,
        date: dateIso,
        status: 'paid',
        due_date: dateIso,
        paid_at: dateIso,
      });
      toast.success('Lançamento registrado!');
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar lançamento.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    try {
      await db.deleteTransaction(id);
      toast.success('Lançamento excluído.');
      loadData();
    } catch {
      toast.error('Erro ao excluir.');
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
      {/* ═══ HEADER ═══ */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            data-testid="financial-title"
          >
            <Wallet className="h-6 w-6 text-primary" /> Fluxo de Caixa
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="financial-subtitle">
            {monthLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="month-filter-input"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[170px]"
            />
          </div>
          <Button data-testid="new-transaction-button" onClick={handleOpenModal}>
            <Plus className="h-4 w-4 mr-2" /> Nova Transação
          </Button>
        </div>
      </header>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-testid="financial-kpis">
        {/* Receitas Totais */}
        <Card className="border-green-200 dark:border-green-900/50" data-testid="kpi-income">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <ArrowUpCircle className="h-4 w-4 text-green-600" /> Receitas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="kpi-income-value">
              {formatCurrency(kpis.totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Entradas do mês</div>
          </CardContent>
        </Card>

        {/* Despesas Totais */}
        <Card className="border-red-200 dark:border-red-900/50" data-testid="kpi-expense">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <ArrowDownCircle className="h-4 w-4 text-red-600" /> Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="kpi-expense-value">
              {formatCurrency(kpis.totalExpense)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Saídas do mês</div>
          </CardContent>
        </Card>

        {/* Saldo Líquido */}
        <Card
          className={cn(
            'border',
            kpis.balance >= 0
              ? 'border-primary/30 dark:border-primary/20'
              : 'border-amber-300 dark:border-amber-900/50'
          )}
          data-testid="kpi-balance"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Scale className="h-4 w-4 text-primary" /> Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                kpis.balance >= 0 ? 'text-primary' : 'text-amber-500'
              )}
              data-testid="kpi-balance-value"
            >
              {formatCurrency(kpis.balance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Receitas - Despesas</div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ TRANSACTIONS TABLE ═══ */}
      <Card data-testid="financial-transactions-card">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lançamentos</CardTitle>
            <Badge variant="outline">{transactions.length} registro(s)</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-12 text-center" data-testid="financial-empty">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum lançamento neste mês.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Clique em "Nova Transação" para registrar.
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <Table data-testid="financial-transactions-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[140px]">Categoria</TableHead>
                    <TableHead className="w-[140px]">Método</TableHead>
                    <TableHead className="w-[130px] text-right">Valor</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} data-testid={`transaction-row-${t.id}`}>
                      <TableCell
                        className="text-sm text-muted-foreground"
                        data-testid={`transaction-date-${t.id}`}
                      >
                        {formatShortDate(t.paid_at || t.due_date || t.date)}
                      </TableCell>
                      <TableCell data-testid={`transaction-description-${t.id}`}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'p-1 rounded-full',
                              t.type === 'income'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}
                          >
                            {t.type === 'income' ? (
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownCircle className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="text-sm truncate max-w-[250px]">
                            {t.description || t.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`transaction-category-${t.id}`}>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {t.category}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground"
                        data-testid={`transaction-method-${t.id}`}
                      >
                        {PAYMENT_LABELS[t.payment_method] || t.payment_method || '--'}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`transaction-amount-${t.id}`}>
                        <span
                          className={cn(
                            'font-semibold',
                            t.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          data-testid={`transaction-delete-${t.id}`}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(t.id)}
                          title="Excluir lançamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ NEW TRANSACTION MODAL ═══ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]" data-testid="financial-transaction-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Nova Transação
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Type Toggle */}
            <div>
              <Label className="text-sm mb-2 block">Tipo</Label>
              <div className="flex gap-2" data-testid="financial-form-type-toggle">
                <button
                  type="button"
                  data-testid="financial-form-type-income"
                  onClick={() =>
                    setFormData((p) => ({ ...p, type: 'income', category: '' }))
                  }
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium border transition-all',
                    formData.type === 'income'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-background text-muted-foreground border-border hover:border-green-400'
                  )}
                >
                  <ArrowUpCircle className="h-4 w-4" /> Receita (Entrada)
                </button>
                <button
                  type="button"
                  data-testid="financial-form-type-expense"
                  onClick={() =>
                    setFormData((p) => ({ ...p, type: 'expense', category: '' }))
                  }
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium border transition-all',
                    formData.type === 'expense'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-background text-muted-foreground border-border hover:border-red-400'
                  )}
                >
                  <ArrowDownCircle className="h-4 w-4" /> Despesa (Saída)
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData((p) => ({ ...p, category: val }))}
              >
                <SelectTrigger className="mt-1" data-testid="financial-form-category">
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {(CATEGORIES[formData.type] || []).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label className="text-sm">Valor (R$)</Label>
              <Input
                data-testid="financial-form-amount"
                type="number"
                step="0.01"
                min="0"
                className="mt-1"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm">Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, payment_method: val }))
                }
              >
                <SelectTrigger className="mt-1" data-testid="financial-form-payment-method">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <Label className="text-sm">Data</Label>
              <Input
                data-testid="financial-form-date"
                type="date"
                className="mt-1"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm">Descrição</Label>
              <Textarea
                data-testid="financial-form-description"
                className="mt-1"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Ex: Consulta do paciente Rex, pagamento de aluguel..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              data-testid="financial-form-cancel"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              data-testid="financial-form-save"
              onClick={handleSave}
              className={cn(
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700',
                'text-white'
              )}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
