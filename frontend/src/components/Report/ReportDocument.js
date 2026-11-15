import React from 'react';
import { createPortal } from 'react-dom';
import { translate } from '@/services/translation';
import { getSpeciesLabel } from '@/config/dictionaries/vet_terms';
import { getOrganMeasurements } from '@/config/ultrasound_templates';
import { fillPlaceholders, findReference, evaluateMeasurement, formatRange } from '@/lib/ultrasound';
import logoImg from '../../logo-tvusvet.png';
import './report.css';

export const REPORT_TITLES = {
  echocardiogram: 'RELATÓRIO ECOCARDIOGRÁFICO',
  ecg: 'RELATÓRIO ELETROCARDIOGRÁFICO',
  radiography: 'RELATÓRIO RADIOGRÁFICO',
  tomography: 'RELATÓRIO TOMOGRÁFICO',
  ultrasound_abd: 'RELATÓRIO ULTRASSONOGRÁFICO'
};

const renderFormatted = (text) => text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
  if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
  if (part.startsWith('*') && part.endsWith('*') && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>;
  return <React.Fragment key={i}>{part}</React.Fragment>;
});

const ageLabel = (p) => {
  const y = Number(p?.birth_year);
  return p?.birth_year && Number.isFinite(y) ? `${new Date().getFullYear() - y} ano(s)` : '—';
};
const neuteredLabel = { yes: 'Sim', no: 'Não' };

const isPrintableImage = (img) => !img.mimeType?.includes('dicom') && !img.filename?.toLowerCase().endsWith('.dcm');

function MeasuresTable({ organ, patient, referenceValues }) {
  const rows = getOrganMeasurements(organ.organ_name)
    .map((d) => ({ d, m: organ.measurements?.[d.key] }))
    .filter(({ m }) => m && String(m.value).trim());
  if (!rows.length) return null;
  return (
    <table className="rd-measures">
      <tbody>
        {rows.map(({ d, m }) => {
          const ref = d.generic ? null : findReference(referenceValues, patient, organ.organ_name, d.label);
          const st = evaluateMeasurement(m.value, ref);
          return (
            <tr key={d.key}>
              <td>{d.label}</td>
              <td className="rd-num">{m.value} {m.unit || 'cm'}{st === 'high' ? ' ↑' : st === 'low' ? ' ↓' : ''}</td>
              {ref && <td className="rd-ref">Ref.: {formatRange(ref)}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Documento A4 do laudo — mesmo componente na pré-visualização e na impressão.
export function ReportDocument({ exam, patient, settings, organs, images, examDateTime, referringVet, examWeight, language = 'pt', referenceValues = [] }) {
  const t = (s) => translate(s, language);
  const filled = organs.filter((o) => (o.report_text || '').trim());
  const printableImages = (images || []).filter(isPrintableImage);
  const date = examDateTime ? new Date(examDateTime) : new Date();

  return (
    <div className="report-doc" data-testid="report-document">
      <header className="rd-header">
        <div className="rd-logo"><img src={settings?.letterhead_path || logoImg} alt="Logo" /></div>
        <div className="rd-clinic">
          <div className="rd-clinic-name">{settings?.clinic_name || 'Clínica Veterinária'}</div>
          {settings?.veterinarian_name && <div className="rd-vet">{settings.veterinarian_name}</div>}
          {settings?.crmv && <div>CRMV: {settings.crmv}</div>}
          {settings?.professional_phone && <div>Tel: {settings.professional_phone}</div>}
          {settings?.professional_email && <div>{settings.professional_email}</div>}
          {settings?.clinic_address && <div>{settings.clinic_address}</div>}
        </div>
      </header>

      <section className="rd-patient">
        <div><b>{t('Paciente')}:</b> {patient?.name}</div>
        <div><b>Espécie / {t('Raça')}:</b> {getSpeciesLabel(patient?.species)} / {patient?.breed || '—'}</div>
        <div><b>Sexo:</b> {patient?.sex === 'female' ? 'Fêmea' : 'Macho'}{neuteredLabel[patient?.neutered] ? ` · Castrado(a): ${neuteredLabel[patient.neutered]}` : ''}</div>
        <div><b>Idade:</b> {ageLabel(patient)}</div>
        <div><b>Peso:</b> {examWeight || patient?.weight || '—'} kg</div>
        <div><b>Tutor:</b> {patient?.owner_name || '—'}</div>
        <div><b>Solicitante:</b> {referringVet ? `Dr(a). ${referringVet}` : '—'}</div>
        <div><b>Data:</b> {date.toLocaleDateString('pt-BR')}</div>
      </section>

      <h1 className="rd-title">{REPORT_TITLES[exam?.exam_type] || 'RELATÓRIO DE EXAME'}</h1>

      {filled.map((o) => (
        <section key={o.organ_name} className="rd-organ" data-testid="report-organ-section">
          <h2>{t(o.organ_name)}</h2>
          <div className="rd-text">{renderFormatted(fillPlaceholders(o.report_text, o.measurements))}</div>
          <MeasuresTable organ={o} patient={patient} referenceValues={referenceValues} />
        </section>
      ))}

      {printableImages.length > 0 && (
        <section className="rd-images">
          <h2 className="rd-images-title">{t('Imagens')}</h2>
          <div className="rd-image-grid">
            {printableImages.map((img, i) => (
              <figure key={img.id || i} className="rd-image"><img src={img.data} alt={`Imagem ${i + 1}`} /><figcaption>Imagem {i + 1}</figcaption></figure>
            ))}
          </div>
        </section>
      )}

      <footer className="rd-signature">
        {settings?.signature_path && <img src={settings.signature_path} alt="Assinatura" />}
        <div className="rd-sig-line" />
        <div className="rd-vet">{settings?.veterinarian_name || 'Médico(a) Veterinário(a)'}</div>
        {settings?.crmv && <div>CRMV {settings.crmv}</div>}
        <div className="rd-date">{settings?.clinic_address ? `${settings.clinic_address.split(',').pop().trim()}, ` : ''}{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </footer>
    </div>
  );
}

// Conteúdo de impressão montado direto no <body> para paginar livremente (fora do layout com overflow).
export function PrintPortal({ settings, children }) {
  const m = settings?.letterhead_margins_mm || {};
  const page = `@page { size: A4; margin: ${m.top ?? 15}mm ${m.right ?? 15}mm ${m.bottom ?? 18}mm ${m.left ?? 15}mm; }`;
  return createPortal(
    <div id="print-root">
      <style>{`@media print { ${page} }`}</style>
      {children}
    </div>,
    document.body
  );
}

export { findMissingMeasures } from '@/lib/ultrasound';
