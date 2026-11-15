/**
 * TVUSVET - Biblioteca de textos guia do Ultrassom Abdominal Veterinário.
 * Sintaxe de medidas igual ao restante do sistema: {M1}, {M2}, {M3} (valor + unidade, padrão cm).
 * category: 'normal' | 'alteracao'
 */

// Rótulos das medidas por órgão (M1..M3). Usados no editor, nos alertas de referência e na impressão.
export const ORGAN_MEASUREMENTS = {
  'Fígado': [{ key: 'm1', label: 'Maior nódulo' }],
  'Vesícula Biliar': [{ key: 'm1', label: 'Espessura de parede' }],
  'Baço': [{ key: 'm1', label: 'Espessura' }],
  'Rins': [{ key: 'm1', label: 'Rim esquerdo – comprimento' }, { key: 'm2', label: 'Rim direito – comprimento' }],
  'Rim Esquerdo': [{ key: 'm1', label: 'Comprimento' }, { key: 'm2', label: 'Espessura cortical' }, { key: 'm3', label: 'Pelve renal' }],
  'Rim Direito': [{ key: 'm1', label: 'Comprimento' }, { key: 'm2', label: 'Espessura cortical' }, { key: 'm3', label: 'Pelve renal' }],
  'Vesícula Urinária': [{ key: 'm1', label: 'Espessura de parede' }, { key: 'm2', label: 'Maior urólito' }],
  'Estômago': [{ key: 'm1', label: 'Espessura de parede' }, { key: 'm2', label: 'Corpo estranho' }],
  'Duodeno': [{ key: 'm1', label: 'Espessura de parede' }],
  'Jejuno': [{ key: 'm1', label: 'Espessura de parede' }, { key: 'm2', label: 'Diâmetro luminal' }],
  'Íleo': [{ key: 'm1', label: 'Espessura de parede' }],
  'Ceco': [{ key: 'm1', label: 'Espessura de parede' }],
  'Cólon': [{ key: 'm1', label: 'Espessura de parede' }],
  'Pâncreas': [{ key: 'm1', label: 'Espessura' }],
  'Adrenais': [{ key: 'm1', label: 'Esquerda – polo caudal' }, { key: 'm2', label: 'Direita – polo caudal' }],
  'Adrenal Esquerda': [{ key: 'm1', label: 'Polo cranial' }, { key: 'm2', label: 'Polo caudal' }],
  'Adrenal Direita': [{ key: 'm1', label: 'Polo cranial' }, { key: 'm2', label: 'Polo caudal' }],
  'Linfonodos': [{ key: 'm1', label: 'Espessura' }],
  'Próstata': [{ key: 'm1', label: 'Comprimento' }, { key: 'm2', label: 'Altura' }, { key: 'm3', label: 'Largura' }],
  'Testículos': [{ key: 'm1', label: 'Testículo esquerdo' }, { key: 'm2', label: 'Testículo direito' }],
  'Testículo Direito': [{ key: 'm1', label: 'Comprimento' }, { key: 'm2', label: 'Espessura' }],
  'Testículo Esquerdo': [{ key: 'm1', label: 'Comprimento' }, { key: 'm2', label: 'Espessura' }],
  'Útero': [{ key: 'm1', label: 'Diâmetro do corpo' }, { key: 'm2', label: 'Diâmetro dos cornos' }],
  'Corpo Uterino': [{ key: 'm1', label: 'Diâmetro' }],
  'Ovários': [{ key: 'm1', label: 'Ovário esquerdo' }, { key: 'm2', label: 'Ovário direito' }],
  'Ovário Direito': [{ key: 'm1', label: 'Maior eixo' }],
  'Ovário Esquerdo': [{ key: 'm1', label: 'Maior eixo' }]
};

export const getOrganMeasurements = (organ) =>
  [1, 2, 3].map((n) => ORGAN_MEASUREMENTS[organ]?.find((m) => m.key === `m${n}`) || { key: `m${n}`, label: `M${n}`, generic: true });

