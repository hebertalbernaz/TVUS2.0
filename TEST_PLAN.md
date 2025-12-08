# TVUSVET V2 - Test Plan (Critical Path Validation)

**Version:** Release Candidate  
**Database:** `tvusvet_db_v7`  
**Date:** August 2025  

---

## Pre-Test Setup

### Step 0: Populate Test Database
1. Login to the application
2. In the Sidebar, locate the **DEV TOOLS** panel (yellow box)
3. Click **"⚡ POPULATE DB"** button
4. Verify toast message: "DB Populated! X items inserted"
5. Confirm DB Stats show:
   - Patients: ≥5
   - Drugs: ≥20
   - Exams: 0 (fresh start)

---

## Test 1: The "Schrödinger Patient" (Mode Switching)

**Objective:** Verify patient filtering based on practice mode (Vet vs Human)

### Steps:
1. ✅ Ensure you're in **VET mode** (check header says "Veterinary")
2. ✅ Go to **Pacientes** (Patient list)
3. ✅ Verify you can see:
   - "Rex" (Labrador Retriever)
   - "Mia" (SRD Cat)
   - "Thor" (Golden Retriever)
4. ✅ **Switch to HUMAN mode** using Dev Switcher (MD button)
5. ✅ Verify:
   - Rex, Mia, Thor **DISAPPEAR** from the list
   - "Carlos Eduardo Mendes" **APPEARS**
   - "Ana Beatriz Costa" **APPEARS**
6. ✅ **Switch back to VET mode**
7. ✅ Verify Rex, Mia, Thor **REAPPEAR**

### Expected Result:
- [ ] Patients are correctly filtered by `practice` field
- [ ] Mode switch is instant (no page reload needed)
- [ ] No console errors during switch

---

## Test 2: The "Smart Prescription" (Weight-Based Calculation)

**Objective:** Verify mg/kg calculation for vet prescriptions

### Steps:
1. ✅ Ensure you're in **VET mode**
2. ✅ Find patient **"Rex"** (Labrador, 32.5kg)
3. ✅ Click the **dropdown menu** (⋮) on Rex's card
4. ✅ Select **"Nova Receita"**
5. ✅ In the prescription form:
   - Search for drug: **"Doxiciclina 100mg"**
   - Select it from the list
6. ✅ Check the dosage field shows:
   - Template: `10mg/kg VO a cada 12h por 21 dias`
7. ✅ **VERIFY CALCULATION:**
   - Total dose = 10mg × 32.5kg = **325mg**
   - Look for calculated dose display
8. ✅ Add to prescription and save

### Expected Result:
- [ ] Drug list shows only **VET drugs** (type: 'vet')
- [ ] Dosage template with "mg/kg" triggers calculator
- [ ] Calculated dose: **325mg per dose**
- [ ] Prescription saved successfully

---

## Test 3: The "Ophthalmo Drawing" (Canvas Persistence)

**Objective:** Verify eye fundus drawings are saved and persist

### Steps:
1. ✅ **Switch to HUMAN mode** (MD)
2. ✅ Go to **"Oftalmo Pro"** module
3. ✅ Click **"Novo Exame"** (New Exam)
4. ✅ Select patient **"Carlos Eduardo Mendes"**
5. ✅ In the **Olho Direito (OD)** tab:
   - Click **"Desenhar Fundoscopia (OD)"**
   - Draw something recognizable (e.g., a circle, X mark)
   - Click **Save**
6. ✅ Verify the thumbnail appears in the form
7. ✅ Go to **Conclusão** tab:
   - Add diagnosis: "Fundo de olho normal AO"
8. ✅ Click **"Salvar"** (Save as draft)
9. ✅ **CLOSE** the exam (click another exam or refresh)
10. ✅ **RE-OPEN** the same exam
11. ✅ Go to **OD tab**

### Expected Result:
- [ ] Drawing thumbnail is **STILL VISIBLE**
- [ ] Canvas editor shows the **SAME drawing** when opened
- [ ] Fundoscopy data persists in RxDB

---

## Test 4: The "Financial Balance" (Real-Time Update)

**Objective:** Verify financial dashboard updates instantly

### Steps:
1. ✅ Go to **"Financeiro"** module
2. ✅ Note the current values:
   - Total Receitas (Income): R$ ______
   - Total Despesas (Expenses): R$ ______
   - Saldo (Balance): R$ ______
3. ✅ **Expected initial values** (from test seeds):
   - Income: R$ 1,730.00 (180 + 350 + 1200)
   - Expenses: R$ 1,170.00 (850 + 320)
   - Balance: R$ 560.00
4. ✅ Click **"Nova Transação"**
5. ✅ Add new expense:
   - Type: **Despesa**
   - Category: **Material**
   - Amount: **500.00**
   - Description: "Teste de atualização"
