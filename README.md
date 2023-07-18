# GPT-4, LangChain, Private Chroma DB Deployed to AWS, Ingesting Data Via API

Tech stack used includes LangChain, Private Chroma DB Deployed to AWS, Typescript, Openai, and Next.js. LangChain is a framework that makes it easier to build scalable AI/LLM apps and chatbots. Chroma is an opensource vectorstore for storing embeddings and your API data.

[How to Deploy Private Chroma Vector DB to AWS video](https://www.youtube.com/watch?v=rD3G3hbAawE)

## Development

1. Clone the repo or download the ZIP

```
git clone [github https url]
```

2. Install packages

First run `npm install yarn -g` to install yarn globally (if you haven't already).

Then run:

```
yarn install
```

After installation, you should now see a `node_modules` folder.

3. Set up your `.env` file

- Copy `.env.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=

CHROMA_AWS_API_TOKEN=
CHROMA_AWS_API_GATEWAY_URL=

CHROMA_AXIOS_API_URL=
CHROMA_AXIOS_API_TOKEN=
CHROMA_COLLECTION_NAME=

```

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys and insert into your `.env` file.
- Visit [Chroma](https://www.trychroma.com/)

## Credit
Frontend of this repo is inspired by [langchain-chat-nextjs](https://github.com/zahidkhawaja/langchain-chat-nextjs)
Large portions of this repo is inspired by [gpt4-pdf-chatbot-langchain](https://github.com/mayooear/gpt4-pdf-chatbot-langchain)
How to Deploy Private Chroma Vector DB to AWS [Deploy a PRIVATE Chroma Vector DB to AWS | Step by step tutorial | Part 2](https://www.youtube.com/watch?v=rD3G3hbAawE)
