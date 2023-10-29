# Retrieval Augmented Generation (RAG) AI

Building a Retrieval Augmented Generation (RAG) AI with Cloudflare:
* Workers AI
* Vectorize
* D1 database

Using the models:
* Generative text model `@cf/meta/llama-2-7b-chat-int8`
* Embedding / Feature extraction model `@cf/baai/bge-large-en-v1.5`

Tutorial: https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/

## Usage

Visit `ai.cf-testing.com` and add your question to the `?text=` query:
```
https://ai.cf-testing.com/?text=What%20is%20the%20capital%20of%20France?
```

# Disclaimer

For educational purposes only.
