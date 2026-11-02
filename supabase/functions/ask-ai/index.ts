import { createClient } from "npm:@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response> | Response): void;
};

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://spent-analyzer-two.vercel.app",
  "https://spendanalyzer.com",
];

const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

// --------------------------------------------------
// JSON RESPONSE HELPER
// --------------------------------------------------

const jsonResponse = (
  body: Record<string, string>,
  status = 200,
  origin: string | null = null,
) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
};

// --------------------------------------------------
// MESSAGE VALIDATION
// --------------------------------------------------

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const isChatMessage = (message: unknown): message is ChatMessage => {
  if (
    !message ||
    typeof message !== "object" ||
    !("role" in message) ||
    !("content" in message)
  ) {
    return false;
  }

  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= 2000
  );
};

const isValidMessages = (value: unknown): value is ChatMessage[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= 12 &&
  value.every(isChatMessage) &&
  value[value.length - 1].role === "user";

// --------------------------------------------------
// MAIN EDGE FUNCTION
// --------------------------------------------------

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");

  // Handle browser preflight before authentication.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Reject requests from unapproved browser origins.
  if (origin && !allowedOrigins.includes(origin)) {
    return jsonResponse({ error: "Origin not allowed." }, 403, origin);
  }

  // Only POST requests are supported.
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }

  try {
    // --------------------------------------------------
    // 1. AUTHENTICATION
    // --------------------------------------------------

    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        { error: "Authentication is required." },
        401,
        origin,
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return jsonResponse(
        { error: "Invalid authentication token." },
        401,
        origin,
      );
    }

    // --------------------------------------------------
    // 2. ENVIRONMENT VARIABLES
    // --------------------------------------------------

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    const openRouterModel =
      Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration.");

      return jsonResponse(
        { error: "The assistant is not configured." },
        500,
        origin,
      );
    }

    if (!openRouterApiKey) {
      console.error("Missing OPENROUTER_API_KEY.");

      return jsonResponse(
        { error: "The assistant is not configured yet." },
        503,
        origin,
      );
    }

    // --------------------------------------------------
    // 3. VERIFY SUPABASE USER
    // --------------------------------------------------

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: userData, error: authError } =
      await userClient.auth.getUser(accessToken);

    if (authError || !userData.user) {
      console.error("Authentication failed:", authError?.message);

      return jsonResponse(
        { error: "Your session is invalid. Please log in again." },
        401,
        origin,
      );
    }

    // --------------------------------------------------
    // 4. PARSE REQUEST BODY
    // --------------------------------------------------

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { error: "The request body must be valid JSON." },
        400,
        origin,
      );
    }

    const messages =
      body && typeof body === "object" && "messages" in body
        ? body.messages
        : undefined;

    if (!isValidMessages(messages)) {
      return jsonResponse(
        { error: "Please provide a valid conversation." },
        400,
        origin,
      );
    }

    // --------------------------------------------------
    // 5. OPENROUTER API REQUEST
    // --------------------------------------------------

    
const systemPrompt = `
You are Spend Analyzer AI, an intelligent and friendly personal
finance assistant integrated into a personal expense tracking app.

YOUR PERSONALITY:
- Friendly, intelligent, professional, and conversational.
- Explain things in simple language.
- Be practical rather than overly theoretical.
- Avoid sounding robotic or like a textbook.
- Give advice that users can realistically implement.

RESPONSE STYLE:
1. Answer the user's actual question directly.
2. Keep normal responses concise, ideally 100-200 words.
3. Use headings only when they improve readability.
4. Use bullet points for practical suggestions.
5. Avoid unnecessary tables. Use a table only when comparing
   multiple items where it genuinely improves clarity.
6. Use bold text to highlight important points.
7. Avoid repeating the same advice.
8. Do not generate unnecessary introductions or conclusions.
9. Never leave a sentence, list, or table unfinished.
10. For complex questions, provide a structured and detailed answer.

FINANCIAL CONTEXT:
- Use Indian Rupees (₹) as the default currency.
- Use Indian financial examples when appropriate.
- Understand Indian terms such as UPI, SIP, FD, RD, EMI,
  savings accounts, and mutual funds.
- If the user specifies another currency or country,
  adapt accordingly.

SPEND ANALYSIS:
- Help users understand their spending habits.
- Suggest realistic budgeting strategies.
- Explain how to reduce unnecessary expenses.
- Help users set savings goals.
- Explain income, expenses, and cash flow.
- Help users understand financial patterns.

PERSONALIZATION:
- Use financial information only when the user provides it
  in the conversation.
- Never invent income, expenses, transactions, or balances.
- If relevant financial information is missing, ask a
  specific follow-up question.
- Do not pretend to have access to the user's Spend Analyzer
  database or transaction history.

FINANCIAL SAFETY:
- Provide general financial education, not personalized
  professional investment advice.
- Never guarantee investment returns.
- Explain relevant risks.
- Never request passwords, OTPs, or banking credentials.

CONVERSATION:
- Remember the context of the current conversation.
- Avoid asking questions the user has already answered.
- If the user asks a simple question, give a simple answer.
- If the user requests a detailed explanation, provide one.
- If a question is unrelated to personal finance, politely
  explain your primary purpose.

Your goal is to make managing money easier, smarter,
and less stressful for every Spend Analyzer user.
`;


    let openRouterResponse: Response;

    try {
      openRouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://spendanalyzer.com",
            "X-Title": "Spend Analyzer",
          },
          body: JSON.stringify({
            model: openRouterModel,
            max_tokens: 1000,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...messages,
            ],
          }),
        },
      );
    } catch (error) {
      console.error("OpenRouter connection error:", error);

      return jsonResponse(
        { error: "Could not reach the AI assistant. Please try again." },
        502,
        origin,
      );
    }

    // --------------------------------------------------
    // 6. HANDLE OPENROUTER ERRORS
    // --------------------------------------------------

    if (!openRouterResponse.ok) {
      const errorDetails = await openRouterResponse.text();

      console.error(
        "OpenRouter error:",
        openRouterResponse.status,
        errorDetails,
      );

      return jsonResponse(
        { error: "The AI assistant could not respond. Please try again." },
        502,
        origin,
      );
    }

    // --------------------------------------------------
    // 7. EXTRACT AI RESPONSE
    // --------------------------------------------------

    let responseBody: {
      choices?: Array<{
        message?: {
          content?: unknown;
        };
      }>;
    };

    try {
      responseBody = await openRouterResponse.json();
    } catch {
      console.error("Invalid OpenRouter response.");

      return jsonResponse(
        { error: "The AI assistant returned an invalid response." },
        502,
        origin,
      );
    }

    const answer = responseBody.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      console.error("OpenRouter returned an empty answer.");

      return jsonResponse(
        { error: "The AI assistant returned an empty response." },
        502,
        origin,
      );
    }

    // --------------------------------------------------
    // 8. SUCCESS RESPONSE
    // --------------------------------------------------

    return jsonResponse({ answer: answer.trim() }, 200, origin);
  } catch (error) {
    console.error("Unexpected Ask-AI function error:", error);

    return jsonResponse(
      { error: "Something went wrong. Please try again later." },
      500,
      request.headers.get("Origin"),
    );
  }
});
