import React, { useState, useEffect } from 'react';
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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2,
  Edit,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { db } from '@/services/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = {
  income: ['Consulta', 'Exame', 'Procedimento', 'Cirurgia', 'Vacina', 'Medicamento', 'Outro'],
  expense: ['Fornecedor', 'Aluguel', 'Salário', 'Impostos', 'Manutenção', 'Material', 'Outro']
};

export default function FinancialModule() {
  const [balance, setBalance] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
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
    date: new Date().toISOString().split('T')[0]
  });
  
  // Filters
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        db.getBalance(),
        db.getTransactions()
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (e) {
      console.error('Error loading financial data:', e);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        date: transaction.date.split('T')[0]
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return toast.error('Informe um valor válido');
    }
    if (!formData.category) {
      return toast.error('Selecione uma categoria');
    }

    try {
      const data = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString()
      };

      if (editingTransaction) {
        await db.updateTransaction(editingTransaction.id, data);
        toast.success('Transação atualizada!');
      } else {
        await db.addTransaction(data);
        toast.success('Transação registrada!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar transação');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Excluir esta transação?')) return;
    try {
      await db.deleteTransaction(id);
      toast.success('Transação excluída');
      loadData();
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" /> Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de receitas e despesas da clínica
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Transação
        </Button>
      </header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Income */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Total Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(balance.totalIncome)}
            </p>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {formatCurrency(balance.totalExpense)}
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className={cn(
          "bg-gradient-to-br border",
          balance.balance >= 0 
            ? "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"
            : "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "text-sm font-medium flex items-center gap-2",
              balance.balance >= 0 
                ? "text-blue-800 dark:text-blue-300" 
                : "text-orange-800 dark:text-orange-300"
            )}>
              <DollarSign className="h-4 w-4" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              balance.balance >= 0 
                ? "text-blue-700 dark:text-blue-400" 
                : "text-orange-700 dark:text-orange-400"
            )}>
              {formatCurrency(balance.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transações Recentes</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma transação registrada.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Clique em &quot;Nova Transação&quot; para começar.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {filteredTransactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        transaction.type === 'income' 
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {transaction.type === 'income' 
                          ? <TrendingUp className="h-4 w-4" />
                          : <TrendingDown className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.category}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-bold text-lg",
                        transaction.type === 'income' 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                          onClick={() => handleOpenModal(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tipo</Label>
              <div className="col-span-3 flex gap-2">
                <Button 
                  type="button"
                  size="sm"
                  className={cn(
                    "flex-1",
                    formData.type === 'income' 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  onClick={() => setFormData({...formData, type: 'income', category: ''})}
                >
                  <TrendingUp className="h-4 w-4 mr-1" /> Receita
                </Button>
                <Button 
                  type="button"
                  size="sm"
                  className={cn(
                    "flex-1",
                    formData.type === 'expense' 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                >
                  <TrendingDown className="h-4 w-4 mr-1" /> Despesa
                </Button>
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES[formData.type].map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Valor (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                className="col-span-3" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder="0,00"
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Data</Label>
              <Input 
                type="date"
                className="col-span-3" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Descrição</Label>
              <Textarea 
                className="col-span-3" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Opcional..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSaveTransaction}
              className={formData.type === 'income' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
