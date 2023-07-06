import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

    /**
     * ingest-data-pinecone.ts loads the document (PDF) files in the 'docs' folder via the DirectoryLoader,
     * converts the text into chunks of text and metadata via the RecursiveCharacterTextSplitter,
     * and then creates embeddings of the chunks via OpenAIEmbeddings, converts the embeddings into
     * vectors  the OpenAIEmbeddings. The embeddings are then
     * stored in the Pinecone vector store via the PineconeStore.
     *
     * npm run ingest-data-pinecone to run this script
     *
     */

/* Name of directory to retrieve your files from */

const filePath = 'docs';

export const run = async () => {
  try {
       /*load raw docs from the all files in the 'docs' directory */
    /**
     * Insert other loaders for different file types in a similar format
     *
     * For example:
     * ".docx": (path:string) => new ManualDocxLoader(path),
     */
    const directoryLoader = new DirectoryLoader(filePath, { // Directory Loader goes into 'docs', for every file in 'docs', converts them to text and metadata and puts them into a document object rawDocs.
      '.pdf': (path) => new PDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load(); // rawDocs contains the raw text and metadata of all the files in the 'docs' directory

     // Split text into chunks - maintains semantic relevance
     /**
      * Langchain has different ways to split text into chunks, RecursiveCharacterTextSplitter
      * is the recommended way - maintains semantic relevancy. splits according to paragraph breaks,
      * new lines, empty lines, and sentences. and then splits each paragraph into chunks of 1000
      * characters with 200 characters of overlap.
      * */
     const textSplitter = new RecursiveCharacterTextSplitter({ // imported from Langchain
        chunkSize: 1000, // max number of characters per chunk
        chunkOverlap: 200, // number of characters to overlap chunks
      });

      const docs = await textSplitter.splitDocuments(rawDocs); // docs contains the split documents
      console.log('split docs', docs);

      console.log('creating vector store...');
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings(); // takes text and converts them into numbers (vectors)
      // create index, which is a representation of the vector store Index_Name in Pinecone
      const index = pinecone.Index(PINECONE_INDEX_NAME); //Update index name for new ingest runs, initializes the vector database index


    //updates the vector store with new embeddings
    await PineconeStore.fromDocuments(docs, embeddings, {
            // documents get passed, converted to text, turned into embeddings, inserted into the namespace of the index specified.
        pineconeIndex: index,
        namespace: PINECONE_NAME_SPACE,
        textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
