import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Chroma } from 'langchain/vectorstores/chroma';
import { CHROMA_COLLECTION_NAME, CHROMA_API_GATEWAY_URL, CHROMA_API_TOKEN } from '@/config/chroma';
import { ChromaClient } from 'chromadb';
import { CustomPDFLoader } from '@/utils/customPDFLoader';


/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {


    // if (!CHROMA_API_GATEWAY_URL || !CHROMA_API_TOKEN) {
    //     throw new Error('CHROMA_API_GATEWAY_URL or CHROMA_API_TOKEN is not set in the environment variables');
    //   }

  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new CustomPDFLoader(path),
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


    if (!CHROMA_API_TOKEN) {
        throw new Error('CHROMA_API_TOKEN is not defined');
      }

      let headers = new Headers();
      headers.append('x-api-key', CHROMA_API_TOKEN);

       let chroma = new Chroma(new OpenAIEmbeddings(), {
        index: new ChromaClient({
            path: CHROMA_API_GATEWAY_URL,
            fetchOptions: {
                headers: {
                  'X-Api-Key': "", // Check with what the Gateway expects, typically is X-Api-Key, validated via Postman first using GET /api/v1/heartbeat endpoint to see if you can reach
                }
              }
        }),
      collectionName: CHROMA_COLLECTION_NAME, });
    await chroma.index?.reset();


    for (let i = 0; i < docs.length; i += 100) {
        const batch = docs.slice(i, i + 100);
        await Chroma.fromDocuments(batch, embeddings, {
            index: new ChromaClient({
                path: CHROMA_API_GATEWAY_URL,
                fetchOptions: {
                    headers: {
                        'x-api-key': "", // Check with what the Gateway expects, typically is X-Api-Key, validated via Postman first using GET /api/v1/heartbeat endpoint to see if you can reach
                    }
                  }
            }),
          collectionName: CHROMA_COLLECTION_NAME,
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
