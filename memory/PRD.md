# TVUS 2.0 / NexaClinq – Offline-First Vet Ultrasound

## Problem statement (original, PT-BR)
Tornar o sistema 100% offline com tolerância zero a perda de dados, foco Veterinária / Ultrassonografia: blindagem IndexedDB (localDb.js, database.js), auto-save com debounce + beforeunload, backup/restore completo (cryptoBackup.js, BackupManager.js), bypass de licença/autenticação, perfil Vet padrão, Ultrassom como fluxo principal, revisar e rodar testes database.test.js / backup.test.js.

## User choices
- Remove authentication, open directly on dashboard
- Vet default; human medicine BLOCKED for now (HUMAN_PRACTICE_LOCKED in LicenseContext)
- Auto-save 3s after typing stops

## Architecture
React (CRA/craco) + Dexie IndexedDB (`tvusvet_local_db`, 14 tables incl. media blobs). No backend/network. Electron/Capacitor packaging.

## Implemented (2026-06)
- AuthContext: fixed local user, no login; LoginPage removed; unknown routes -> `/`
- LicenseContext: always-valid license, never blocks rendering, practice forced to vet
- useAutoSave hook + createAutoSaver (3s debounce, flush on back/unmount, beforeunload prompt while pending/in-flight, AutoSaveIndicator in ExamPage)
- navigator.storage.persist() requested; getMediaDataUrl no longer needs FileReader
- Backup: consistent snapshot in one read transaction; restore rejects incomplete backups (row count/media mismatch); summary shows all tables
- deletePatient cascades exams + media in a transaction
- Vet-first PatientForm (Espécie, Raça, Peso, Sexo, Castração, Tutor) + "Salvar e iniciar Ultrassom"
- Ultrasound main flow: Home quickstart card, PatientCard one-click "Ultrassom", real /ultrasound module (patient search + drafts), empty drafts reused
- Sidebar: Ultrassom first, no logout / no practice switcher
- Fixed print-only report showing on screen (index.css)
- Tests: 20 passing (database, backup, autosave, textSearch)

## Backlog
- P1: auto-save for Lab, Prescription, Anamnesis forms
- P1: scheduled automatic local backup reminder/export
- P2: ultrasound measurement → reference value comparison per species
- P2: re-enable human practice when vet is finalized
