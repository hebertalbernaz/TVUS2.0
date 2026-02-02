# Database Recovery & Deadlock Resolution Guide

## Executive Summary

This guide documents the complete recovery process for database validation errors and UI crashes. All critical fixes have been implemented to prevent schema validation failures and provide emergency recovery tools.

---

## Critical Issues Resolved

### 1. Schema Validation Violations ✅ FIXED

**Problem:** PatientForm was potentially sending invalid data types to RxDB.

**Root Cause:**
- RxDB schema expects `weight: { type: 'number' }` but could receive `null` or empty string
- RxDB schema expects `birth_year: { type: 'string' }` but could receive `null`

**Solution Implemented:**
- PatientForm now ONLY sends `weight` field if value is valid number > 0
- PatientForm now ONLY sends `birth_year` field if value is valid 4-digit string
- Enhanced validation prevents `null` or `undefined` from reaching database
- Empty optional fields are omitted entirely from the data object

**Files Modified:**
- `frontend/src/components/PatientForm.js:110-124` - Conditional field inclusion
- `frontend/src/components/PatientForm.js:145-172` - Enhanced error logging

### 2. Sidebar Crash Prevention ✅ FIXED

**Problem:** Sidebar crashes when accessing `terms.patient_label` before LicenseContext loads.

**Root Cause:**
- `terms` object may be `null` or `undefined` during initial render
- Direct property access causes "Cannot read property 'patient_label' of undefined"

**Solution Implemented:**
- Added defensive programming with optional chaining
- Fallback values for all label fields
- Sidebar now renders safely even if context not loaded

**Files Modified:**
- `frontend/src/components/ui/Sidebar.js:23-24` - Added fallback label
- `frontend/src/components/PatientForm.js:14-23` - Added labels object with fallbacks

### 3. Emergency Database Reset Function ✅ IMPLEMENTED

**Problem:** Corrupted IndexedDB or schema conflicts prevent app from functioning.

**Solution Implemented:**
- Global `window.resetDB()` function available in browser console
- Complete database destruction and reload
- User-friendly confirmation dialogs
- Automatic page reload after reset

**Files Modified:**
- `frontend/src/core/database/db.js:247-317` - Emergency reset function
- `frontend/src/components/DevToolbar.js:226-282` - UI-based reset button

---

## Emergency Recovery Procedures

### Scenario 1: "Database seems disconnected" or "No patients showing"

**Symptoms:**
- HomePage shows empty list despite having created patients
- Console shows RxDB errors
- Data not persisting after page reload

**Recovery Steps:**

1. **Check Console Errors**
   ```
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors with [HomePage] or [DB] prefix
   - Check for schema validation errors
   ```

2. **Use Emergency Reset (Console Method)**
   ```javascript
   // Type this in browser console:
   window.resetDB()

   // Confirm in the popup dialog
   // Page will reload automatically
   ```

3. **Use Emergency Reset (UI Method)**
   ```
   - Navigate to Settings (gear icon)
   - Click "Dev Tools" tab
   - Click "RESET DATABASE (Nuclear)" button
   - Type "RESET DATABASE" in the prompt
   - Page will reload automatically
   ```

4. **Manual Reset (If Functions Fail)**
   ```
   - Open DevTools (F12)
   - Go to Application tab
   - Expand IndexedDB in left sidebar
   - Right-click "tvusvet_db_v9"
   - Select "Delete database"
   - Reload page (Ctrl+R or Cmd+R)
   ```

### Scenario 2: "Sidebar not showing" or "White screen crash"

**Symptoms:**
- App shows blank screen
- Console shows "Cannot read property of undefined"
- React error boundary triggered

**Recovery Steps:**

1. **Hard Refresh**
   ```
   - Windows/Linux: Ctrl+Shift+R
   - Mac: Cmd+Shift+R
   - This clears service worker cache
   ```

2. **Clear Browser Cache**
   ```
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear for "Last hour"
   - Close and reopen browser
   ```

3. **Check Context Providers**
   ```
   - Open DevTools Console
   - Look for AuthContext or LicenseContext errors
   - Verify user is logged in
   ```

