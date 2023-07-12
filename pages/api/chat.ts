import type { NextApiRequest, NextApiResponse } from 'next';
import { loadVectorStore } from '@/utils/loadVectorStore';
import { makeChain } from '@/utils/makechain';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CHROMA_API_GATEWAY_URL } from '@/config/chroma';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { ChromaClient } from 'chromadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body; // extract question and history from the request body

  console.log('question', question);
  console.log('history', history);

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
    const CHROMA_COLLECTION_NAME = 'api-data'; // change this to the name of your collection on Chroma

    const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings({}),
        { index: new ChromaClient({
            path: CHROMA_API_GATEWAY_URL,
        }),

          collectionName: CHROMA_COLLECTION_NAME,
        },
      );


    // Create a custom chain, which strips down the langchain to expose the call method | makechain is at /utils/makechain.ts
    const chain = makeChain(vectorStore); // make the chain with the vector store and preparing the ConversationalRetrievalQAChain

    const pastMessages = history.map((message: string, i: number) => {
        if (i % 2 === 0) {
          return new HumanMessage(message);
        } else {
          return new AIMessage(message);
        }
      });

    //Ask a question using chat history
    const response = await chain.call({ // call the chain with the question and history when the user clicks submit
      question: sanitizedQuestion, // pass in the sanitized question
      chat_history: pastMessages // pass in the history or an empty array

    });

    console.log('response', response); // log the response
    res.status(200).json(response); // send the response back to the client (index) as json data with a 200 status code to index
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
