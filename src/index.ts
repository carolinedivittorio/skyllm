import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import { OpenAI } from "openai";
import twilio from "twilio";
import { twiml as TwilioTwiml } from "twilio";
import Redis from "ioredis";

config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (req, res) => {
  console.log("Twilio status callback received:", req.query);
  res.status(200).send("OK");
});

app.post("/webhook", async (req, res) => {
  const incomingMessage = req.body.Body;
  const from = req.body.From;

  let reply: string = "";

  try {
    if (/^\*+$/.test(incomingMessage.trim())) {
      await redis.del(`chat:${from}`);
      reply = "Chat history cleared! Starting a new conversation.";
    } else {
      const redisChatHistory = await redis.get(`chat:${from}`);
      const chatHistory = redisChatHistory ? JSON.parse(redisChatHistory) : [];
      chatHistory.push({ role: "user", content: incomingMessage });

      const response = (
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: chatHistory,
        })
      ).choices[0].message.content;

      reply = response ? response : "There was an error generating a response";
      chatHistory.push({ role: "assistant", content: reply });

      const trimmedHistory = chatHistory.slice(-20);
      await redis.setex(`chat:${from}`, 86400, JSON.stringify(trimmedHistory)); // expire in 24 hrs
    }
  } catch (err) {
    reply = "There was an error processing your message.";
  }
  const response = new TwilioTwiml.MessagingResponse();
  response.message(reply);

  res.type("text/xml").send(response.toString());
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
