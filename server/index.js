import dotenv from "dotenv";

import express from "express";
import { OpenAI, toFile } from "openai";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import bodyParser from "body-parser";
import { config } from "dotenv-flow";
import { fileURLToPath } from "url";

import path from "path";
import functionCalling from "./openAI/functionCalling.js";
import convertToWav from "./openAI/utils/convertToWav.js";
config({ path: "./", silent: true });
import getOpenAiInstance from "./openAI/utils/openai.js";

const app = express();

const port = 5000;
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer({ dest: "../../uploads/" });

app.post("/generate-text", async (req, res) => {
  const prompt = req.body.prompt;
  const configuration = {
    organization: process.env.ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  };
  const openai = new OpenAI(configuration);

  try {
    const completion = await openai.completions.create({
      // gpt-3.5-turbo-instruct
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 500,
      // temperature: 1,
      // stop: ":",
      // presence_penalty: 2,
      // seed: 42,
      // n: 2,
    });

    const text = completion.choices[0].text;
    res.send(text);
  } catch (error) {
    res.status(500).send("Error generating text");
  }
});

app.post("/generate-stream-text", async (req, res) => {
  const openai = getOpenAiInstance();
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      messages: [
        { role: "system", content: "reply in bullet points when ever you can" },
        { role: "user", content: req.body.prompt },
      ],
      stream: true,
    });

    res.header("Content-Type", "text/plain");
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(content);
    }
    res.end();
  } catch (e) {
    res.status(500).send("Error generating stream text");
  }
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;
  const systemMessage = {
    role: "system",
    content: "You are a helpful assistant.",
  };
  const conversation = [systemMessage];
  // [
  //   {role: "system", content: "You are a helpful assistant."},
  //   {role: "user", content: "Hi"},
  //   {role: "assistant", content: "Hello! How can I assist you today?"},
  //   {},

  // ]

  try {
    conversation.push({ role: "user", content: userInput });

    const openai = getOpenAiInstance();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      max_tokens: 250,
    });
    const assistantResponse = response.choices[0].message;

    conversation.push(assistantResponse);
    return res.send(assistantResponse.content);
  } catch (error) {
    res.status(500).send("Error generating text");
  }
});

app.get("/customer-reviews", async (req, res) => {
  const reviews = [
    {
      review:
        "Nintendo's 8-bit Mario game is a masterpiece in classic gaming. The gameplay is challenging yet engaging, offering a perfect balance of difficulty and enjoyment. The levels are well-designed, encouraging strategic thinking and quick reflexes. However, newcomers to the 8-bit era might find the controls a bit rigid compared to modern games",
    },
    {
      review:
        "As a retro game enthusiast, I appreciate the vintage charm of Mario's 8-bit graphics. The pixel art is iconic and has a certain nostalgic appeal. However, for those used to high-definition graphics, it might seem overly simplistic. The visual style, though, is a true representation of video gaming history.",
    },
    {
      review:
        "Playing the Nintendo 8-bit Mario game is like taking a trip down memory lane. It brings back memories of childhood gaming sessions. The game's legacy in shaping the platformer genre is undeniable. Its simple yet captivating storyline and character design have stood the test of time. This game is more about the experience and nostalgia than cutting-edge technology.",
    },
    {
      review:
        "While the 8-bit Mario game is praised for its historic value, I find its replay value limited due to repetitive level design and predictable challenges. The sound design, a key aspect of immersive gameplay, is monotonous and lacks variety. This, combined with the absence of an engaging storyline, makes the game less captivating for players seeking depth and innovation in their gaming experience.",
    },
  ];

  let combinedReviews = reviews.map((review) => review.review).join("\n");
  const delimiter = "####";
  const prompt = `Summarize the following customer reviews. Each separated by ${delimiter}) in 20 words or less:${delimiter}${combinedReviews}${delimiter}`;

  const openai = getOpenAiInstance();
  const completion = await openai.completions.create({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 100,
  });

  const summary = completion.choices[0].text.trim();
  return res.json(summary);
});

app.get("/generate-json", async (req, res) => {
  const openai = getOpenAiInstance();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content:
          "Give me the question, the topic, the answer and the source of questions I ask you. Provide it in JSON format",
      },
      { role: "user", content: "Who won the world series in 2020?" },
    ],
    model: "gpt-3.5-turbo-1106",
    seed: 50,
    response_format: { type: "json_object" },
  });

  const result = completion.choices[0].message.content;
  res.send(result);
});

app.get("/chat-analysis", async (req, res) => {
  const bookFlight = async (bookingDetails) => {
    return { data: "I booked the flight for you." };
  };

  try {
    const bookingDetails = await functionCalling();

    if (bookingDetails) {
      const result = await bookFlight(bookingDetails);
      res.json(result);
    }
  } catch (error) {
    res.status(500).send("Error generating text");
  }
});

app.post("/audio-fun", upload.single("audio"), async (req, res) => {
  const isTranslate = req.body.translate === "true" ? true : false;

  const openai = getOpenAiInstance();

  try {
    const convertedFilePath = await convertToWav(req.file.path);
    const buffer = await fs.readFile(convertedFilePath);
    if (isTranslate) {
      const translation = await openai.audio.translations.create({
        model: "whisper-1",
        file: await toFile(buffer, convertedFilePath),
      });
      return res.json(translation.text);
    } else {
      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: await toFile(buffer, convertedFilePath),
      });
      return res.json(transcription.text);
    }
  } catch (error) {
    res.status(500).send("Error in processing audio.");
  }
});

app.post("/generate-speech", async (req, res) => {
  const openai = getOpenAiInstance();
  const text = req.body.text;
  const voice = req.body.voice || "echo";
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const speechFile = path.resolve(__dirname, "../../speech.mp3");

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    res.download(speechFile);
  } catch (error) {
    res.status(500).send("Error in generating speech.");
  }
});

app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const userQuestion = req.body.question || "What’s in this image?";
    let dataUrl;
    if (!req.body.imageUrl) {
      const imagePath = req.file.path;
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");
      dataUrl = `data:image/jpeg;base64,${base64Image}`;
    }

    const openai = getOpenAiInstance();
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userQuestion },
            {
              type: "image_url",
              image_url: { url: req.body.imageUrl || dataUrl },
            },
          ],
        },
      ],
    });

    res.json(response.choices[0].message.content);
  } catch (e) {}
});

app.listen(port, () => {});
