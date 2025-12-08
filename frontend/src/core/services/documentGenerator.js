import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export const generatePrescriptionDOCX = async (prescription, patient, settings, terms) => {
    // Helper to create rows
    const createDrugRow = (index, item) => {
        return new Paragraph({
            children: [
                new TextRun({
                    text: `${index + 1}. ${item.drug_name}`,
                    bold: true,
                    size: 24, // 12pt
                    font: "Arial"
                }),
                new TextRun({
                    text: `\n   ${item.dosage}`,
                    italics: true,
                    size: 22, // 11pt
                    font: "Arial"
                }),
                new TextRun({
                    text: item.quantity ? `  —  Qtd: ${item.quantity}` : "",
                    size: 20,
                    font: "Arial"
                }),
                new TextRun({
                    text: "\n", // Spacer
                })
            ],
            spacing: { after: 200 }
        });
    };

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1000, // Adjust based on letterhead
                        right: 1000,
                        bottom: 1000,
                        left: 1000,
                    },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: settings.clinic_name || "Minha Clínica",
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: settings.veterinarian_name || "Dr. Responsável",
                                    size: 24,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                }),
            },
            children: [
                // Title
                new Paragraph({
                    text: terms.prescription_header.toUpperCase(),
                    heading: "Heading1",
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 400 },
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 6, space: 1 },
                    },
                }),

                // Patient Info
                new Paragraph({
                    children: [
                        new TextRun({ text: `${terms.patient_label}: `, bold: true }),
                        new TextRun({ text: patient.name }),
                        new TextRun({ text: `    ${terms.owner_label}: `, bold: true }),
                        new TextRun({ text: patient.owner_name || "N/A" }),
                    ],
                    spacing: { after: 400 },
                }),

                // Drugs List
                ...prescription.items.map((item, idx) => createDrugRow(idx, item)),

                // Notes
                prescription.notes ? new Paragraph({
                    children: [
                        new TextRun({ text: "Observações:\n", bold: true }),
                        new TextRun({ text: prescription.notes }),
                    ],
                    spacing: { before: 400 },
                }) : new Paragraph({}),

                // Footer / Date
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `\n\n${settings.clinic_address || "Cidade/UF"}, ${new Date().toLocaleDateString()}`,
                            italics: true,
                        }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 800 },
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Receita_${patient.name}_${new Date().toISOString().split('T')[0]}.docx`);
};
