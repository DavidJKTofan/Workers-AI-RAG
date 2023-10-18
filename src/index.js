import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
const app = new Hono();

// HANDLE CORS (Cross-Origin Resource Sharing) API CALLS
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
  })
);
app.options("*", (c) => {
  return c.text("", 204);
});

// NOTES
// wrangler d1 execute dls-db --command "INSERT INTO notes (text) VALUES ('The best pizza topping is pepperoni')"
app.post("/notes", async (c) => {
  const ai = new Ai(c.env.AI);

  const { text } = await c.req.json();
  if (!text) {
    return c.text("Missing text", 400);
  }

  const { results } = await c.env.DATABASE.prepare(
    "INSERT INTO notes (text) VALUES (?) RETURNING *"
  )
    .bind(text)
    .run();

  const record = results.length ? results[0] : null;

  if (!record) {
    return c.text("Failed to create note", 500);
  }

  const { data } = await ai.run("@cf/baai/bge-large-en-v1.5", { text: [text] });
  const values = data[0];

  if (!values) {
    return c.text("Failed to generate vector embedding", 500);
  }

  const { id } = record;
  const inserted = await c.env.VECTOR_INDEX.upsert([
    {
      id: id.toString(),
      values,
    },
  ]);

  return c.json({ id, text, inserted });
});

// INDEX
app.get("/", async (c) => {
  const ai = new Ai(c.env.AI);

  const question = c.req.query("text") || "What is the square root of 9?";

  const embeddings = await ai.run("@cf/baai/bge-large-en-v1.5", {
    text: question,
  });
  const vectors = embeddings.data[0];

  const SIMILARITY_CUTOFF = 0.75;
  const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
  const vecIds = vectorQuery.matches
    .filter((vec) => vec.score > SIMILARITY_CUTOFF)
    .map((vec) => vec.vectorId);

  let notes = [];
  if (vecIds.length) {
    const query = `SELECT * FROM notes WHERE id IN (${vecIds.join(", ")})`;
    const { results } = await c.env.DATABASE.prepare(query).bind().all();
    if (results) notes = results.map((vec) => vec.text);
  }

  const contextMessage = notes.length
    ? `Context:\n${notes.map((note) => `- ${note}`).join("\n")}`
    : "";

  const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant. Limit your answers to 180 words or less.`;

  const { response: answer } = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
    messages: [
      ...(notes.length ? [{ role: "system", content: contextMessage }] : []),
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
  });

  // return c.text(answer);
  return c.json(answer);
});

app.onError((err, c) => {
  return c.text(err);
});

export default app;
