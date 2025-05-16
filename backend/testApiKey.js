import "dotenv/config.js";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set. Please ensure it's in your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey }); // Use the apiKey from environment variable

async function main() {
  try {
    console.log("Attempting to generate content with Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Using a common model, adjust if needed
      contents: [{ parts: [{ text: "Explain how AI works in a few words" }] }],
    });
    console.log("API Key Test Successful!");
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error testing API key:", error.message);
    if (error.response && error.response.data) {
      console.error("Error details:", error.response.data);
    }
  }
}

main();