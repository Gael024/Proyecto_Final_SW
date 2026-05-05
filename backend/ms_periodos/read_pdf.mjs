import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/build/pdf.mjs';

async function readPDF() {
  const data = new Uint8Array(readFileSync('./PA_PRIMAVERA_2026_CU_SAN_MANUEL_ITI.pdf'));
  const doc = await getDocument({ data }).promise;
  
  console.log('=== PAGES:', doc.numPages, '===\n');
  
  for (let i = 1; i <= Math.min(doc.numPages, 3); i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    console.log(`=== PAGE ${i} ===`);
    console.log(text);
    console.log('\n');
  }
}

readPDF().catch(console.error);
