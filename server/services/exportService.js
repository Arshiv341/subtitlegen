const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const { formatSeconds, formatSrtTimestamp } = require('../utils/timeFormat');

class ExportService {
  /**
   * Export to plain text (.txt)
   */
  generateTxt(transcription) {
    const lines = [];
    lines.push(`Title: ${transcription.title || 'Untitled'}`);
    lines.push(`Original File: ${transcription.originalFileName}`);
    lines.push(`Duration: ${formatSeconds(transcription.duration)}`);
    lines.push(`Date: ${new Date(transcription.createdAt).toLocaleString()}`);
    lines.push('--------------------------------------------------\n');

    (transcription.transcript || []).forEach((seg) => {
      const time = formatSeconds(seg.start);
      lines.push(`[${time}] ${seg.text}`);
    });

    return lines.join('\n');
  }

  /**
   * Export to valid SubRip format (.srt)
   */
  generateSrt(transcription) {
    const segments = transcription.transcript || [];
    const blocks = [];

    segments.forEach((seg, index) => {
      const seq = index + 1;
      const startTime = formatSrtTimestamp(seg.start);
      const endTime = formatSrtTimestamp(seg.end > seg.start ? seg.end : seg.start + 2);
      const text = seg.text.trim();

      blocks.push(`${seq}\n${startTime} --> ${endTime}\n${text}\n`);
    });

    return blocks.join('\n');
  }

  /**
   * Export to clean, professional PDF
   * Returns a Promise resolving to a Buffer
   */
  generatePdf(transcription) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          info: {
            Title: transcription.title || 'Transcript',
            Author: 'VideoText',
          },
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc
          .fillColor('#111111')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(transcription.title || 'Video Transcript', { align: 'left' });

        doc.moveDown(0.5);

        // Metadata box
        doc
          .fillColor('#666666')
          .fontSize(9)
          .font('Helvetica')
          .text(`File: ${transcription.originalFileName}   |   Duration: ${formatSeconds(transcription.duration)}   |   Date: ${new Date(transcription.createdAt).toLocaleDateString()}`);

        doc.moveDown(0.8);

        // Divider
        doc
          .strokeColor('#E5E5E5')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke();

        doc.moveDown(1);

        // Segments
        const segments = transcription.transcript || [];
        if (segments.length === 0) {
          doc
            .fillColor('#666666')
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text('No transcript segments available.');
        } else {
          segments.forEach((seg) => {
            const timeStr = formatSeconds(seg.start);
            
            // Timestamp in subtle charcoal/blue
            doc
              .fillColor('#4B5563')
              .fontSize(9)
              .font('Helvetica-Bold')
              .text(timeStr, { continued: false });

            // Segment text
            doc
              .fillColor('#111111')
              .fontSize(10.5)
              .font('Helvetica')
              .lineGap(3)
              .text(seg.text);

            doc.moveDown(0.7);
          });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Export to Word (.docx)
   * Returns a Promise resolving to a Buffer
   */
  async generateDocx(transcription) {
    const segments = transcription.transcript || [];

    const docChildren = [
      new Paragraph({
        text: transcription.title || 'Video Transcript',
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Original File: ${transcription.originalFileName}   |   `, color: '666666', size: 18 }),
          new TextRun({ text: `Duration: ${formatSeconds(transcription.duration)}   |   `, color: '666666', size: 18 }),
          new TextRun({ text: `Date: ${new Date(transcription.createdAt).toLocaleDateString()}`, color: '666666', size: 18 }),
        ],
        spacing: { after: 300 },
      }),
    ];

    segments.forEach((seg) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${formatSeconds(seg.start)}] `,
              bold: true,
              color: '4B5563',
              size: 20,
            }),
            new TextRun({
              text: seg.text,
              color: '111111',
              size: 22,
            }),
          ],
          spacing: { after: 160 },
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

module.exports = new ExportService();