const N = 'normal';
const A = 'alteracao';

const KIDNEY = (side) => [
  [N, 'Normal', `Rim ${side} em topografia habitual, com formato e contornos preservados, medindo {M1} em seu eixo longitudinal. Cortical com espessura de {M2}, ecogenicidade e ecotextura preservadas. Relação e definição corticomedular mantidas. Pelve renal sem sinais de dilatação. Ausência de imagens sugestivas de cálculos ou massas.`],
  [A, 'Nefropatia crônica', `Rim ${side} com dimensões reduzidas ({M1}), contornos irregulares e cortical hiperecogênica ({M2}), com perda da definição corticomedular. Achados compatíveis com nefropatia crônica — correlacionar com exames laboratoriais (ureia, creatinina, SDMA).`],
  [A, 'Pielectasia', `Pelve renal ${side === 'esquerdo' ? 'esquerda' : 'direita'} discretamente dilatada, medindo {M3}, com conteúdo anecogênico. Achado compatível com pielectasia, podendo estar associada a fluidoterapia, pielonefrite ou obstrução distal — correlacionar com a clínica.`],
  [A, 'Nefrolitíase', `Presença de estrutura hiperecogênica formadora de sombra acústica posterior em região de pelve/divertículos do rim ${side}, compatível com nefrolitíase.`],
  [A, 'Sinal da medular', `Presença de faixa hiperecogênica em região corticomedular do rim ${side} (sinal da medular), achado inespecífico que pode estar associado a nefrocalcinose, nefropatias ou ser variação da normalidade.`],
  [A, 'Cisto renal', `Presença de estrutura arredondada, anecogênica, de paredes finas e com reforço acústico posterior em cortical do rim ${side}, medindo {M1}, compatível com cisto renal.`]
];

const INTESTINE = (seg) => [
  [N, 'Normal', `${seg} com espessura de parede preservada ({M1}), estratificação parietal em camadas mantida, peristaltismo presente e conteúdo mucoso/gasoso habitual.`],
  [A, 'Enterite', `${seg} com espessamento difuso de parede ({M1}), porém com estratificação parietal preservada, e hipomotilidade. Achados compatíveis com processo inflamatório (enterite) — considerar enteropatia inflamatória crônica, parasitária ou infecciosa.`],
  [A, 'Perda de estratificação', `${seg} com espessamento parietal ({M1}) e perda da estratificação em camadas. Achado relevante, podendo estar relacionado a processo infiltrativo/neoplásico (ex.: linfoma) — recomenda-se avaliação citológica/histopatológica.`],
  [A, 'Corpo estranho / obstrução', `${seg} com conteúdo hiperecogênico formador de sombra acústica posterior, associado à dilatação luminal a montante ({M1}) e alteração do peristaltismo. Achados sugestivos de corpo estranho com quadro obstrutivo.`],
  [A, 'Plissamento (corpo estranho linear)', `${seg} com padrão plissado/sanfonado das alças e linha hiperecogênica intraluminal, sugestivo de corpo estranho linear.`]
];

