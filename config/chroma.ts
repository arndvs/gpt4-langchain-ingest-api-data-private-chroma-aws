/**
 * Change the namespace to the namespace on Chroma you'd like to store your embeddings.
 */

const CHROMA_AWS_API_GATEWAY_URL = process.env.CHROMA_AWS_API_GATEWAY_URL; // Private AWS Deployed Chroma API Gateway URL
const CHROMA_AWS_API_TOKEN = process.env.CHROMA_AWS_API_TOKEN; // Private AWS Deployed Chroma API Gateway Token

const CHROMA_AXIOS_API_URL = process.env.CHROMA_AXIOS_API_URL; // Chroma Axios API URL
const CHROMA_AXIOS_API_TOKEN = process.env.CHROMA_AXIOS_API_TOKEN; // Chroma Axios API Token
const CHROMA_COLLECTION_NAME= process.env.CHROMA_COLLECTION_NAME

export { CHROMA_AWS_API_GATEWAY_URL, CHROMA_AWS_API_TOKEN, CHROMA_AXIOS_API_URL, CHROMA_AXIOS_API_TOKEN, CHROMA_COLLECTION_NAME };
