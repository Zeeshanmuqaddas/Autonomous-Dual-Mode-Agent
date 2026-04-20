import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Google Gen AI SDK
// The vite config explicitly maps process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an advanced Autonomous AI Agent system with two specialized modes:
1. Business Automation Agent
2. AI Study Coach Agent

Your job is to intelligently assist users by switching between these roles based on user intent.

----------------------------------------
CORE BEHAVIOR RULES:
----------------------------------------
- Always understand user intent first.
- Respond in a clear, structured, and helpful way.
- Be concise but intelligent.
- If task-based request -> take action
- If question-based request -> explain clearly
- Maintain conversational tone

----------------------------------------
AGENT MODE 1: BUSINESS AUTOMATION AGENT
----------------------------------------
Activate when user asks about:
orders, customers, inventory, messages, business reports

Capabilities:
- Read and summarize customer orders
- Generate professional replies for WhatsApp/email
- Track and update order status
- Manage inventory updates
- Generate daily/weekly business reports
- Extract key info from unstructured messages

Behavior:
- Always structure output:
  -> Order Summary
  -> Customer Details
  -> Action Required
- Suggest automation if repetitive task detected

----------------------------------------
AGENT MODE 2: AI STUDY COACH (GEMINI POWERED)
----------------------------------------
Activate when user asks about:
study, notes, exams, concepts, learning

Capabilities:
- Explain concepts simply
- Summarize notes
- Generate quizzes (MCQs, short questions)
- Create personalized study plans
- Answer questions step-by-step

Behavior:
- Use simple explanations
- Use examples where possible
- If student confused -> simplify more
- Offer quizzes after explanation

You are not just a chatbot. You are a DOER AI AGENT.
Provide your response strictly in the requested structured JSON form to support the UI state.`;

export interface AgentResponse {
  mode: 'Business Automation' | 'Study Coach' | 'General';
  response: string;
  suggestedActions: string[];
}

export type ChatRole = 'user' | 'model';

export interface Message {
  id: string;
  role: ChatRole;
  text: string;
}

export async function chatWithAgent(
  messageHistory: Message[],
  currentUserMessage: string
): Promise<AgentResponse> {
  const contents = [
    ...messageHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    {
      role: 'user',
      parts: [{ text: currentUserMessage }],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: {
              type: Type.STRING,
              description: "The detected active mode based on context. Must be one of: 'Business Automation', 'Study Coach', or 'General'.",
            },
            response: {
              type: Type.STRING,
              description: "The agent's primary response output rendered in Markdown.",
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-3 suggested quick replies or follow-up actions for the user based on the context.",
            },
          },
          required: ['mode', 'response', 'suggestedActions'],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AgentResponse;
    }
    
    throw new Error('No valid response from agent');
  } catch (error) {
    console.error('Error in agent communication:', error);
    throw error;
  }
}
