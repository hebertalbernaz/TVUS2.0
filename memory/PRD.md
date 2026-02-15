# TVUSVET (NexaClinq) - PRD

## Problema Original
Polimento do MVP do TVUSVET. Profissionalizar os módulos de Diagnóstico por Imagem: Radiologia (Raio-X) e Tomografia (CT Scan). Ambos precisam atender Veterinária e Medicina Humana via `useLicense().practice`.

## Arquitetura
- **Frontend**: React + Tailwind + shadcn/ui (CRA via craco)
- **Backend**: FastAPI (Python)
- **Database**: RxDB local (IndexedDB) + MongoDB remoto
- **Routing**: HashRouter
- **Prática**: VET / HUMAN via LicenseContext

## Iteração 1 (2026-02-15) - Refatoração dos Editores
### Arquivos Criados/Modificados
1. **`imaging_terms.js`** (NOVO) — Constantes centralizadas
2. **`RadiologyEditor.js`** (REESCRITO) — Formulário estruturado
3. **`CTScanEditor.js`** (REESCRITO) — Formulário estruturado

## Iteração 2 (2026-02-15) - Integração + Copiar + Hydration
### Arquivos Modificados
1. **`ExamPage.js`** — Integração dos editores especializados
   - Import de RadiologyEditor e CTScanEditor
   - Lógica condicional: `exam_type === 'radiography'` → RadiologyEditor
   - Lógica condicional: `exam_type === 'tomography'` → CTScanEditor
   - Fallback para OrganEditor genérico (todos outros tipos)
   - `handleSpecializedSave()` — salva dados estruturados no banco
   - Os editores ocupam 75% do painel (imagens ficam à esquerda)

2. **`RadiologyEditor.js`** — Novas funcionalidades:
   - Botão "Copiar Laudo" (`navigator.clipboard.writeText`)
   - Hydration via `hydrateFromExam()`:
     - Prioridade 1: `organs_data[0].measurements._structured`
     - Prioridade 2: `exam.content` (JSON string)
     - Prioridade 3: Legacy plain text → vai para campo Achados
   - Salva em: `organs_data[0].measurements._structured`

3. **`CTScanEditor.js`** — Mesmas funcionalidades:
   - Botão "Copiar Laudo"
   - Hydration com fallback inteligente
   - Salva em: `organs_data[0].measurements._structured`

### Compatibilidade
- **Backward**: Ultrassom, ECG, Ecocardiograma continuam com OrganEditor + Roteiro
- **Schema**: Sem alteração no ExamSchema (v4) — dados estruturados salvos em `measurements` (additionalProperties: true)
- **Print/DOCX**: `report_content` e `conclusion` preenchidos para compatibilidade com fluxos de impressão e export DOCX

## Personas
- Médico Veterinário (laudos de imagem animal)
- Médico Radiologista (laudos de imagem humana)

## Backlog
- **P0**: Nenhum pendente
- **P1**: Template customizáveis pelo usuário (Configurações)
- **P2**: Export DOCX adaptado para laudos estruturados de imagem
- **P2**: Preview de impressão adaptado para laudos de Radiologia/TC
- **P3**: Auto-preenchimento baseado em IA

## Status dos Testes
- Frontend compila sem erros: PASS
- ExamPage imports corretos: PASS
- Routing condicional implementado: PASS
- Botão Copiar Laudo implementado: PASS
- Hydration implementada: PASS
- Dados estruturados em _structured: PASS
