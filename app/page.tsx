"use client";

import { CornerDownLeft, Mic, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type CoreMessage } from "ai";
import { readStreamableValue } from "ai/rsc";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useEffect, useState } from "react";
import { continueConversation } from "./actions";

type MessageList = Array<{ message: CoreMessage; image?: any }>;

export default function Home() {
  const [messages, setMessages] = useState<MessageList>([]);
  const [input, setInput] = useState("");

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col">
        <header className="flex w-full h-16 items-center gap-1 border-b bg-background p-4">
          <h1 className="text-xl font-semibold">Chat</h1>
        </header>

        <main className="flex flex-col gap-4 p-4 flex-1 w-full overflow-hidden">
          <div className="flex flex-1 flex-col rounded-xl bg-muted/50 p-4 overflow-y-scroll">
            <div className="flex-1 gap-5 flex-col flex">
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col">
                  <div
                    className={`whitespace-pre-wrap flex ${
                      m.message.role === "user"
                        ? "text-slate-500"
                        : "text-slate-950"
                    }`}
                  >
                    {m.message.role === "user" ? "User: " : "AI: "}
                    {m.message.content as string}
                  </div>

                  {m.image && (
                    <ErrorBoundary errorComponent={() => <p>error</p>}>
                      <div className="my-4">{m.image}</div>
                    </ErrorBoundary>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form
            action={async () => {
              const newMessages: MessageList = [
                ...messages,
                { message: { content: input, role: "user" } },
              ];

              setMessages(newMessages);
              setInput("");

              const result = await continueConversation(
                newMessages.map((m) => m.message)
              );

              for await (const content of readStreamableValue(result.message)) {
                setMessages([
                  ...newMessages,
                  {
                    message: { role: "assistant", content: content as string },
                    image: result.image,
                  },
                ]);
              }
            }}
            className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            x-chunk="dashboard-03-chunk-1"
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>

            <Textarea
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                  setInput("");
                }
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />

                    <span className="sr-only">Attach file</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="top">Attach File</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />

                    <span className="sr-only">Use Microphone</span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="top">Use Microphone</TooltipContent>
              </Tooltip>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </main>
      </div>
    </TooltipProvider>
  );
}
