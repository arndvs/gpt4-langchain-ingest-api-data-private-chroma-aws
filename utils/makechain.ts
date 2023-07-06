import { OpenAI } from 'langchain/llms/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// 'system' prompt
const QA_PROMPT = `You are an AI assistant providing helpful advice. Use the following pieces of context to answer the question at the end.
If you don't know the answer based on the context below, just say "Hmm, I'm not sure." DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: Chroma ) => {

  const model = new OpenAI({ // model to use with the chat interaction
    temperature: 0, // increase temperature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access to the api
    streaming: true,
    // maxTokens: 250,
    // topP: 1,
    // frequencyPenalty: 0,
    // presencePenalty: 0,
    // stop: ['\n'],
  });


  /**
   * RetrievalQAChain is a question answer chain that takes in a model, a vector store, and a
   * set of parameters to answer a question. Useful if user asks a question and you want to answer.
   *
   * ConversationalRetrievalQAChain adds the ability to chat with the model and include previous
   * questions/answers chat history context in the question answering.
   *
   */
  const chain = ConversationalRetrievalQAChain.fromLLM(  // combines question with chat history, converts to standalone question, and then does the question answering
    // model and vector store takes in the docs, does the embeddings, stores them in the
    // vector store, retrieves the the relevant documents, and then does the question answering
  model,
    vectorstore.asRetriever(),
    /* Ask it a question with history*/
    {
      qaTemplate: QA_PROMPT, // combines the System Message, Context and Question together to form a Prompt
      questionGeneratorTemplate: CONDENSE_PROMPT, // question prompt plus the chat history i.e. given the following question and the previous chat history, combine them together to a stand-alone question, that is then converted to embeddings
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );

  return chain;
};
