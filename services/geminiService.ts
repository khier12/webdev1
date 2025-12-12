import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Fallback if no key provided, though environment should have it
const getAIClient = () => {
  if (!API_KEY) {
    console.warn("No API_KEY found in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const diagnoseIssue = async (userDescription: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI diagnosis is currently unavailable. Please select 'General Diagnosis' or contact us.";

  try {
    const model = 'gemini-2.5-flash';
    const systemPrompt = `
      You are an expert mobile repair technician at "SwiftFix".
      Your goal is to analyze the customer's problem description and suggest the most likely repair service needed from this list:
      - Screen Replacement (cracks, lines, touch issues)
      - Battery Replacement (draining, shutdown, heat)
      - Charging Port Repair (cable loose, no charge)
      - Camera Repair (blurry, cracked lens)
      - Water Damage (liquid contact)
      - General Diagnosis (unknown software/hardware bugs)

      Response requirements:
      1. Be empathetic but professional and concise (max 2 sentences).
      2. Clearly state the likely issue.
      3. Recommend one of the specific services above.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: userDescription }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 150,
      }
    });

    return response.text || "Could not generate a diagnosis. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the diagnostic server. Please select a service manually.";
  }
};