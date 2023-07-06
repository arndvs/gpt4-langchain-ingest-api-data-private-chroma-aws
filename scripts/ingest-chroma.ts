import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { ManualPDFLoader } from '@/utils/manualPDFLoader';
import { CHROMA_NAME_SPACE } from '@/config/chroma';


    /**
     * ingest-chroma.ts loads the document (PDF) files in the 'docs' folder via the DirectoryLoader,
     * converts the text into chunks of text and metadata via the RecursiveCharacterTextSplitter,
     * and then creates embeddings of the chunks via OpenAIEmbeddings, converts the embeddings into
     * vectors  the OpenAIEmbeddings. The embeddings are then
     * stored in the chroma vector store via the chromaStore.
     *
     * npm run ingest-chroma to run this script
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
        '.pdf': (path) => new ManualPDFLoader(path),
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


      //embed the PDF documents
      const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
        collectionName: CHROMA_NAME_SPACE,
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
