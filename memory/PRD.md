# TVUSVET (NexaClinq) - PRD

## Problema Original
Polimento do MVP do TVUSVET. Profissionalizar os módulos de Diagnóstico por Imagem: Radiologia (Raio-X) e Tomografia (CT Scan). Ambos precisam atender Veterinária e Medicina Humana via `useLicense().practice`, adaptando regiões anatômicas e termos.

## Arquitetura
- **Frontend**: React + Tailwind + shadcn/ui (CRA via craco)
- **Backend**: FastAPI (Python)
- **Database**: RxDB local (browser-based) + MongoDB remoto
- **Routing**: HashRouter
- **Prática**: VET / HUMAN via LicenseContext

## O que foi implementado (2026-02-15)

### Arquivos Criados/Modificados
1. **`/app/frontend/src/config/dictionaries/imaging_terms.js`** (NOVO)
   - Constantes centralizadas para Diagnóstico por Imagem
   - `RADIOLOGY_REGIONS` (vet/human), `RADIOLOGY_PROJECTIONS` (vet/human)
   - `CT_REGIONS` (vet/human), `CT_CONTRAST_OPTIONS`
   - `RADIOLOGY_NORMAL_TEMPLATES` (vet/human) - Templates completos para todas as regiões
   - `CT_NORMAL_TEMPLATES` (vet/human) - Templates completos para todas as regiões
   - `HU_SCALE`, `classifyHU()` - Referência Hounsfield

2. **`/app/frontend/src/components/Editors/RadiologyEditor.js`** (REESCRITO)
   - Formulário estruturado: Região + Projeções + Achados + Conclusão
   - VHS Calculator (vet thorax only)
   - Botão "Laudo Normal" carrega template baseado na região e prática
   - Salva JSON estruturado `{ type, practice, region, projections, findings, conclusion, vhs }`
   - Adapta terminologia VET/HUMAN automaticamente via `useLicense()`
   - Botões Salvar/Cancelar/Imprimir consistentes com ClinicalDocumentEditor
   - Todos data-testids implementados

3. **`/app/frontend/src/components/Editors/CTScanEditor.js`** (REESCRITO)
   - Formulário estruturado: Região + Contraste + Espessura + Achados + Conclusão
   - Técnica auto-gerada baseada no protocolo
   - Referência HU integrada
   - Botão "Laudo Normal" inteligente
   - Salva JSON estruturado `{ type, practice, region, contrast, sliceThickness, technique, findings, conclusion }`
   - Adapta regiões VET/HUMAN via `useLicense()`
   - Todos data-testids implementados

## Personas
- Médico Veterinário (laudos de imagem animal)
- Médico Radiologista (laudos de imagem humana)

## Backlog
- **P0**: Nenhum pendente
- **P1**: Integrar RadiologyEditor/CTScanEditor no fluxo do ExamPage.js (substituir OrganEditor genérico para tipos radiography/tomography)
- **P1**: Suporte a edição (carregar JSON salvo de volta nos campos)
- **P2**: Export DOCX com formato estruturado para laudos de imagem
- **P2**: Templates customizáveis pelo usuário
- **P3**: Auto-preenchimento baseado em IA

## Status dos Testes
- Frontend compila sem erros: PASS
- Homepage carrega: PASS
- Dev Switcher VET/MD: PASS
- Todas data-testids presentes: PASS
- Todas exports de imaging_terms: PASS
