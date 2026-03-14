# TVUSVET (NexaClinq) - PRD

## Problema Original
Polimento do MVP do TVUSVET. Profissionalizar módulos de Diagnóstico por Imagem e Cardiologia. Todos atendem VET e HUMAN via `useLicense().practice`.

## Arquitetura
- **Frontend**: React + Tailwind + shadcn/ui (CRA via craco)
- **Backend**: FastAPI (Python)
- **Database**: RxDB local (IndexedDB) + MongoDB remoto
- **Routing**: HashRouter
- **Prática**: VET / HUMAN via LicenseContext

## Iteração 1 (2026-02-15) - Diagnóstico por Imagem
- `imaging_terms.js` — Constantes centralizadas (regiões, projeções, templates normais)
- `RadiologyEditor.js` — Formulário estruturado + VHS Calculator
- `CTScanEditor.js` — Formulário estruturado + Referência HU

## Iteração 2 (2026-02-15) - Integração Imagem + Copiar + Hydration
- `ExamPage.js` — Routing condicional para radiography/tomography
- Botão "Copiar Laudo" em ambos editores
- Hydration completa com fallback para dados legados

## Iteração 3 (2026-02-15) - Módulo de Cardiologia
### Arquivos Criados/Modificados
1. **`cardio_formulas.js`** (REESCRITO) — Biblioteca completa:
   - `calculateTeichholzVolume(d)` — Volume pelo método de Teichholz
   - `calculateFS(lvidd, lvids)` — Fração de Encurtamento
   - `calculateEF(edv, esv)` — Fração de Ejeção
   - `calculateLAAoRatio(la, ao)` — Relação Átrio/Aorta
   - `calculateLVMass(sivd, lvidd, ppved)` — Massa do VE (ASE)
   - `calculateAllEcho(measurements)` — Calcula todos de uma vez
   - `generateEchoAutoReport()` — Texto automático baseado nos cálculos
   - Constantes: ECHO_REFERENCE, VALVE_OPTIONS, VALVES, ECG_RHYTHMS, ECG_REFERENCE
   - Templates: ECHO_NORMAL_TEMPLATE, ECG_NORMAL_TEMPLATE (VET/HUMAN)

2. **`EchocardiogramEditor.js`** (REESCRITO):
   - Modo M: 6 inputs (SIVd, LVIDd, PPVEd, SIVs, LVIDs, PPVEs) + AE, Ao, FC
   - Painel Hemodinâmica: FS%, EF%, AE/Ao, EDV, ESV, Massa VE — cálculo em tempo real
   - Válvulas (Doppler): Mitral, Tricúspide, Aórtica, Pulmonar com selects
   - Botões: Laudo Normal, Gerar Laudo (automático), Copiar, Imprimir, Salvar
   - Atalhos: Ctrl+S (Salvar), Alt+C (Copiar) com tooltips
   - Hydration: `organs_data[0].measurements._structured` + fallback legado
   - Adaptação VET/HUMAN automática

3. **`ElectrocardiogramEditor.js`** (NOVO):
   - Dados Técnicos: FC (bpm), Ritmo (15 opções), Eixo Médio (MEA)
   - Ondas e Intervalos: P duration, P amplitude, PR interval, QRS duration, QT interval
   - Barra de resumo (FC + Ritmo + MEA) em destaque
   - Referências VET/HUMAN nos placeholders e tooltips
   - Botões: Laudo Normal, Copiar, Imprimir, Salvar
   - Atalhos: Ctrl+S, Alt+C com tooltips
   - Hydration + persistência JSON estruturado

4. **`ExamPage.js`** — Novas rotas:
   - `echocardiogram` → EchocardiogramEditor
   - `ecg` → ElectrocardiogramEditor

### Verificação Matemática (Testes Unitários)
- Teichholz(4.0) = 70.0ml PASS
- FS(4.0, 2.5) = 37.5% PASS
- EF = 68.1% (>50%) PASS
- LA:Ao(2.0/1.8) = 1.11 PASS
- Massa VE calculada: 85.8g PASS

## Editores Especializados Integrados
| Tipo de Exame | Editor | Status |
|---|---|---|
| radiography | RadiologyEditor | Integrado |
| tomography | CTScanEditor | Integrado |
| echocardiogram | EchocardiogramEditor | Integrado |
| ecg | ElectrocardiogramEditor | Integrado |
| ultrasound_* | OrganEditor (genérico) | Mantido |

## Backlog
- **P1**: Templates customizáveis pelo usuário (Configurações)
- **P1**: Preview de impressão adaptado para laudos estruturados
- **P2**: Export DOCX adaptado para cardiologia (tabela de medidas + cálculos)
- **P2**: Módulo Doppler espectral (E/A, Vmax, gradientes)
- **P3**: Auto-preenchimento baseado em IA
