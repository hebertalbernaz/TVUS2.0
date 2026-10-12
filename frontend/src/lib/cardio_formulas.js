/**
 * Fórmulas de Ecocardiografia (Método Teichholz)
 * Utilizado para Veterinária e Humana
 */

export const calculateEcho = (measurements) => {
    // Converter strings para float e garantir segurança
    const val = (key) => {
        const v = parseFloat(measurements[key]);
        return isNaN(v) ? 0 : v;
    };

    const results = {};

    // 1. Relação Átrio Esquerdo / Aorta (AE/Ao)
    // Avalia aumento atrial. Normal cão: < 1.6
    const ae = val('ae'); // Left Atrium
    const ao = val('ao'); // Aorta
    if (ao > 0 && ae > 0) {
        results.ae_ao_ratio = (ae / ao).toFixed(2);
    }

    // 2. Fração de Encurtamento (FS%) ou Delta D
    // ((Diástole - Sístole) / Diástole) * 100
    // Avalia contratilidade miocárdica
    const dived = val('dived'); // LVIDd (Diástole)
    const dives = val('dives'); // LVIDs (Sístole)
    
    if (dived > 0) {
        const fs = ((dived - dives) / dived) * 100;
        results.fs = fs.toFixed(1); // Ex: 35.5%
    }

    // 3. Fração de Ejeção (FE%) - Método Teichholz
    // Volume = (7.0 / (2.4 + D)) * D³
    if (dived > 0 && dives > 0) {
        const volD = (7.0 / (2.4 + dived)) * Math.pow(dived, 3);
        const volS = (7.0 / (2.4 + dives)) * Math.pow(dives, 3);
        
        if (volD > 0) {
            const fe = ((volD - volS) / volD) * 100;
            results.fe = fe.toFixed(1); // Ex: 65.2%
            results.edv = volD.toFixed(1); // Volume Diastólico Final (ml)
            results.esv = volS.toFixed(1); // Volume Sistólico Final (ml)
        }
    }

    // 4. Massa do VE (Opcional, fórmula complexa do ASE)
    // 0.8 * (1.04 * ((SIVd + DIVE + PPVE)^3 - DIVE^3)) + 0.6
    const sivd = val('sivd');
    const ppve = val('ppve');
    if (dived > 0 && sivd > 0 && ppve > 0) {
        const mass = 0.8 * (1.04 * (Math.pow(sivd + dived + ppve, 3) - Math.pow(dived, 3))) + 0.6;
        results.lv_mass = mass.toFixed(1);
    }

    return results;
};

// Gera um texto resumo automático baseado nos números
export const generateAutoReport = (data, results) => {
    const parts = [];

    // Função sistólica
    const fs = parseFloat(results.fs);
    if (!isNaN(fs)) {
        if (fs < 28) parts.push("Função sistólica do ventrículo esquerdo reduzida.");
        else parts.push("Função sistólica do ventrículo esquerdo preservada.");
    }

    // Dimensões
    if (results.ae_ao_ratio && parseFloat(results.ae_ao_ratio) > 1.6) {
        parts.push(`Aumento do átrio esquerdo (Relação AE/Ao: ${results.ae_ao_ratio}).`);
    } else if (results.ae_ao_ratio) {
        parts.push(`Átrio esquerdo com dimensões preservadas.`);
    }

    return parts.join(" ");
};