import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { supabase } from "../../DB/supabaseclient";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const suggestions = [
  "How can I save more each month?",
  "How do I analyze my spending?",
  "What are some beginner investing tips?",
];

export const AskAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const requestInProgress = useRef(false);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading, error]);

  // Close assistant
  const closeAssistant = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  // Extract actual error returned by Supabase
  const getFunctionError = async (invokeError) => {
    if (invokeError?.context) {
      try {
        const context = invokeError.context;

        if (context instanceof Response) {
          const responseText = await context.clone().text();

          try {
            const responseData = JSON.parse(responseText);

            return (
              responseData.error ||
              responseData.message ||
              `Request failed with status ${context.status}.`
            );
          } catch {
            return (
              responseText || `Request failed with status ${context.status}.`
            );
          }
        }

        if (typeof context === "object") {
          return context.error || context.message || invokeError.message;
        }
      } catch (error) {
        console.error("Could not extract function error:", error);
      }
    }

    return (
      invokeError?.message ||
      "Unable to connect to the AI assistant. Please try again."
    );
  };

  // Send question to AI
  const askQuestion = async (event) => {
    event.preventDefault();

    const text = question.trim();

    if (!text || requestInProgress.current) return;

    if (text.length > 2000) {
      setError("Your question cannot exceed 2000 characters.");
      return;
    }

    requestInProgress.current = true;

    const userMessage = {
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage].slice(-12);

    setMessages((current) => [...current, userMessage].slice(-12));
    setQuestion("");
    setError("");
    setIsLoading(true);

    try {
      // 1. Check Supabase authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      // 2. Call Supabase Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke(
        "ask-ai",
        {
          body: {
            messages: nextMessages,
          },
        },
      );

      // 3. Handle Edge Function errors
      if (invokeError) {
        console.error("Supabase Edge Function error:", invokeError);

        const errorMessage = await getFunctionError(invokeError);

        throw new Error(errorMessage);
      }

      // 4. Validate AI response
      if (data?.error) {
        throw new Error(data.error);
      }

      if (typeof data?.answer !== "string" || !data.answer.trim()) {
        throw new Error(
          "The assistant returned an empty response. Please try again.",
        );
      }

      // 5. Add AI response
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer.trim(),
        },
      ]);
    } catch (requestError) {
      console.error("Ask AI error:", requestError);

      setError(
        requestError.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
      requestInProgress.current = false;
    }
  };

  // Select suggestion
  const selectSuggestion = (suggestion) => {
    setQuestion(suggestion);
    setError("");
  };

  // Render Markdown safely
  const renderMarkdown = (content) => (
    <div
      className="text-sm leading-relaxed break-words
                    [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-lg
                    [&_h1]:font-bold
                    [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base
                    [&_h2]:font-semibold
                    [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-semibold
                    [&_p]:mb-2 [&_p:last-child]:mb-0
                    [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_li]:mb-1
                    [&_strong]:font-semibold
                    [&_blockquote]:my-2 [&_blockquote]:border-l-2
                    [&_blockquote]:border-violet-400
                    [&_blockquote]:pl-3
                    [&_hr]:my-3 [&_hr]:border-neutral-300
                    dark:[&_hr]:border-neutral-700
                    [&_code]:rounded [&_code]:bg-neutral-200
                    [&_code]:px-1 [&_code]:py-0.5
                    dark:[&_code]:bg-neutral-700
                    [&_a]:text-violet-600 [&_a]:underline
                    dark:[&_a]:text-violet-400"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),

          table: ({ node, ...props }) => (
            <div className="my-3 max-w-full overflow-x-auto">
              <table {...props} className="w-full border-collapse text-xs" />
            </div>
          ),

          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-neutral-300 bg-neutral-200
                         px-3 py-2 text-left font-semibold
                         dark:border-neutral-600 dark:bg-neutral-700"
            />
          ),

          td: ({ node, ...props }) => (
            <td
              {...props}
              className="border border-neutral-300 px-3 py-2
                         dark:border-neutral-600"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <>
      {/* Ask AI Button */}
      <div className="ask-ai-glow shrink-0">
        <Button
          variant="primary"
          size="sm"
          className="relative z-10 rounded-full
                     bg-gradient-to-r from-violet-600 to-fuchsia-600
                     px-3 py-2 text-white shadow-lg
                     shadow-violet-500/20
                     hover:from-violet-700 hover:to-fuchsia-700
                     focus:ring-violet-500
                     dark:from-violet-500 dark:to-fuchsia-500"
          leftIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
        >
          Ask AI
        </Button>
      </div>

      {/* AI Assistant Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeAssistant}
        title="Ask AI"
        description="Ask about saving, spending, budgeting, or general investing."
        size="lg"
        className="overflow-hidden"
      >
        <div className="flex h-[min(60vh,32rem)] min-h-64 flex-col">
          {/* Messages */}
          <div
            className="flex-1 space-y-4 overflow-y-auto pb-4"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {/* Empty State */}
            {messages.length === 0 ? (
              <div
                className="flex h-full flex-col items-center
                              justify-center text-center"
              >
                <div
                  className="mb-3 rounded-2xl bg-violet-100
                                p-3 text-violet-700
                                dark:bg-violet-900/40
                                dark:text-violet-300"
                >
                  <Bot className="h-7 w-7" aria-hidden="true" />
                </div>

                <p
                  className="font-medium text-neutral-900
                              dark:text-neutral-100"
                >
                  What would you like help with?
                </p>

                <p
                  className="mt-1 max-w-sm text-sm text-neutral-500
                              dark:text-neutral-400"
                >
                  Get practical guidance on smart saving, spending habits, and
                  investment basics.
                </p>

                {/* Suggestions */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="rounded-full border border-neutral-200
                                 px-3 py-2 text-left text-xs
                                 text-neutral-600 transition-colors
                                 hover:border-violet-300
                                 hover:bg-violet-50
                                 dark:border-neutral-700
                                 dark:text-neutral-300
                                 dark:hover:border-violet-700
                                 dark:hover:bg-violet-950/40"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation */
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] min-w-0 rounded-2xl
                                px-4 py-3 ${
                                  message.role === "user"
                                    ? "rounded-br-md bg-violet-600 text-white dark:bg-violet-500"
                                    : "rounded-bl-md bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                                }`}
                  >
                    {message.role === "assistant" ? (
                      renderMarkdown(message.content)
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                className="flex items-center gap-2 text-sm
                           text-neutral-500 dark:text-neutral-400"
                role="status"
              >
                <Sparkles className="h-4 w-4 animate-pulse text-violet-500" />
                Thinking...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl border border-red-200
                           bg-red-50 px-3 py-2 text-sm
                           text-red-600 dark:border-red-900
                           dark:bg-red-950/30 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={askQuestion}
            className="flex items-end gap-2 border-t
                       border-neutral-200 pt-4
                       dark:border-neutral-800"
          >
            <label className="sr-only" htmlFor="ask-ai-question">
              Your question
            </label>

            <textarea
              id="ask-ai-question"
              rows={2}
              maxLength={2000}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a money question..."
              className="input max-h-32 min-h-11 resize-y"
              disabled={isLoading}
            />

            <Button
              type="submit"
              size="sm"
              className="mb-0.5 h-10 w-10 shrink-0 rounded-xl p-0"
              aria-label="Send question"
              disabled={!question.trim() || isLoading}
              loading={isLoading}
            >
              {!isLoading && <Send className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-2 text-xs text-neutral-400">
            General education only, not personalized financial advice.
          </p>
        </div>
      </Modal>
    </>
  );
};
