# NexaClinq - PRD (Product Requirements Document)

## Original Problem Statement
### Phase 1: Módulo de Receituário (Prescription)
Transformar o receituário em ferramenta inteligente com banco de medicamentos, cálculo de doses pelo peso e receita estruturada (Vet + Humana).

### Phase 2: Módulo Financeiro (Cash Flow)
Fluxo de Caixa simples, rápido e visual para registrar pagamentos de consultas/exames e pequenas despesas. 3 KPI cards, formulário de nova transação com toggle receita/despesa, tabela com histórico formatado em BRL.

## Architecture
- **Frontend**: React + RxDB (IndexedDB) + Tailwind + shadcn/ui
- **Backend**: FastAPI (minimal - mostly frontend-driven)
- **Database**: RxDB with Dexie storage (client-side IndexedDB)
- **Router**: HashRouter (`/#/` prefix)
- **Auth**: Demo mode (auto-login)

## User Personas
1. **Veterinarian (VET)**: Manages animal patients with weight-based dose calculations (mg/kg)
2. **Doctor (HUMAN/MD)**: Manages human patients with standard dose prescriptions
3. **Receptionist**: Registers payments and small expenses

## What's Been Implemented

### Phase 1: Prescription Module (2026-03-14)
1. **`drugs_db.js`**: 16 medications (8 vet + 8 human) with structured data
2. **`DrugSelector.js`**: Calculator panel with search, auto-dose, duration, formatted output
3. **`PrescriptionPage.js`**: Prescription builder with paper preview, print, save to history
4. **Schema**: ClinicalDocumentSchema v2 with 'prescription' type
5. **Print**: Imported print.css, fixed #printable-report visibility, generous top margin

### Phase 2: Financial Module (2026-03-14)
1. **`FinancialModule.js`**: Complete refactor with:
   - 3 KPI cards: Receitas Totais (green), Despesas Totais (red), Saldo Líquido
   - Single "Nova Transação" button with Dialog
   - Visual toggle income/expense (green/red buttons)
   - Form: Tipo, Categoria, Valor (R$), Método de Pagamento, Data, Descrição
   - Proper shadcn `<Table>` with columns: Data, Descrição, Categoria, Método, Valor
   - Conditional formatting: green for income, red for expense
   - Delete button per row with confirmation
   - Month filter
2. **Bug fix**: `database.js` - `patient_id: null` → `patient_id: ''` for RxDB schema compliance
3. **Testing**: 100% pass rate - all features verified E2E

## Prioritized Backlog

### P0 (Completed)
- [x] Drug database + selector + calculator
- [x] Prescription page with print/save
- [x] Financial KPI dashboard
- [x] Transaction CRUD (create/read/delete)
- [x] Month filter + BRL formatting

### P1 (Next)
- [ ] Edit existing transactions (was in old version, simplified out)
- [ ] Status management (pending/paid/cancelled) for accounts receivable
- [ ] Controlled substance special handling (receita especial)
- [ ] Drug interaction warnings

### P2 (Future)
- [ ] Financial reports/export (CSV/PDF)
- [ ] Template prescriptions (common protocols)
- [ ] Prescription PDF export
- [ ] Patient-linked transactions (vincular consulta ao paciente)

## Next Tasks
- Restore edit transaction capability if user requests
- Add pending/forecast status tracking back if needed
- Polish prescription rendering in PatientHistoryPage timeline
