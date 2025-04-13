"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, FileText, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ClientIntake() {
  const [isOffline, setIsOffline] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat/intake",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello, I'm the Tennessee Justice Bus assistant. I'm here to help gather information about your legal situation so we can prepare for your consultation. Could you tell me what type of legal issue you're experiencing?",
      },
    ],
  });

  // Handle offline detection
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to render message content with special formatting
  const renderMessageContent = (content: string) => {
    // Check if content contains a document list
    if (content.includes("documents to your Justice Bus appointment")) {
      const parts = content.split(/(\n\n.*?documents.*?:\n\n)/);
      
      return (
        <>
          {parts.map((part, index) => {
            if (part.includes("documents") && part.includes(":")) {
              // This part contains the document list intro
              return <p key={index} className="mb-2">{part}</p>;
            } else if (part.match(/^\s*-\s+/m)) {
              // This part contains bullet points
              const listItems = part.split(/\n-\s+/).filter(Boolean);
              return (
                <div key={index} className="mb-4">
                  <ul className="list-disc pl-4 space-y-1">
                    {listItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else {
              // Regular paragraph
              return (
                <p key={index} className="mb-4">
                  {part}
                </p>
              );
            }
          })}
        </>
      );
    }

    // Default rendering - preserve newlines as paragraphs
    return content.split("\n\n").map((paragraph, i) => (
      <p key={i} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="flex flex-col space-y-4">
      {isOffline && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            You can continue the intake process, but your responses will be
            synchronized when you reconnect to the internet.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex flex-col relative overflow-hidden border rounded-lg h-[600px]">
        <ScrollArea className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col space-y-2 max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground self-end"
                    : "bg-muted self-start"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {message.role === "user" ? "You" : "Assistant"}
                  </Badge>
                </div>
                <div className="text-sm">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted self-start max-w-[80%] rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce delay-300"></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={2}
              maxLength={1000}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
