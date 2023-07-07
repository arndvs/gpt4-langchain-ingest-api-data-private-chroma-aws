import { Chroma } from 'langchain/vectorstores';
import { CHROMA_COLLECTION_NAME, CHROMA_API_GATEWAY_URL } from '@/config/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export const loadChroma = async (embeddings: OpenAIEmbeddings) => {
    return await Chroma.fromExistingCollection(
        embeddings,
        {
            collectionName: CHROMA_COLLECTION_NAME,
            url: CHROMA_API_GATEWAY_URL,
        }
    );
}
