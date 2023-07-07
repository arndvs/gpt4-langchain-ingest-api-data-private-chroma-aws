/**
 * Change the namespace to the namespace on Chroma you'd like to store your embeddings.
 */

const CHROMA_COLLECTION_NAME = 'pdf-test'; //namespace is optional for your vectors
const CHROMA_API_GATEWAY_URL = process.env.CHROMA_API_GATEWAY_URL;
const CHROMA_API_TOKEN = process.env.CHROMA_API_TOKEN;


export { CHROMA_COLLECTION_NAME, CHROMA_API_GATEWAY_URL, CHROMA_API_TOKEN };
