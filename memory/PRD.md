# NexaClinq - PRD (Product Requirements Document)

## Original Problem Statement
Módulo de Receituário (Prescription) - Transformar o receituário de um simples campo de texto em uma ferramenta inteligente que consulta um banco de medicamentos, sugere dosagens baseadas no peso do paciente e gera uma receita estruturada. O sistema deve atender Veterinária e Humana (`useLicense().practice`).

## Architecture
- **Frontend**: React + RxDB (IndexedDB) + Tailwind + shadcn/ui
- **Backend**: FastAPI (minimal - mostly frontend-driven)
- **Database**: RxDB with Dexie storage (client-side IndexedDB)
- **Router**: HashRouter (`/#/` prefix)
- **Auth**: Demo mode (auto-login)

## User Personas
1. **Veterinarian (VET)**: Manages animal patients with weight-based dose calculations (mg/kg)
2. **Doctor (HUMAN/MD)**: Manages human patients with standard dose prescriptions

## Core Requirements
- Drug database (local in-memory) with Vet and Human medications
- Drug search filtered by practice context (vet/human)
- Dose calculator based on patient weight (mg/kg × weight)
- Volume/quantity auto-calculation from concentration
- Duration field (days, weeks, months, continuous use)
- Prescription paper preview with numbered drug list
- Print with generous top margin for pre-printed stationery
- Save to patient history (prescriptions + clinical_documents collections)
- Footer with doctor name and CRM/CRMV for signature

## What's Been Implemented (2026-03-14)

### Prescription Module (Complete)
1. **`drugs_db.js`** - 16 medications (8 vet + 8 human) with structured data: id, name, practice, concentration, baseDose, doseUnit, route, frequency
2. **`DrugSelector.js`** - Full calculator panel: search from local DB, auto-fill base dose, weight-based calculation, volume/quantity suggestion, duration field, formatted output
3. **`PrescriptionPage.js`** - Complete prescription builder: drug list management, paper preview, print (window.print), save to prescriptions + clinical_documents
4. **Schema update** - ClinicalDocumentSchema v2 with 'prescription' type in enum + migration
5. **Print CSS** - Imported print.css, fixed #printable-report screen visibility

### Verified Working Flows
- Patient creation → Prescription navigation via "Iniciar Atendimento" → "Nova Receita"
- Drug search (e.g., "Melo" → Meloxicam 2mg)
- Dose calculator: 0.1mg/kg × 10kg = 1mg → 0.50 comprimido(s)
- Add multiple drugs with duration
- Save redirects to patient history with both DOCUMENTO and RECEITA entries
- Print layout with generous top margin and signature footer

## Prioritized Backlog

### P0 (Completed)
- [x] Drug database with vet + human drugs
- [x] Drug selector with calculator
- [x] Prescription page with paper preview
- [x] Save to history
- [x] Print functionality

### P1 (Next)
- [ ] Edit existing prescriptions from history
- [ ] Controlled substance special handling (receita especial)
- [ ] Drug interaction warnings

### P2 (Future)
- [ ] Custom drug additions from within the prescription flow
- [ ] Template prescriptions (common protocols)
- [ ] Prescription PDF export (in addition to window.print)
- [ ] Multi-language support for drug names

## Next Tasks
- Polish prescription rendering in PatientHistoryPage timeline
- Add "Imprimir" button directly from history view
- Consider adding drug interaction database
