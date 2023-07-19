import axios from 'axios';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { CHROMA_AWS_API_GATEWAY_URL, CHROMA_AWS_API_TOKEN, CHROMA_AXIOS_API_TOKEN, CHROMA_AXIOS_API_URL, CHROMA_COLLECTION_NAME } from '@/config/chroma';
import { ChromaClient } from 'chromadb';

export const run = async () => {

/* API route & Token to retrieve the documents */
const apiUrl: string = CHROMA_AXIOS_API_URL!;
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

      console.log('response', responseData, 'end response');

    //  const loader = new JSONLoader(responseData); - if json is sitting in directory statically

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const responseJsonString = JSON.stringify(responseData);
    console.log('response', responseJsonString);

    const test = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

    const docs = await textSplitter.createDocuments([responseJsonString]); // pass in the json string
    console.log('docs', docs, 'end docs'    )

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    console.log('embeddings ', embeddings    )

    const chromaClientConfig = {
        index: new ChromaClient({
          path: CHROMA_AWS_API_GATEWAY_URL,
          fetchOptions: {
            headers: {
              'X-Api-Key': CHROMA_AWS_API_TOKEN, // Check with what the Gateway expects, typically is X-Api-Key, validated via Postman first using GET /api/v1/heartbeat endpoint to see if you can reach
            },
        } as RequestInit,
      }),
        collectionName: CHROMA_COLLECTION_NAME,
      };

    const chroma = new Chroma(new OpenAIEmbeddings(), chromaClientConfig);
    await chroma.index?.reset();

    for (let i = 0; i < docs.length; i += 100) {
        const batch = docs.slice(i, i + 100);
        await Chroma.fromDocuments(batch, new OpenAIEmbeddings(), chromaClientConfig);
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
