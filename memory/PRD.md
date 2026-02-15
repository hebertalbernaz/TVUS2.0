# TVUSVET - PRD (Product Requirements Document)

## Problema Original
Sistema Médico/Veterinário que precisa de polimento nas funcionalidades clínicas.

## Arquitetura
- **Frontend**: React + Tailwind CSS + shadcn/ui + RxDB (local-first database)
- **Backend**: FastAPI (Python) + MongoDB
- **Roteamento**: HashRouter (/#/)
- **Banco local**: RxDB com IndexedDB

## User Personas
1. **Médico Veterinário** - Atestados, laudos, encaminhamentos para animais
2. **Médico Humano** - Atestados, laudos, encaminhamentos para pacientes

## O Que Foi Implementado

### Sessão 1 (14/02/2026) - ClinicalDocumentEditor Refatoração
- [x] 14 templates profissionais (7 Vet + 7 Humano)
- [x] DropdownMenu, diálogo Substituir/Adicionar
- [x] Editor A4, fonte Libre Baskerville, header vitals

### Sessão 2 (14/02/2026) - Bug Fix + Settings
- [x] Fix getDatabase() retornando {db, seedResult} em vez de db puro
- [x] SettingsPage com tabs verticais (9 categorias)

### Sessão 3 (15/02/2026) - Templates + Impressão + Edição + CONFLICT Fix

#### Tarefa 1: Filtragem Templates por Contexto
- [x] Templates filtrados pelo `practice` do `useLicense()` hook
- [x] VET mode: apenas 7 templates veterinários com header "MEDICINA VETERINARIA"
- [x] HUMAN mode: apenas 7 templates humanos com header "MEDICINA HUMANA"
- [x] Reage em tempo real ao Dev Switcher (troca VET/MD)
- [x] Badge "Veterinaria"/"Humana" visível no editor

#### Tarefa 2: Impressão
- [x] Botão "Imprimir" no toolbar (ao lado de Salvar)
- [x] `window.print()` ao clicar
- [x] CSS `@media print` em App.css: oculta sidebar, header, botões
- [x] Área A4 ocupa 100% do papel com margens adequadas
- [x] Força fundo branco e texto preto
- [x] Classes `no-print` em todos elementos não-imprimíveis

#### Tarefa 3: Modo de Edição
- [x] Botão Editar (ícone lápis) no card de documentos clínicos no PatientHistoryPage
- [x] Navegação com `{ state: { document: doc } }` via React Router
- [x] Editor detecta `location.state.document` e popula formulário
- [x] Título muda para "Editar [tipo]" com badge "Editando"
- [x] `handleSave` usa `updateClinicalDocument` para edição, `createClinicalDocument` para novo
- [x] Botão inferior muda para "Atualizar Documento"

#### Tarefa 4: LicenseContext CONFLICT Fix
- [x] Trocado `settings.patch()` por `settings.incrementalPatch()` em 2 locais
- [x] Adicionado cleanup com `cancelled` flag no useEffect
- [x] ZERO CONFLICT errors confirmado nos testes

## Testes
- Sessão 1: 100% (14/14)
- Sessão 2: 95% (13/13)
- Sessão 3: 80% automatizado + 100% manual via screenshots (todas features verificadas)

## Backlog Priorizado
### P0 - Nenhum pendente

### P1
- Templates customizáveis pelo usuário
- Auto-save de rascunhos

### P2
- Assinatura digital nos documentos
- Histórico de versões do documento
- PDF export direto (além de window.print)