6. ✅ Click **Save**

### Expected Result:
- [ ] New expense appears in the transaction list
- [ ] **Total Despesas** updates to: **R$ 1,670.00**
- [ ] **Saldo** updates to: **R$ 60.00**
- [ ] Update is **INSTANT** (no refresh needed)

---

## Test 5: The "Report Print" (DOCX/PDF Generation)

**Objective:** Verify ophthalmo report correctly separates OD/OS findings

### Steps:
1. ✅ Go to **"Oftalmo Pro"** module
2. ✅ Open the exam created in Test 3 (Carlos Eduardo)
3. ✅ Fill in additional data if needed:
   - **OD (Right Eye):**
     - Visual Acuity: 20/20
     - IOP: 14
     - Click "Normal" button to fill biomicroscopy/fundoscopy
   - **OS (Left Eye):**
     - Visual Acuity: 20/25
     - IOP: 16
     - Diagnosis: "Suspeita de glaucoma inicial"
4. ✅ Click **"Finalizar"** (Finalize)
5. ✅ Click **"Visualizar"** (Print Preview)

### Expected Result:
- [ ] Report opens in full-screen view
- [ ] Header shows clinic info
- [ ] Patient info is correct
- [ ] **OD section** shows:
   - "Olho Direito (OD)" header
   - Visual Acuity: 20/20
   - IOP: 14 mmHg
   - Biomicroscopy findings
   - Fundoscopy findings
- [ ] **OS section** shows:
   - "Olho Esquerdo (OS)" header
   - Visual Acuity: 20/25
   - IOP: 16 mmHg
   - Different diagnosis text
- [ ] Signature area at bottom
- [ ] Print button works (opens system print dialog)

---

## Test 6: Drug Manager (CRUD Operations)

**Objective:** Verify drug database management works independently

### Steps:
1. ✅ Go to **"Banco de Medicamentos"** (Sidebar)
2. ✅ Verify:
   - List shows drugs filtered by current practice mode
   - In VET mode: Shows vet drugs (Doxiciclina, Meloxicam, etc.)
   - Search works
3. ✅ Click **"Novo Medicamento"**
4. ✅ Add a test drug:
   - Name: "TestDrug 999mg"
   - Type: Current practice type
   - Dosage: "1 test dose"
5. ✅ Save
6. ✅ Find the new drug in the list
7. ✅ Edit it (change dosage)
8. ✅ Delete it

### Expected Result:
- [ ] Drug CRUD operations work
- [ ] No prescription creation UI in this module
- [ ] Info banner explains how to create prescriptions

---

## Test 7: Laboratory Module (Lab Vet)

**Objective:** Verify lab panel presets and auto-flagging

### Steps:
1. ✅ Switch to **VET mode**
2. ✅ Go to **"Laboratório"** module
3. ✅ Click **"Novo Exame"**
4. ✅ Select patient **"Rex"** (Dog)
5. ✅ Click **"Hemograma Completo"** panel preset
6. ✅ Verify:
   - Form populates with DOG reference values
   - Categories: Eritrograma, Leucograma, Plaquetograma
7. ✅ Enter test value:
   - Eritrócitos: **4.0** (below normal 5.5-8.5)
8. ✅ Verify **LOW flag** appears (blue indicator)
9. ✅ Enter another value:
   - Leucócitos: **20000** (above normal 6000-17000)
10. ✅ Verify **HIGH flag** appears (red indicator)

### Expected Result:
- [ ] Panel presets auto-fill reference values by species
- [ ] Auto-flagging works in real-time
- [ ] Blue = Low, Red = High, Green = Normal

---

## Summary Checklist

| Test | Description | Status |
|------|-------------|--------|
| 0 | Database Seeding | ⬜ |
| 1 | Mode Switching (Schrödinger Patient) | ⬜ |
| 2 | Smart Prescription (mg/kg) | ⬜ |
| 3 | Ophthalmo Drawing Persistence | ⬜ |
| 4 | Financial Balance Update | ⬜ |
| 5 | Report Print (OD/OS) | ⬜ |
| 6 | Drug Manager CRUD | ⬜ |
| 7 | Lab Module Auto-Flagging | ⬜ |

---

## Known Limitations

1. **DOCX Export:** Currently uses browser print. Future: docx.js integration.
2. **Offline Sync:** RxDB stores locally. No cloud sync implemented.
3. **Image Storage:** Eye drawings stored as Base64 (may increase DB size).

---

## Bug Report Template

If a test fails, report using this format:

```markdown
### Bug: [Short Description]

**Test:** #X - [Test Name]
**Step:** [Which step failed]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Any JS errors]
**Screenshot:** [If applicable]
```

---

**Tested By:** _______________  
**Date:** _______________  
**Overall Result:** ⬜ PASS / ⬜ FAIL