### Scenario 3: "Error saving patient" or "Schema validation error"

**Symptoms:**
- Toast notification shows "Erro ao salvar paciente"
- Console shows schema validation error
- Form submission fails

**Recovery Steps:**

1. **Check Error Details**
   ```
   - Open Console (F12)
   - Look for "[PatientForm] ❌ SAVE FAILED"
   - Read the error.parameters or error.message
   ```

2. **Common Validation Issues:**
   ```
   a) Invalid weight value
      → Solution: Use only numbers (e.g., 15.5, not "15kg")

   b) Invalid birth year
      → Solution: Use 4-digit year (e.g., 2020, not "20")

   c) Schema version conflict
      → Solution: Use window.resetDB() to clear old data
   ```

3. **Reset Database If Persistent**
   ```javascript
   window.resetDB()
   ```

---

## Schema Version Information

### Current Schema Versions

| Collection | Version | Key Fields | Migration Strategy |
|------------|---------|------------|-------------------|
| patients | 2 | id, name, scope | Auto-add scope field |
| settings | 2 | id | Pass-through |
| exams | 3 | id, patient_id | Pass-through |
| drugs | 1 | id, name | Add default category |
| financial | 1 | id, date | Add status fields |
| anamnesis | 1 | id, patient_id | Restructure fields |

### Patient Schema Critical Fields

```javascript
{
  id: string (required),
  name: string (required),
  scope: 'VET' | 'HUMAN' (auto-set),
  weight: number (optional, ONLY IF > 0),
  birth_year: string (optional, ONLY IF 4-digit),
  species: string,
  breed: string,
  sex: 'male' | 'female' | 'M' | 'F',
  owner_name: string,
  ownerPhone: string
}
```

**CRITICAL RULES:**
1. NEVER send `weight: null` or `weight: ''` → Omit the field entirely
2. NEVER send `birth_year: null` → Omit the field entirely
3. Empty strings are OK for string fields (breed, owner_name, etc.)
4. `scope` is auto-set based on practice type (VET/HUMAN)

---

## Enhanced Error Logging

All database operations now log detailed information to the console:

### HomePage Logs
```
[HomePage] Loading patients with scope: VET
[HomePage] Loaded 5 patients
[HomePage] loadPatients FAILED: <error>
[HomePage] Error details: { message, code, stack }
```

### Database Service Logs
```
[DB] getPatients: Found 5 patients with filters: {scope: "VET"}
[DB] getPatients FAILED: <error>
```

### PatientForm Logs
```
[PatientForm] Saving patient with data: {...}
[PatientForm] Patient created successfully: abc-123-def
[PatientForm] ❌ SAVE FAILED: <error>
[PatientForm] Error details: { name, message, code, parameters }
```

**How to Use:**
1. Open Console (F12)
2. Attempt the failing operation
3. Read the logged information
4. Look for schema errors, validation errors, or connection issues

---

## Testing Procedures

### Test 1: Create New Patient (VET Mode)

```
1. Navigate to Home page
2. Click "Novo Paciente"
3. Fill in:
   - Nome: "Rex"
   - Espécie: Canino
   - Raça: "Labrador"
   - Sexo: Macho
   - Ano Nasc: 2020
   - Peso: 25.5
4. Click "Cadastrar Paciente"
5. Verify: Toast shows "Paciente cadastrado com sucesso!"
6. Verify: Patient appears in list immediately
7. Reload page (F5)
8. Verify: Patient still appears in list
```

**Expected Console Logs:**
```
[PatientForm] Saving patient with data: {name: "Rex", scope: "VET", ...}
[PatientForm] Patient created successfully: <uuid>
[HomePage] Loading patients with scope: VET
[HomePage] Loaded 1 patients
[DB] getPatients: Found 1 patients with filters: {scope: "VET"}
```

### Test 2: Create Patient with Optional Fields Empty

```
1. Click "Novo Paciente"
2. Fill ONLY:
   - Nome: "Fluffy"
   - (Leave weight and birth_year empty)
3. Click "Cadastrar Paciente"
4. Verify: Success (no schema errors)
5. Check Console: dataToSave should NOT include weight or birth_year keys
```

