import { Chroma } from 'langchain/vectorstores';
import { CHROMA_COLLECTION_NAME } from '@/config/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export const loadChroma = async (embeddings: OpenAIEmbeddings) => {
    return await Chroma.fromExistingCollection(
        embeddings,
        {
            collectionName: CHROMA_COLLECTION_NAME,
        }
    );
}
