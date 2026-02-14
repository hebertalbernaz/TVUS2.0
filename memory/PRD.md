# TVUSVET - PRD (Product Requirements Document)

## Problema Original
1. Refatoração do `ClinicalDocumentEditor.js` - Transformar textarea simples em ferramenta de produtividade
2. Bug fix crítico no PatientForm.js - Perda de comunicação com banco de dados
3. Reorganização do SettingsPage.js - Layout com tabs verticais

## Arquitetura
- **Frontend**: React + Tailwind CSS + shadcn/ui + RxDB (local-first database)
- **Backend**: FastAPI (Python) + MongoDB (usado para autenticação)
- **Roteamento**: HashRouter (/#/)
- **Banco de dados local**: RxDB com coleções para pacientes, exames, receitas, anamnese, documentos clínicos

## User Personas
1. **Médico Veterinário** - Cria atestados, laudos, encaminhamentos para animais
2. **Médico Humano** - Cria atestados, laudos, encaminhamentos para pacientes humanos

## Requisitos Core (Estáticos)
- Criação e edição de pacientes (VET/HUMAN)
- Injeção de templates/macros por categoria (Vet/Humano)
- Editor visual simulando folha A4
- Header dinâmico com dados vitais do paciente
- Configurações organizadas por categorias
- Módulos: Ultrassom, Cardio, Lab, Oftalmologia, Receituário, Financeiro

## O Que Foi Implementado

### Sessão 1 (14/02/2026) - ClinicalDocumentEditor Refatoração
- [x] 14 templates profissionais (7 Vet + 7 Humano)
- [x] DropdownMenu com submenus categorizados
- [x] Diálogo de confirmação Substituir/Adicionar
- [x] Editor A4 com fonte serifada Libre Baskerville
- [x] Header de dados vitais do paciente
- [x] Pré-carregamento de anamnese estruturada

### Sessão 2 (14/02/2026) - Bug Fix + Settings Reorganização

#### Bug Fix: getDatabase() retornava {db, seedResult} em vez do RxDB puro
- **Causa raiz**: `_create()` em `db.js` retornava `{ db, seedResult }` mas `getDatabase()` não desempacotava, fazendo com que `db.patients`, `db.settings`, etc fossem `undefined`
- **Impacto**: TODAS as operações de banco falhavam silenciosamente (create, read, update, delete de pacientes, settings, etc.)
- **Fix**: Modificado `getDatabase()` para `.then(result => result.db)` e criado `getLastSeedResult()` para o App.js acessar o seed result separadamente
- **Arquivos alterados**: `db.js`, `App.js`

#### SettingsPage Reorganização
- [x] Layout de tabs verticais (sidebar esquerdo + painel de conteúdo)
- [x] **Geral**: Tema, Dados da Clínica (resumo com link para Perfis)
- [x] **Clínica & Anamnese**: TemplatesManager
- [x] **Receituário**: DrugsManager (medicamentos)
- [x] **Diagnóstico por Imagem**: ReferenceValuesManager + Templates de Laudo
- [x] **Especialidades**: Oftalmologia e Laboratório
- [x] **Financeiro**: Configurações financeiras
- [x] **Perfis Profissionais**: ProfilesManager
- [x] **Backup**: Em manutenção
- [x] **Dev Tools**: DevToolbar

## Testes
- Sessão 1: 100% (14/14 testes) - ClinicalDocumentEditor
- Sessão 2: 95% (13/13 testes) - Bug fix + Settings
  - Issue menor: RxDB CONFLICT warning no LicenseContext (pré-existente, LOW priority)

## Backlog Priorizado
### P0 (Crítico)
- Nenhum pendente

### P1 (Alta prioridade)
- Botão "Imprimir Rascunho" no ClinicalDocumentEditor
- Edição de documentos clínicos já salvos
- Fix do RxDB CONFLICT warning no LicenseContext

### P2 (Médio)
- Templates customizáveis pelo usuário
- Auto-save de rascunhos
- Configurações financeiras detalhadas (moeda, serviços padrão)
- Configurações específicas de especialidades (Oftalmo, Lab)

## Próximas Tarefas
1. Implementar botão "Imprimir Rascunho"
2. Edição de documentos clínicos existentes
3. Templates personalizáveis
4. Resolver CONFLICT warning no LicenseContext
