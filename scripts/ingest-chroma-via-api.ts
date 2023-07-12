import axios from 'axios';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Chroma } from 'langchain/vectorstores/chroma';
import { CHROMA_AWS_API_GATEWAY_URL, CHROMA_AWS_API_TOKEN, CHROMA_AXIOS_API_TOKEN, CHROMA_AXIOS_API_URL } from '@/config/chroma';
import { ChromaClient } from 'chromadb';
import { CustomPDFLoader } from '@/utils/customPDFLoader';

export const run = async () => {

/* API route to retrieve the documents */
const apiUrl: string = CHROMA_AXIOS_API_URL ?? 'https://default.url/api/v1/ingest';
const apiToken = CHROMA_AXIOS_API_TOKEN;

  try {

    if (!CHROMA_AWS_API_GATEWAY_URL || !CHROMA_AWS_API_TOKEN || !CHROMA_AXIOS_API_URL || !CHROMA_AXIOS_API_TOKEN ) {
        throw new Error('CHROMA_AWS_API_GATEWAY_URL, CHROMA_AWS_API_TOKEN, CHROMA_AXIOS_API_URL, or CHROMA_AXIOS_API_TOKEN is not defined');
      }

    /* Retrieve raw data from the API */
    const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
      const responseData = response.data;

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const data = await textSplitter.splitDocuments(responseData);
    console.log('split docs', data);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    const CHROMA_COLLECTION_NAME = `${responseData?.store ?? 'store'} axios-api-data`; // change this to the name of your collection on Chroma

      let headers = new Headers();
      headers.append('x-api-key', CHROMA_AWS_API_TOKEN);

       let chroma = new Chroma(new OpenAIEmbeddings(), {
        index: new ChromaClient({
            path: CHROMA_AWS_API_GATEWAY_URL,
            fetchOptions: {
                headers: {
                  'X-Api-Key': CHROMA_AWS_API_TOKEN, // Check with what the Gateway expects, typically is X-Api-Key, validated via Postman first using GET /api/v1/heartbeat endpoint to see if you can reach
                }
              }
        }),
      collectionName: CHROMA_COLLECTION_NAME, });
    await chroma.index?.reset();

    for (let i = 0; i < data.length; i += 100) {
        const batch = data.slice(i, i + 100);
        await Chroma.fromDocuments(batch, embeddings, {
            index: new ChromaClient({
                path: CHROMA_AWS_API_GATEWAY_URL,
                fetchOptions: {
                    headers: {
                        'x-api-key': CHROMA_AWS_API_TOKEN, // Check with what the Gateway expects, typically is X-Api-Key, validated via Postman first using GET /api/v1/heartbeat endpoint to see if you can reach
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
