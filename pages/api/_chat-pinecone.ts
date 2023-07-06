import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body; // extract question and history from the request body

  console.log('question', question, 'history', history);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    // Create the index
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
         // Create vector store from existing index
      new OpenAIEmbeddings({}),// Create embeddings
      {
        pineconeIndex: index, // Pass in Pinecone index, set in config/pinecone.ts
        textKey: 'text', // Pass in text key
        namespace: PINECONE_NAME_SPACE, // Pass in namespace, set in config/pinecone.ts
      },
    );

    // Create a custom chain, which strips down the langchain to expose the call method | makechain is at /utils/makechain.ts
    const chain = makeChain(vectorStore); // make the chain with the vector store and preparing the ConversationalRetrievalQAChain

    //Ask a question using chat history
    const response = await chain.call({ // call the chain with the question and history when the user clicks submit
      question: sanitizedQuestion, // pass in the sanitized question
      chat_history: history || [], // pass in the history or an empty array
    });

    console.log('response', response); // log the response
    res.status(200).json(response); // send the response back to the client (index) as json data with a 200 status code to index
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