const RAW = {
  'Fígado': [
    [N, 'Normal', 'Fígado com dimensões preservadas, contornos regulares e bordas finas. Parênquima de ecotextura homogênea e ecogenicidade preservada. Vasos portais e veias hepáticas de calibre e trajeto habituais.'],
    [A, 'Hepatomegalia', 'Fígado com dimensões aumentadas, ultrapassando o arco costal, bordas arredondadas. Ecotextura homogênea e ecogenicidade preservada. Achado compatível com hepatomegalia — considerar processos inflamatórios, congestivos, endócrinos ou infiltrativos.'],
    [A, 'Esteatose / Hepatopatia esteroidal', 'Fígado com dimensões aumentadas, bordas arredondadas e parênquima difusamente hiperecogênico, com atenuação do feixe sonoro. Achados compatíveis com esteatose/hepatopatia vacuolar (ex.: hiperadrenocorticismo, lipidose, diabetes).'],
    [A, 'Hepatopatia inflamatória', 'Fígado com dimensões preservadas e parênquima difusamente hipoecogênico, com evidenciação da trama portal. Achados compatíveis com hepatopatia inflamatória aguda (hepatite/colangio-hepatite) — correlacionar com enzimas hepáticas.'],
    [A, 'Nódulos hepáticos', 'Presença de nódulo(s) hipo/hiperecogênico(s) em parênquima hepático, o maior medindo {M1}. Diagnósticos diferenciais incluem hiperplasia nodular benigna e processo neoplásico — recomenda-se citologia guiada.'],
    [A, 'Fígado reduzido', 'Fígado com dimensões reduzidas e contornos irregulares, parênquima heterogêneo. Achados compatíveis com hepatopatia crônica/cirrose — avaliar presença de desvio portossistêmico.']
  ],
  'Vesícula Biliar': [
    [N, 'Normal', 'Vesícula biliar com moderada repleção, paredes finas e regulares ({M1}), conteúdo anecogênico e homogêneo. Ductos biliares sem sinais de dilatação.'],
    [A, 'Lama biliar', 'Vesícula biliar moderadamente repleta, com paredes finas ({M1}) e presença de conteúdo ecogênico, amorfo, gravidade-dependente e não formador de sombra acústica, compatível com lama biliar.'],
    [A, 'Mucocele', 'Vesícula biliar distendida, com conteúdo ecogênico imóvel em padrão estrelado/"kiwi", compatível com mucocele biliar. Avaliar integridade da parede e presença de líquido livre pericolecístico.'],
    [A, 'Colecistite', 'Vesícula biliar com paredes espessadas ({M1}) e irregulares, com padrão em duplo contorno, compatível com colecistite/edema de parede.'],
    [A, 'Colelitíase', 'Presença de estrutura(s) hiperecogênica(s) formadora(s) de sombra acústica posterior no lúmen da vesícula biliar, compatível com colelitíase.']
  ],
  'Baço': [
    [N, 'Normal', 'Baço com dimensões preservadas, espessura de {M1}, contornos regulares e bordas finas. Parênquima de ecotextura homogênea e ecogenicidade preservada. Vasos esplênicos de calibre habitual.'],
    [A, 'Esplenomegalia', 'Baço com dimensões aumentadas (espessura de {M1}), bordas arredondadas e parênquima homogêneo. Achado compatível com esplenomegalia — considerar hiperplasia, congestão, hematopoiese extramedular, hemoparasitoses ou infiltração.'],
    [A, 'Nódulos esplênicos', 'Presença de nódulo(s) hipoecogênico(s) em parênquima esplênico, o maior medindo {M1}. Diagnósticos diferenciais: hiperplasia nodular, hematoma ou neoplasia — recomenda-se acompanhamento ou citologia.'],
    [A, 'Massa esplênica', 'Presença de formação cavitária, heterogênea, de contornos irregulares em baço, medindo {M1}. Considerar hematoma e neoplasia (ex.: hemangiossarcoma). Recomenda-se avaliação torácica e ecocardiográfica para estadiamento.'],
    [A, 'Parênquima "favo de mel"', 'Parênquima esplênico com padrão heterogêneo, com múltiplos pontos hipoecogênicos ("favo de mel"), podendo estar relacionado a hiperplasia linfoide ou infiltração neoplásica (linfoma/mastocitoma) — considerar citologia.']
  ],
  'Rins': [
    [N, 'Normal', 'Rins em topografia habitual, simétricos, com formato e contornos preservados. Rim esquerdo medindo {M1} e rim direito medindo {M2} em seus eixos longitudinais. Corticais de ecogenicidade preservada, relação e definição corticomedular mantidas. Pelves renais sem dilatação. Ausência de cálculos ou massas.'],
    [A, 'Nefropatia crônica', 'Rins com dimensões reduzidas (esquerdo: {M1}; direito: {M2}), contornos irregulares, corticais hiperecogênicas e perda da definição corticomedular. Achados compatíveis com nefropatia crônica bilateral.'],
    [A, 'Pielectasia bilateral', 'Pelves renais discretamente dilatadas bilateralmente, com conteúdo anecogênico. Achado compatível com pielectasia (fluidoterapia, pielonefrite ou obstrução) — correlacionar com a clínica.'],
    [A, 'Nefrite / nefropatia aguda', 'Rins com dimensões aumentadas (esquerdo: {M1}; direito: {M2}), corticais hiperecogênicas e discreta quantidade de líquido perirrenal. Achados compatíveis com nefropatia aguda (nefrite/lesão renal aguda).']
  ],
  'Rim Esquerdo': KIDNEY('esquerdo'),
  'Rim Direito': KIDNEY('direito'),
  'Vesícula Urinária': [
    [N, 'Normal', 'Vesícula urinária com moderada repleção, paredes finas e regulares ({M1}), mucosa lisa e conteúdo anecogênico e homogêneo. Ausência de cálculos ou massas.'],
    [A, 'Cistite', 'Vesícula urinária com moderada repleção, paredes espessadas ({M1}) e irregulares, principalmente em região cranioventral. Achado compatível com cistite — recomenda-se urinálise e urocultura.'],
    [A, 'Sedimento', 'Vesícula urinária com moderada repleção, paredes finas ({M1}) e presença de pontos ecogênicos em suspensão/gravidade-dependentes, não formadores de sombra acústica, compatíveis com sedimento urinário (cristais/celularidade).'],
    [A, 'Urolitíase', 'Presença de estrutura(s) hiperecogênica(s), gravidade-dependente(s), formadora(s) de sombra acústica posterior em lúmen vesical, a maior medindo {M2}, compatível com urolitíase. Avaliar uretra quanto a obstrução.'],
    [A, 'Massa vesical', 'Presença de formação de base larga, aderida à parede vesical em região de trígono/colo, projetando-se para o lúmen, medindo {M2}. Considerar neoplasia (ex.: carcinoma de células transicionais) e pólipo — recomenda-se cateterização traumática/citologia.'],
    [A, 'Coágulo', 'Presença de conteúdo ecogênico, amorfo, móvel e sem fluxo ao Doppler em lúmen vesical, sugestivo de coágulo.']
  ],
  'Estômago': [
    [N, 'Normal', 'Estômago com repleção moderada por conteúdo gasoso/alimentar, parede com espessura preservada ({M1}) e estratificação parietal em camadas mantida. Peristaltismo presente.'],
    [A, 'Gastrite', 'Estômago com espessamento parietal ({M1}), estratificação em camadas preservada e pregas evidentes. Achados compatíveis com gastrite.'],
    [A, 'Corpo estranho', 'Presença em lúmen gástrico de estrutura hiperecogênica formadora de sombra acústica posterior, medindo {M2}, compatível com corpo estranho.'],
    [A, 'Repleção alimentar', 'Estômago com acentuada repleção por conteúdo alimentar heterogêneo, prejudicando a avaliação completa da parede. Sugere-se reavaliação após jejum.'],
    [A, 'Espessamento focal', 'Espessamento focal de parede gástrica em região de {M1}, com perda da estratificação em camadas, podendo estar relacionado a processo neoplásico ou úlcera — recomenda-se endoscopia/biópsia.']
  ],
  'Duodeno': INTESTINE('Duodeno'),
  'Jejuno': INTESTINE('Alças jejunais'),
  'Íleo': INTESTINE('Íleo'),
  'Ceco': INTESTINE('Ceco'),
  'Cólon': [
    [N, 'Normal', 'Cólon com parede de espessura preservada ({M1}), estratificação mantida e conteúdo gasoso/fecal habitual.'],
    [A, 'Colite', 'Cólon com espessamento parietal ({M1}) e estratificação preservada, com conteúdo predominantemente líquido. Achados compatíveis com colite.'],
    [A, 'Fecaloma / constipação', 'Cólon distendido por grande quantidade de conteúdo fecal hiperecogênico formador de sombra acústica, compatível com constipação/fecaloma.']
  ],
  'Pâncreas': [
    [N, 'Normal', 'Pâncreas visibilizado em topografia habitual, com espessura de {M1}, contornos regulares, ecotextura homogênea e ecogenicidade preservada. Ducto pancreático sem dilatação. Mesentério adjacente sem alterações.'],
    [A, 'Pancreatite aguda', 'Pâncreas aumentado (espessura de {M1}), hipoecogênico, de contornos irregulares, circundado por mesentério hiperecogênico e reativo. Achados compatíveis com pancreatite aguda — correlacionar com lipase pancreática específica.'],
    [A, 'Pancreatite crônica', 'Pâncreas com contornos irregulares, parênquima heterogêneo/hiperecogênico e espessura de {M1}. Achados compatíveis com pancreatite crônica/fibrose.'],
    [A, 'Nódulo pancreático', 'Presença de nódulo hipoecogênico em parênquima pancreático, medindo {M1}. Diferenciais: hiperplasia nodular, insulinoma ou outra neoplasia.']
  ],
  'Adrenais': [
    [N, 'Normal', 'Adrenais em topografia habitual, com formato e contornos preservados, ecogenicidade habitual. Adrenal esquerda com polo caudal de {M1} e adrenal direita com polo caudal de {M2}.'],
    [A, 'Hiperplasia bilateral', 'Adrenais com aumento simétrico bilateral (esquerda: {M1}; direita: {M2}), formato preservado. Achado compatível com hiperplasia adrenocortical — considerar hiperadrenocorticismo hipófise-dependente e correlacionar com testes endócrinos.'],
    [A, 'Massa adrenal', 'Adrenal com aumento assimétrico e perda do formato habitual, parênquima heterogêneo. Considerar neoplasia adrenal (adenoma/carcinoma/feocromocitoma) e avaliar invasão vascular (veia cava caudal).'],
    [A, 'Adrenais reduzidas', 'Adrenais com dimensões reduzidas (esquerda: {M1}; direita: {M2}). Considerar hipoadrenocorticismo ou uso de glicocorticoide exógeno — correlacionar com a clínica.']
  ],
  'Adrenal Esquerda': [
    [N, 'Normal', 'Adrenal esquerda em topografia habitual, formato bilobado ("amendoim") preservado, contornos regulares e ecogenicidade habitual. Polo cranial com {M1} e polo caudal com {M2}.'],
    [A, 'Aumento', 'Adrenal esquerda aumentada (polo cranial {M1}; polo caudal {M2}), formato preservado. Achado compatível com hiperplasia adrenocortical — correlacionar com testes endócrinos.'],
    [A, 'Nódulo / massa', 'Adrenal esquerda com nódulo/aumento focal e perda do formato habitual, medindo {M2}. Considerar neoplasia adrenal e avaliar vasos adjacentes.']
  ],
  'Adrenal Direita': [
    [N, 'Normal', 'Adrenal direita em topografia habitual, formato preservado, contornos regulares e ecogenicidade habitual. Polo cranial com {M1} e polo caudal com {M2}.'],
    [A, 'Aumento', 'Adrenal direita aumentada (polo cranial {M1}; polo caudal {M2}), formato preservado. Achado compatível com hiperplasia adrenocortical — correlacionar com testes endócrinos.'],
    [A, 'Nódulo / massa', 'Adrenal direita com nódulo/aumento focal e perda do formato habitual, medindo {M2}. Considerar neoplasia adrenal e avaliar invasão da veia cava caudal.']
  ],
  'Linfonodos': [
    [N, 'Normal', 'Linfonodos abdominais avaliados (jejunais, ilíacos mediais e gástricos/hepáticos) sem alterações de dimensões, formato ou ecogenicidade.'],
    [A, 'Linfadenomegalia reativa', 'Linfonodos jejunais aumentados ({M1} de espessura), de formato alongado, hipoecogênicos e homogêneos, com mesentério adjacente hiperecogênico. Achado compatível com linfadenopatia reativa.'],
    [A, 'Linfadenomegalia suspeita', 'Linfonodo(s) aumentado(s) ({M1}), arredondado(s), hipoecogênico(s) e heterogêneo(s). Considerar processo neoplásico (linfoma/metástase) — recomenda-se citologia guiada.']
  ],
  'Cavidade Peritoneal': [
    [N, 'Normal', 'Cavidade peritoneal sem evidências de líquido livre. Mesentério de ecogenicidade habitual. Ausência de massas ou gás livre.'],
    [A, 'Efusão discreta', 'Presença de discreta quantidade de líquido livre anecogênico entre lobos hepáticos/alças intestinais. Sugere-se abdominocentese para análise caso clinicamente indicado.'],
    [A, 'Efusão moderada/acentuada', 'Presença de moderada a acentuada quantidade de líquido livre em cavidade peritoneal, de aspecto anecogênico a celular, com alças intestinais flutuantes. Recomenda-se abdominocentese e análise do líquido.'],
    [A, 'Peritonite / esteatite', 'Mesentério difusamente hiperecogênico e reativo, associado a discreta quantidade de líquido livre ecogênico. Achados compatíveis com peritonite/esteatite — investigar foco.']
  ],
  'Próstata': [
    [N, 'Normal', 'Próstata em topografia habitual, simétrica, de contornos regulares e parênquima homogêneo, medindo {M1} (comprimento) x {M2} (altura) x {M3} (largura).'],
    [A, 'Hiperplasia prostática benigna', 'Próstata aumentada, medindo {M1} x {M2} x {M3}, simétrica, de contornos regulares e parênquima discretamente heterogêneo, com pequenos cistos intraparenquimatosos. Achados compatíveis com hiperplasia prostática benigna.'],
    [A, 'Prostatite', 'Próstata aumentada ({M1} x {M2} x {M3}), heterogênea, com áreas hipoecogênicas mal definidas e mesentério periprostático reativo. Achados compatíveis com prostatite — recomenda-se cultura de lavado/ejaculado.'],
    [A, 'Cisto paraprostático', 'Presença de estrutura cavitária anecogênica adjacente à próstata, medindo {M1}, compatível com cisto paraprostático.'],
    [A, 'Próstata em castrado', 'Próstata de dimensões reduzidas ({M1} x {M2}), homogênea, compatível com o status de castração.'],
    [A, 'Neoplasia prostática', 'Próstata assimétrica, de contornos irregulares, com focos de mineralização. Em paciente castrado, achados sugestivos de neoplasia prostática — recomenda-se citologia.']
  ],
  'Testículos': [
    [N, 'Normal', 'Testículos em bolsa escrotal, simétricos, de contornos regulares e parênquima homogêneo com mediastino testicular visível. Testículo esquerdo medindo {M1} e direito {M2}.'],
    [A, 'Nódulo testicular', 'Presença de nódulo hipoecogênico em parênquima testicular, medindo {M1}. Considerar neoplasia testicular (sertolioma/seminoma/leydigocitoma).'],
    [A, 'Orquite / epididimite', 'Testículo aumentado e heterogêneo, com epidídimo espessado e hipoecogênico. Achados compatíveis com orquite/epididimite.'],
    [A, 'Criptorquidismo', 'Testículo não visibilizado em bolsa escrotal; estrutura compatível com testículo ectópico identificada em região inguinal/abdominal, medindo {M1}.']
  ],
  'Útero': [
    [N, 'Normal', 'Útero não distendido, de difícil visibilização, com corpo uterino de {M1}, paredes regulares e sem conteúdo luminal.'],
    [A, 'Piometra', 'Útero distendido por conteúdo luminal ecogênico/celular, com corpo uterino de {M1} e cornos de {M2}, paredes espessadas. Achados compatíveis com piometra/mucometra — correlacionar com a clínica e hemograma.'],
    [A, 'Hiperplasia endometrial cística', 'Útero com paredes espessadas e múltiplas pequenas estruturas císticas endometriais (corpo: {M1}). Achados compatíveis com hiperplasia endometrial cística.'],
    [A, 'Gestação', 'Útero gravídico com vesículas gestacionais contendo estruturas fetais viáveis, com batimentos cardíacos presentes. Estimativa conforme medidas fetais.'],
    [A, 'Coto uterino', 'Coto uterino visibilizado dorsal à vesícula urinária, medindo {M1}, homogêneo e sem conteúdo (paciente castrada).']
  ],
  'Corpo Uterino': [
    [N, 'Normal', 'Corpo uterino com diâmetro de {M1}, paredes regulares e sem conteúdo luminal.'],
    [A, 'Conteúdo luminal', 'Corpo uterino distendido ({M1}) por conteúdo ecogênico, compatível com piometra/mucometra.']
  ],
  'Ovários': [
    [N, 'Normal', 'Ovários em topografia habitual, de dimensões preservadas (esquerdo: {M1}; direito: {M2}), sem cistos ou massas.'],
    [A, 'Cistos ovarianos', 'Ovário(s) com estrutura(s) arredondada(s) anecogênica(s), de paredes finas, compatível(is) com cisto(s) ovariano(s)/folicular(es).'],
    [A, 'Massa ovariana', 'Ovário aumentado e heterogêneo, medindo {M1}, sugestivo de neoplasia ovariana.'],
    [A, 'Remanescente ovariano', 'Estrutura compatível com tecido ovariano remanescente identificada em região caudal ao rim, medindo {M1}, em paciente castrada.']
  ],
  'Ovário Direito': [
    [N, 'Normal', 'Ovário direito em topografia habitual, medindo {M1}, sem cistos ou massas.'],
    [A, 'Cisto', 'Ovário direito ({M1}) com estrutura anecogênica de paredes finas, compatível com cisto ovariano/folicular.']
  ],
  'Ovário Esquerdo': [
    [N, 'Normal', 'Ovário esquerdo em topografia habitual, medindo {M1}, sem cistos ou massas.'],
    [A, 'Cisto', 'Ovário esquerdo ({M1}) com estrutura anecogênica de paredes finas, compatível com cisto ovariano/folicular.']
  ],
  'Testículo Direito': [
    [N, 'Normal', 'Testículo direito em bolsa escrotal, medindo {M1} x {M2}, de contornos regulares e parênquima homogêneo.'],
    [A, 'Nódulo', 'Testículo direito ({M1} x {M2}) com nódulo hipoecogênico em parênquima, sugestivo de neoplasia testicular.']
  ],
  'Testículo Esquerdo': [
    [N, 'Normal', 'Testículo esquerdo em bolsa escrotal, medindo {M1} x {M2}, de contornos regulares e parênquima homogêneo.'],
    [A, 'Nódulo', 'Testículo esquerdo ({M1} x {M2}) com nódulo hipoecogênico em parênquima, sugestivo de neoplasia testicular.']
  ],
  'Impressões Diagnósticas': [
    [N, 'Sem alterações', 'Estudo ultrassonográfico abdominal sem alterações dignas de nota nas estruturas avaliadas.'],
    [A, 'Correlacionar', 'Os achados ultrassonográficos devem ser correlacionados com a clínica, histórico e exames complementares do paciente.'],
    [A, 'Reavaliação', 'Sugere-se reavaliação ultrassonográfica em 15 a 30 dias para acompanhamento evolutivo.'],
    [A, 'Citologia guiada', 'Recomenda-se citologia aspirativa guiada por ultrassom das lesões descritas para elucidação diagnóstica.']
  ]
};

