"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  User,
  Bot,
  XCircle,
  Info,
  MessageSquare,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { AnimatePresence, motion } from "framer-motion";

export function DashboardChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Use Vercel AI SDK's useChat hook with streaming enabled
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error: chatError,
    stop,
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

  // Check scroll position to show/hide scroll button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomThreshold = 100;
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight < bottomThreshold;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Log messages for debugging
  useEffect(() => {
    console.log("Current chat messages:", messages);
  }, [messages]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-medium text-gray-900 dark:text-gray-100">
            Justice Bus Assistant
          </h2>
        </div>
        {status === "streaming" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => stop()}
            className="h-8 px-2 text-xs"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
      </div>

      {/* Status notifications */}
      <AnimatePresence>
        {(error || chatError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 text-sm flex items-center gap-2"
          >
            <Info className="h-4 w-4 shrink-0" />
            <span>
              {error || chatError?.message || "An error occurred with the chat"}
            </span>
          </motion.div>
        )}

        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-2 text-sm flex items-center gap-2"
          >
            <Info className="h-4 w-4 shrink-0" />
            <span>You&apos;re offline. Chat functionality is limited.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } group`}
              >
                <div className="flex items-start max-w-[85%] gap-2">
                  {message.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.parts && message.parts.length > 0
                        ? message.parts
                            .map((part, index) =>
                              part.type === "text" ? part.text : ""
                            )
                            .join("")
                        : message.content}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
            onClick={scrollToBottom}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Typing indicator when streaming */}
      {status === "streaming" && (
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Assistant is typing...
        </div>
      )}

      {/* Chat input form */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 md:p-3 sticky bottom-0">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-center max-w-3xl mx-auto relative"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={
              status === "streaming" || status === "submitted" || !isOnline
            }
            className="flex-1 py-6 px-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={
              status === "streaming" ||
              status === "submitted" ||
              !input.trim() ||
              !isOnline
            }
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
          >
            {status === "streaming" || status === "submitted" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
