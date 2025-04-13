"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function DashboardChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();
  const [error, setError] = useState<string | null>(null);

  // Use Vercel AI SDK's useChat hook with streaming enabled
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error: chatError,
  } = useChat({
    api: "/api/chat/intake",
    initialMessages: [
      {
        id: "welcome-msg",
        role: "assistant",
        content: "Hello! How can I help you with your Justice Bus case today?",
      },
    ],
    onResponse: (response) => {
      // Log the raw response for debugging
      console.log("Chat response received:", response);
      if (!response.ok) {
        setError(`Error: ${response.statusText}`);
      } else {
        setError(null);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setError(error.message);
    },
    // Explicitly enable streaming
    body: {
      headers: {
        Accept: "text/event-stream",
      },
    },
  });

  // Log messages for debugging
  useEffect(() => {
    console.log("Current chat messages:", messages);
  }, [messages]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
      {/* Error notification */}
      {(error || chatError) && (
        <div className="bg-red-50 text-red-800 p-2 text-sm border-b">
          {error || chatError?.message || "An error occurred with the chat"}
        </div>
      )}

      {/* Offline notification */}
      {!isOnline && (
        <div className="bg-amber-50 text-amber-800 p-2 text-sm border-b">
          You&apos;re offline. Chat functionality is limited.
        </div>
      )}

      {/* Mobile Heading - only visible on small screens */}
      <div className="md:hidden px-4 py-2 border-b">
        <h2 className="font-medium">Justice Bus Chat Assistant</h2>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm md:text-base">
                    {message.parts && message.parts.length > 0
                      ? message.parts
                          .map((part, index) =>
                            part.type === "text" ? part.text : ""
                          )
                          .join("")
                      : message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input form */}
      <form onSubmit={handleSubmit} className="border-t p-2 md:p-4 flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={
            status === "streaming" || status === "submitted" || !isOnline
          }
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={
            status === "streaming" ||
            status === "submitted" ||
            !input.trim() ||
            !isOnline
          }
        >
          {status === "streaming" || status === "submitted" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
