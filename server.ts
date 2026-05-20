import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  app.use(express.json({limit: '50mb'}));
  const PORT = Number(process.env.PORT) || 3000;

  // --- API Routes ---

  // POST /api/feedback to store user feedback locally
  app.post("/api/feedback", async (req, res) => {
    try {
      const { rating, comment, timestamp } = req.body;
      if (!rating) {
        return res.status(400).json({ success: false, error: "Rating is required" });
      }
      
      const feedbackPath = path.join(process.cwd(), "feedback.json");
      let currentFeedback = [];
      
      try {
        const existingData = await fs.readFile(feedbackPath, "utf-8");
        currentFeedback = JSON.parse(existingData);
      } catch (e) {
        // file doesn't exist yet, which is fine
      }
      
      const newFeedback = {
        id: `feedback-${Date.now()}`,
        rating,
        comment: comment || "",
        timestamp: timestamp || new Date().toISOString()
      };
      
      currentFeedback.push(newFeedback);
      await fs.writeFile(feedbackPath, JSON.stringify(currentFeedback, null, 2), "utf-8");
      
      console.log("Feedback received successfully:", newFeedback);
      res.json({ success: true, feedback: newFeedback });
    } catch (error: any) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ success: false, error: "Failed to save feedback" });
    }
  });

  // Generate a daily vocabulary list tailored for kids
  app.get("/api/vocab", async (req, res) => {
    const categories = ['animals', 'colors', 'numbers', 'fruits', 'family members', 'body parts', 'nature', 'action verbs', 'everyday objects', 'food', 'weather', 'clothes', 'emotions'];
    const queryCategory = req.query.category as string;
    
    try {
      const category = (queryCategory && categories.includes(queryCategory.toLowerCase()))
        ? queryCategory.toLowerCase()
        : categories[Math.floor(Math.random() * categories.length)];
      const prompt = `Generate a list of 15 simple Telugu vocabulary words for a young child beginner, focusing on the category: ${category}. Return ONLY a JSON array of objects. Each object must have: 'nativeText' (the word in the Telugu script), 'pronunciation' (romanized pronunciation), 'english' (the english translation), 'emoji' (a relevant emoji), and 'category' (set to exactly "${category}"). Example: [{"nativeText":"కుక్క","pronunciation":"kukka","english":"dog","emoji":"🐶","category":"${category}"}]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      let text = response.text || "[]";
      // Clean up markdown formatting if present
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let vocab = JSON.parse(text);
      if (Array.isArray(vocab)) {
        vocab = vocab.map(item => ({ ...item, category }));
      }
      res.json({ vocab });
    } catch (error: any) {
      if (error?.status === 429) {
        console.log("Gemini API quota exceeded for vocab. Using fallback data.");
      } else {
        console.error("Error generating vocab:", error);
      }
      
      const ALL_FALLBACK_VOCAB = [
        { nativeText: "పిల్లి", pronunciation: "pilli", english: "cat", emoji: "🐱", category: "animals" },
        { nativeText: "కుక్క", pronunciation: "kukka", english: "dog", emoji: "🐶", category: "animals" },
        { nativeText: "నీరు", pronunciation: "neeru", english: "water", emoji: "💧", category: "nature" },
        { nativeText: "నిప్పు", pronunciation: "nippu", english: "fire", emoji: "🔥", category: "nature" },
        { nativeText: "ఆకాశం", pronunciation: "aakasam", english: "sky", emoji: "☁️", category: "nature" },
        { nativeText: "చెట్టు", pronunciation: "chettu", english: "tree", emoji: "🌳", category: "nature" },
        { nativeText: "సూర్యుడు", pronunciation: "sooryudu", english: "sun", emoji: "☀️", category: "nature" },
        { nativeText: "పాలు", pronunciation: "paalu", english: "milk", emoji: "🥛", category: "food" },
        { nativeText: "పువ్వు", pronunciation: "puvvu", english: "flower", emoji: "🌺", category: "nature" },
        { nativeText: "అమ్మ", pronunciation: "amma", english: "mother", emoji: "👩‍👧", category: "family members" },
        { nativeText: "ఆవు", pronunciation: "aavu", english: "cow", emoji: "🐮", category: "animals" },
        { nativeText: "ఏనుగు", pronunciation: "enugu", english: "elephant", emoji: "🐘", category: "animals" },
        { nativeText: "పక్షి", pronunciation: "pakshi", english: "bird", emoji: "🐦", category: "animals" },
        { nativeText: "చేప", pronunciation: "chepa", english: "fish", emoji: "🐟", category: "animals" },
        { nativeText: "కన్ను", pronunciation: "kannu", english: "eye", emoji: "👁️", category: "body parts" },
        { nativeText: "చేయి", pronunciation: "cheyi", english: "hand", emoji: "🖐️", category: "body parts" },
        { nativeText: "ఎరుపు", pronunciation: "erupu", english: "red", emoji: "🔴", category: "colors" },
        { nativeText: "ఆకుపచ్చ", pronunciation: "akupaccha", english: "green", emoji: "🟢", category: "colors" },
        { nativeText: "పండు", pronunciation: "pandu", english: "fruit", emoji: "🍎", category: "food" },
        { nativeText: "అన్నం", pronunciation: "annam", english: "rice", emoji: "🍚", category: "food" }
      ];
      
      let filtered = ALL_FALLBACK_VOCAB;
      if (queryCategory) {
        filtered = ALL_FALLBACK_VOCAB.filter(item => item.category === queryCategory.toLowerCase());
      }
      
      if (filtered.length === 0) {
        filtered = ALL_FALLBACK_VOCAB;
      }
      
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      res.json({
        vocab: shuffled.slice(0, 10)
      });
    }
  });

  app.get("/api/stories", async (req, res) => {
    try {
      const prompt = `Generate 4 very short, simple Telugu stories for a young child (beginner level). Return ONLY a JSON array of objects. Each object must have: 'id' (a unique string like 'story-1'), 'title' (in Telugu script), 'titlePronunciation' (romanized), 'titleEnglish', 'emoji', and 'sentences'. 'sentences' should be an array of objects for each sentence (max 3-4 short sentences per story), with 'nativeText' (Telugu script), 'pronunciation' (romanized), and 'english'. Make sure the language is very accessible.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      let text = response.text || "[]";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const stories = JSON.parse(text);
      res.json({ stories });
    } catch (error: any) {
      if (error?.status === 429) {
        console.log("Gemini API quota exceeded for stories. Using fallback data.");
      } else {
        console.error("Error generating stories:", error);
      }
      res.json({
        stories: [
          {
            id: '1',
            title: 'చిన్న పిల్లి',
            titlePronunciation: 'Chinna Pilli',
            titleEnglish: 'Little Cat',
            emoji: '🐱',
            sentences: [
              { nativeText: 'చిన్న పిల్లికి చేపలు ఇష్టం.', pronunciation: 'Chinna pilliki chepalu ishtam.', english: 'The little cat likes fish.' },
              { nativeText: 'అది పాలు తాగుతుంది.', pronunciation: 'Adi paalu taagutundi.', english: 'It drinks milk.' },
              { nativeText: 'చిన్న పిల్లి నిద్రపోతోంది.', pronunciation: 'Chinna pilli nidrapotondi.', english: 'The little cat is sleeping.' }
            ]
          },
          {
            id: '2',
            title: 'ఆకాశంలో చంద్రుడు',
            titlePronunciation: 'Aakasamlo Chandrudu',
            titleEnglish: 'The Moon in the Sky',
            emoji: '🌙',
            sentences: [
              { nativeText: 'చీకటి పడింది.', pronunciation: 'Cheekati padindi.', english: 'It got dark.' },
              { nativeText: 'చంద్రుడు వచ్చాడు.', pronunciation: 'Chandrudu vachaadu.', english: 'The moon came out.' },
              { nativeText: 'చంద్రుడు వెలుగుతున్నాడు.', pronunciation: 'Chandrudu veluguthunnaadu.', english: 'The moon is shining.' }
            ]
          },
          {
            id: '3',
            title: 'పచ్చని చెట్టు',
            titlePronunciation: 'Pachani Chettu',
            titleEnglish: 'The Green Tree',
            emoji: '🌳',
            sentences: [
              { nativeText: 'ఇది ఒక పెద్ద చెట్టు.', pronunciation: 'Idi oka pedda chettu.', english: 'This is a big tree.' },
              { nativeText: 'చెట్టు మీద పక్షులు ఉన్నాయి.', pronunciation: 'Chettu meeda pakshulu unnayi.', english: 'There are birds on the tree.' },
              { nativeText: 'పక్షులు పాడుతున్నాయి.', pronunciation: 'Pakshulu paaduthunnayi.', english: 'The birds are singing.' }
            ]
          },
          {
            id: '4',
            title: 'ఎర్రటి ఆపిల్',
            titlePronunciation: 'Errati Apple',
            titleEnglish: 'Red Apple',
            emoji: '🍎',
            sentences: [
              { nativeText: 'ఇది ఒక ఆపిల్ పండు.', pronunciation: 'Idi oka apple pandu.', english: 'This is an apple.' },
              { nativeText: 'ఆపిల్ ఎర్రగా ఉంది.', pronunciation: 'Apple erraga undi.', english: 'The apple is red.' },
              { nativeText: 'నేను ఆపిల్ తింటాను.', pronunciation: 'Nenu apple tintaanu.', english: 'I eat the apple.' }
            ]
          }
        ]
      });
    }
  });

  app.post("/api/evaluate-speech", async (req, res) => {
    try {
      const { expectedHanzi, audioBase64, mimeType } = req.body;
      
      if (!audioBase64) {
        return res.status(400).json({ success: false, error: "No audio data provided" });
      }

      const prompt = `You are a helpful language teacher. The expected word the user is trying to pronounce is "${expectedHanzi}". 
Listen to the audio. Check if the speaker successfully pronounced this word or something very close to it.
Return ONLY a JSON object with two fields: 
- "isMatch": boolean (true if they said the word correctly, false otherwise)
- "recognizedText": string (the text of what you heard them say)`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType || 'audio/webm'
            }
          }
        ],
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(text);
      
      res.json({ 
        success: true, 
        isMatch: !!result.isMatch, 
        recognizedText: result.recognizedText || '...' 
      });
    } catch (error: any) {
      if (error?.status === 429) {
        console.log("Gemini API quota exceeded for speech evaluation.");
        res.status(429).json({ success: false, error: "AI quota exceeded, please try again later." });
      } else {
        console.error("Error evaluating speech:", error);
        res.status(500).json({ success: false, error: "Failed to evaluate speech" });
      }
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