**Expected Data Object:**
```javascript
{
  name: "Fluffy",
  scope: "VET",
  species: "dog",
  breed: "",
  sex: "male",
  size: "medium",
  owner_name: "",
  ownerPhone: ""
  // Note: NO weight or birth_year fields
}
```

### Test 3: Emergency Reset

```
1. Open Console (F12)
2. Type: window.resetDB()
3. Confirm in popup
4. Verify: Page reloads
5. Verify: Empty patient list (fresh database)
6. Create a new patient
7. Verify: Patient saves successfully
```

### Test 4: Switch Practice Mode

```
1. In Sidebar, click "MD" button (human mode)
2. Verify: Page reloads
3. Verify: Patient list is empty (VET patients hidden)
4. Create new patient in human mode
5. Switch back to "VET" button
6. Verify: VET patients reappear, human patient hidden
```

---

## Developer Notes

### Why These Fixes Were Necessary

1. **RxDB Schema Strictness**
   - RxDB validates all data against JSON Schema
   - Type mismatches cause VD2 (validation) errors
   - `null` is NOT the same as omitting a field
   - Optional fields must either have correct type OR be omitted entirely

2. **React Context Loading Order**
   - Context providers may not be ready on first render
   - Components must handle `undefined` values gracefully
   - Optional chaining (`?.`) prevents "Cannot read property" errors

3. **IndexedDB Persistence**
   - IndexedDB persists across page reloads
   - Schema changes require migration strategies
   - Corrupted data requires manual database deletion

### Best Practices Going Forward

1. **Always Use Optional Chaining for Context Values**
   ```javascript
   const label = terms?.patient_label || 'Default';
   ```

2. **Never Send Null to Optional Number Fields**
   ```javascript
   // BAD
   dataToSave.weight = formData.weight || null;

   // GOOD
   if (formData.weight && !isNaN(formData.weight)) {
     dataToSave.weight = parseFloat(formData.weight);
   }
   ```

3. **Log All Database Operations**
   ```javascript
   console.log('[Component] Operation:', data);
   try {
     await db.operation(data);
   } catch (error) {
     console.error('[Component] FAILED:', error);
   }
   ```

4. **Provide Emergency Reset Function**
   - Always expose `window.resetDB()` in development
   - Include UI button in Settings for non-technical users
   - Document the recovery procedure

---

## Quick Reference

### Emergency Commands

```javascript
// Reset entire database
window.resetDB()

// Check if database is initialized
window._tvusvet_db_promise

// Get current database instance (async)
const db = await window._tvusvet_db_promise;
console.log(db);

// List all patients (async)
const db = await window._tvusvet_db_promise;
const patients = await db.patients.find().exec();
console.log(patients.map(p => p.toJSON()));
```

### Files to Check When Debugging

1. **Database Schema:** `frontend/src/core/database/schemas.js`
2. **Database Init:** `frontend/src/core/database/db.js`
3. **Database Service:** `frontend/src/services/database.js`
4. **Patient Form:** `frontend/src/components/PatientForm.js`
5. **Home Page:** `frontend/src/pages/HomePage.js`
6. **Sidebar:** `frontend/src/components/ui/Sidebar.js`

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| VD2 | Schema validation failed | Check data types, use window.resetDB() |
| CONFLICT | Duplicate ID | Use genId() for new records |
| SCHEMA_ERROR | Schema mismatch | Increment schema version, add migration |
| DB6 | Collection schema conflict | Clear IndexedDB manually |

---

## Conclusion

All critical database issues have been resolved:

✅ PatientForm sanitizes data to prevent schema violations
✅ Sidebar handles undefined context gracefully
✅ Enhanced error logging for easy debugging
✅ Emergency reset function available globally
✅ UI-based reset button in Settings → Dev Tools
✅ Comprehensive recovery procedures documented

The application is now resilient against:
- Schema validation errors
- Context loading race conditions
- Corrupted IndexedDB data
- User input edge cases

**If problems persist after following this guide, the user should:**
1. Check browser console for specific error codes
2. Use `window.resetDB()` to start fresh
3. Report the console error log to development team
