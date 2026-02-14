# TVUSVET - PRD (Product Requirements Document)

## Problema Original
Refatoração do `ClinicalDocumentEditor.js` no sistema TVUSVET (Sistema Médico/Veterinário). Transformar um Textarea simples em uma ferramenta de produtividade clínica.

## Arquitetura
- **Frontend**: React + Tailwind CSS + shadcn/ui + RxDB (local-first database)
- **Backend**: FastAPI (Python) + MongoDB (usado para autenticação)
- **Roteamento**: HashRouter (/#/)
- **Banco de dados local**: RxDB com coleções para pacientes, exames, receitas, anamnese, documentos clínicos

## User Personas
1. **Médico Veterinário** - Cria atestados, laudos, encaminhamentos para animais
2. **Médico Humano** - Cria atestados, laudos, encaminhamentos para pacientes humanos

## Requisitos Core (Estáticos)
- Injeção de templates/macros por categoria (Vet/Humano)
- Editor visual simulando folha A4
- Header dinâmico com dados vitais do paciente
- Tratamento de anamnese com pré-carregamento
- Funcionalidade de salvar/cancelar documentos clínicos

## O Que Foi Implementado (14/02/2026)
### ClinicalDocumentEditor.js - Refatoração Completa
- [x] **Templates Veterinários** (7 modelos): Atestado de Saúde Animal, Atestado de Óbito Animal, Encaminhamento Cirúrgico, Anamnese Veterinária Padrão, Laudo Clínico, Autorização Cirúrgica, Declaração de Vacinação
- [x] **Templates Humanos** (7 modelos): Atestado Médico, Declaração de Óbito, Encaminhamento Especialista, Anamnese Clínica, Laudo Médico, Solicitação de Exames, Relatório de Acompanhamento
- [x] **DropdownMenu com submenus** (Medicina Veterinária / Medicina Humana)
- [x] **Diálogo de confirmação** ao inserir template quando editor já tem conteúdo (Substituir / Adicionar ao Final)
- [x] **Editor A4** com fundo branco, sombra, padding proporcional, min-height 297mm
- [x] **Fonte serifada** Libre Baskerville para conteúdo profissional
- [x] **Header de dados vitais** do paciente (espécie, raça, idade, peso, sexo)
- [x] **Pré-carregamento de anamnese** estruturada para documentType === 'anamnesis'
- [x] **Botões Salvar/Cancelar** mantidos e funcionais
- [x] **Contador de caracteres** visível

## Testes
- Frontend: 100% passed
- Integração: 100% passed
- 14 testes passaram incluindo template system, vitals display, A4 styling, e funcionalidade de documentos

## Backlog Priorizado
### P0 (Crítico)
- Nenhum pendente

### P1 (Alta prioridade)
- Botão "Imprimir Rascunho" (adiado por escolha do usuário)
- Edição de documentos clínicos já salvos

### P2 (Médio)
- Templates customizáveis pelo usuário
- Auto-save de rascunhos
- Histórico de versões do documento

## Próximas Tarefas
1. Implementar botão "Imprimir Rascunho" quando solicitado
2. Permitir edição de documentos clínicos existentes
3. Adicionar templates personalizáveis pelo usuário
