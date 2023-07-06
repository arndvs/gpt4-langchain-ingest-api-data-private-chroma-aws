import { Document } from 'langchain/document';

export async function customPDFLoader(
  raw: Buffer, // raw file data
  filename: string = '',
): Promise<Document[]> {
  const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
  const parsed = await pdf(raw);
  return [
    new Document({
      pageContent: parsed.text,
      metadata: {
        // Max metadata size is 40KB
        // null metadata values are not supported by pinecone
        source: filename,
        pdf_numpages: parsed.numpages,
      },
    }),
  ];
}
