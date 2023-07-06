import { Chroma } from 'langchain/vectorstores';
import { CHROMA_NAME_SPACE } from '@/config/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export const loadChroma = async (embeddings: OpenAIEmbeddings) => {
    return await Chroma.fromExistingCollection(
        embeddings,
        {
            collectionName: CHROMA_NAME_SPACE,
        }
    );
}
