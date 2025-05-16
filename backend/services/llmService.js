import "dotenv/config.js";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Service that analyzes code snippets using Google's Gemini API
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language of the code
 * @param {string} title - The title of the code snippet
 * @returns {Object} The analysis result in a format matching the MongoDB schema
 */
const llmService = async (code, language, title) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
  }

  // Setup system instruction for the AI
  const systemInstructionText = `You are an expert software engineer and code reviewer. You will be given a code snippet and you have to analyze it. The code is given in ${language}. You have to provide the following information in a structured JSON response: 1. Summary of the code 2. Bugs in the code (if any) 3. Vulnerabilities in the code (if any) 4. Time complexity of the code 5. Space complexity of the code 6. Suggestions to improve the code.`;
  
  // Create main prompt with code snippet
  const taskSpecificPrompt = `Title: ${title}\n\nAnalyze the following code snippet and provide a detailed analysis.\n\nCode Snippet:\n\`\`\`${language}\n${code}\n\`\`\``;
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Call Gemini API with response schema
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: taskSpecificPrompt }] }],
      config: {
        systemInstruction: systemInstructionText,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A concise summary of what the code does"
            },
            bugs: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Description of a bug or potential issue in the code"
              },
              description: "List of bugs or potential issues found in the code"
            },
            vulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Description of a security vulnerability in the code"
              },
              description: "List of security vulnerabilities found in the code"
            },
            timeComplexity: {
              type: Type.STRING,
              description: "Big O notation time complexity of the algorithm"
            },
            spaceComplexity: {
              type: Type.STRING,
              description: "Big O notation space complexity of the algorithm"
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A specific suggestion to improve the code"
              },
              description: "List of suggestions to improve the code"
            }
          },
          required: ["summary", "bugs", "vulnerabilities", "timeComplexity", "spaceComplexity", "suggestions"]
        }
      },
    });
    
    // With responseSchema, the response should be a structured JSON object
    const analysisResponse = JSON.parse(result.text);
    
    if (!analysisResponse) {
      throw new Error("Failed to get a valid response from LLM.");
    }

    // Return the analysis in the format expected by MongoDB
    return {
      summary: analysisResponse.summary,
      bugs: Array.isArray(analysisResponse.bugs) ? analysisResponse.bugs : [],
      vulnerabilities: Array.isArray(analysisResponse.vulnerabilities) ? analysisResponse.vulnerabilities : [],
      timeComplexity: analysisResponse.timeComplexity || "O(1)",
      spaceComplexity: analysisResponse.spaceComplexity || "O(1)",
      suggestions: Array.isArray(analysisResponse.suggestions) ? analysisResponse.suggestions : ["No suggestions provided"]
    };    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Failed to get analysis from LLM";
      throw new Error(errorMessage);
    }
  };

export default llmService;