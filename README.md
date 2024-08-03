# Retrieval Augmented Generation (RAG) AI

Building a Retrieval Augmented Generation (RAG) AI with Cloudflare:
* Workers AI
* Vectorize
* D1 database
* Hono ([external dependency](https://hono.dev/))

Using the models:
* Generative text model `@cf/meta/llama-3.1-8b-instruct` - [llama-3.1-8b-instruct](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct/)
* Text Embedding / Feature extraction model `@cf/baai/bge-large-en-v1.5` - [bge-large-en-v1.5](https://developers.cloudflare.com/workers-ai/models/bge-large-en-v1.5/)

Tutorial: [Build a Retrieval Augmented Generation (RAG) AI](https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/)

## Usage

Visit `ai.cf-testing.com` and add your question to the `?text=` query:
```
https://ai.cf-testing.com/?text=What%20is%20the%20capital%20of%20France?
```

# Disclaimer

For educational purposes only.