const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export const ULTRASOUND_TEMPLATES = Object.entries(RAW).flatMap(([organ, list]) =>
  list.map(([category, title, text]) => ({
    id: `usv_${slug(organ)}_${slug(title)}`,
    organ,
    title,
    category,
    lang: 'pt',
    practice: 'vet',
    builtin: true,
    text
  }))
);

// Referências ultrassonográficas (cm) de literatura veterinária — editáveis em Configurações > Valores Ref.
const REF = (species, organ, parameter, min, max) => ({
  id: `usref_${species}_${slug(organ)}_${slug(parameter)}`, species, organ, parameter, measurement_type: parameter,
  min_value: min, max_value: max, unit: 'cm', builtin: true
});

export const ULTRASOUND_REFERENCE_VALUES = [
  REF('dog', 'Vesícula Biliar', 'Espessura de parede', 0, 0.1),
  REF('cat', 'Vesícula Biliar', 'Espessura de parede', 0, 0.1),
  REF('dog', 'Vesícula Urinária', 'Espessura de parede', 0.1, 0.23),
  REF('cat', 'Vesícula Urinária', 'Espessura de parede', 0.13, 0.17),
  REF('dog', 'Estômago', 'Espessura de parede', 0.3, 0.5),
  REF('cat', 'Estômago', 'Espessura de parede', 0.17, 0.36),
  REF('dog', 'Duodeno', 'Espessura de parede', 0.3, 0.6),
  REF('cat', 'Duodeno', 'Espessura de parede', 0.2, 0.4),
  REF('dog', 'Jejuno', 'Espessura de parede', 0.2, 0.45),
  REF('cat', 'Jejuno', 'Espessura de parede', 0.16, 0.25),
  REF('dog', 'Íleo', 'Espessura de parede', 0.2, 0.4),
  REF('cat', 'Íleo', 'Espessura de parede', 0.2, 0.4),
  REF('dog', 'Cólon', 'Espessura de parede', 0.1, 0.2),
  REF('cat', 'Cólon', 'Espessura de parede', 0.1, 0.25),
  REF('cat', 'Pâncreas', 'Espessura', 0.3, 0.9),
  REF('dog', 'Adrenal Esquerda', 'Polo caudal', 0.3, 0.74),
  REF('dog', 'Adrenal Direita', 'Polo caudal', 0.3, 0.74),
  REF('cat', 'Adrenal Esquerda', 'Polo caudal', 0.3, 0.53),
  REF('cat', 'Adrenal Direita', 'Polo caudal', 0.3, 0.53),
  REF('dog', 'Adrenais', 'Esquerda – polo caudal', 0.3, 0.74),
  REF('dog', 'Adrenais', 'Direita – polo caudal', 0.3, 0.74),
  REF('cat', 'Adrenais', 'Esquerda – polo caudal', 0.3, 0.53),
  REF('cat', 'Adrenais', 'Direita – polo caudal', 0.3, 0.53),
  REF('cat', 'Rim Esquerdo', 'Comprimento', 3.0, 4.5),
  REF('cat', 'Rim Direito', 'Comprimento', 3.0, 4.5),
  REF('cat', 'Rins', 'Rim esquerdo – comprimento', 3.0, 4.5),
  REF('cat', 'Rins', 'Rim direito – comprimento', 3.0, 4.5),
  REF('cat', 'Baço', 'Espessura', 0, 1.0),
  REF('cat', 'Linfonodos', 'Espessura', 0, 0.5),
  REF('dog', 'Linfonodos', 'Espessura', 0, 0.8)
];

export const BUILTIN_SEED_VERSION = 1;
