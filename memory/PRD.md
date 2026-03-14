# NexaClinq - PRD (Product Requirements Document)

## Original Problem Statement
### Phase 1: Módulo de Receituário
Ferramenta inteligente com banco de medicamentos, cálculo de doses pelo peso e receita estruturada.

### Phase 2: Módulo Financeiro
Fluxo de Caixa simples para registrar pagamentos e despesas. 3 KPI cards, transação com toggle, tabela BRL.

### Phase 3: Dashboard + Rebranding
Dashboard "Central de Comando" + rebranding completo TVUSVET → NexaClinq.

### Phase 4: Marca D'água Premium
Logo NexaClinq como watermark sutil no fundo do Dashboard. Cards com fundos opacos para legibilidade.

## Architecture
- **Frontend**: React + RxDB (IndexedDB) + Tailwind + shadcn/ui
- **Database**: RxDB with Dexie storage (client-side IndexedDB)
- **Router**: HashRouter (`/#/` prefix)

## What's Been Implemented

### Phase 1: Prescription Module (2026-03-14)
- `drugs_db.js`, `DrugSelector.js`, `PrescriptionPage.js`

### Phase 2: Financial Module (2026-03-14)
- `FinancialModule.js` with KPIs, dialog, table

### Phase 3: Dashboard + Rebranding (2026-03-14)
- `HomePage.js` (Dashboard), `PatientsPage.js`, `Sidebar.js`, `LoginPage.js`, `index.html`

### Phase 4: Watermark (2026-03-14)
- **`logo.svg`**: New NexaClinq SVG with stethoscope icon + brand text, blue-purple gradient
- **`index.css`**: `.bg-watermark` utility class (position relative, z-index layering)
- **`HomePage.js`**: Watermark `<img>` element with `opacity: 0.035`, fixed center, pointer-events none. All Card components have explicit `bg-card` for opaque backgrounds ensuring 100% text legibility over watermark.

## Prioritized Backlog
### P1 (Next)
- [ ] Edit transactions in financial module
- [ ] Status management (pending/paid) for accounts receivable
- [ ] Drug interaction warnings / prescription templates

### P2 (Future)
- [ ] Financial reports/export (CSV/PDF)
- [ ] Appointment scheduling module
- [ ] Patient-linked transactions
