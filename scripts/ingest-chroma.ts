import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ManualPDFLoader } from '@/utils/manualPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Chroma } from 'langchain/vectorstores/chroma';
import { CHROMA_COLLECTION_NAME, CHROMA_API_GATEWAY_URL, CHROMA_API_TOKEN } from '@/config/chroma';
import { ChromaClient } from 'chromadb';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {


    if (!CHROMA_API_GATEWAY_URL || !CHROMA_API_TOKEN) {
        throw new Error('CHROMA_API_GATEWAY_URL or CHROMA_API_TOKEN is not set in the environment variables');
      }

  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new ManualPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    // const chromaArgs = {
    //     collectionName: CHROMA_NAME_SPACE,
    //     url: CHROMA_API_GATEWAY_URL,
    //     chromaApiToken: CHROMA_API_TOKEN,
    //   };
    //   console.log('chromaArgs', chromaArgs);

    let chroma = new Chroma(embeddings,
        { collectionName: CHROMA_COLLECTION_NAME, url: CHROMA_API_GATEWAY_URL
        }
        );
    await chroma.index?.reset();

    const chromaClient = new ChromaClient({
        path: CHROMA_API_GATEWAY_URL
      });

    // Ingest documents in batches of 100
    for (let i = 0; i < docs.length; i += 100) {
      const batch = docs.slice(i, i + 100);
      await Chroma.fromDocuments(batch, embeddings, {
        // collectionName: CHROMA_COLLECTION_NAME,
        index: chromaClient
      });
    }
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
