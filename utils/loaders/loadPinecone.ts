import { PineconeStore } from 'langchain/vectorstores';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { pinecone } from '../pinecone-client';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export const loadPinecone = async (embeddings: OpenAIEmbeddings) => {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    return await PineconeStore.fromExistingIndex(
        embeddings,
        {
            pineconeIndex: index,
            textKey: 'text',
            namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
        },
    );
};
