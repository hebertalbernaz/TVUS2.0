# NexaClinq - PRD (Product Requirements Document)

## Original Problem Statement
### Phase 1: Módulo de Receituário (Prescription)
Ferramenta inteligente com banco de medicamentos, cálculo de doses pelo peso e receita estruturada (Vet + Humana).

### Phase 2: Módulo Financeiro (Cash Flow)
Fluxo de Caixa simples para registrar pagamentos e despesas. 3 KPI cards, nova transação com toggle, tabela com histórico BRL.

### Phase 3: Dashboard + Rebranding
Dashboard "Central de Comando" com greeting, quick actions, métricas, pacientes recentes. Rebranding completo de TVUSVET → NexaClinq em Sidebar, LoginPage, index.html.

## Architecture
- **Frontend**: React + RxDB (IndexedDB) + Tailwind + shadcn/ui
- **Backend**: FastAPI (minimal)
- **Database**: RxDB with Dexie storage (client-side IndexedDB)
- **Router**: HashRouter (`/#/` prefix)
- **Auth**: Demo mode (auto-login)

## Routes
- `/` — Dashboard (Central de Comando)
- `/patients` — Patient List (CRUD)
- `/prescription` — Prescription Module
- `/prescription/new/:patientId` — New Prescription for patient
- `/financial` — Financial Module (Cash Flow)
- `/history/:patientId` — Patient Timeline
- `/cardio` — Cardiology Module
- `/lab` — Lab Module
- `/ophthalmo` — Ophthalmology Module
- `/settings` — Settings
- `/login` — Login Page

## What's Been Implemented

### Phase 1: Prescription Module (2026-03-14)
- `drugs_db.js`: 16 medications (8 vet + 8 human)
- `DrugSelector.js`: Calculator panel with search, auto-dose, duration
- `PrescriptionPage.js`: Prescription builder with paper preview, print, save
- ClinicalDocumentSchema v2 with 'prescription' type

### Phase 2: Financial Module (2026-03-14)
- `FinancialModule.js`: 3 KPI cards, Nova Transação dialog, shadcn Table
- Bug fix: `patient_id: null` → `''` for RxDB compliance

### Phase 3: Dashboard + Rebranding (2026-03-14)
- **`HomePage.js`**: New dashboard with greeting, 4 quick actions, 4 metrics, recent patients table, Skeleton loading
- **`PatientsPage.js`**: Extracted patient list from old HomePage to dedicated page at `/patients`
- **`Sidebar.js`**: Rebranded from TVUSVET → NexaClinq with Stethoscope icon, added Dashboard nav link, subtitle per practice
- **`LoginPage.js`**: Professional login with NexaClinq brand, Stethoscope logo, Mail/Lock icons
- **`index.html`**: Title updated to "NexaClinq - Gestão Clínica Inteligente"
- **`App.js`**: Added `/patients` route with PatientsPage

## Prioritized Backlog

### P0 (Completed)
- [x] Prescription module (drugs, calculator, print, save)
- [x] Financial module (CRUD, KPIs, table)
- [x] Dashboard (greeting, quick actions, metrics, recent patients)
- [x] Rebranding (NexaClinq everywhere)

### P1 (Next)
- [ ] Edit transactions in financial module
- [ ] Status management (pending/paid) for accounts receivable
- [ ] Drug interaction warnings
- [ ] Prescription templates

### P2 (Future)
- [ ] Financial reports/export (CSV/PDF)
- [ ] Multi-user support with role-based access
- [ ] Patient-linked transactions
- [ ] Appointment scheduling module
