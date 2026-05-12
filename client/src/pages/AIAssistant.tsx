import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, Send, Shield, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Which tool should I use to investigate a suspicious domain?",
  "What API keys are still needed for production?",
  "Help me interpret a Shodan or port scan result.",
  "Create a safe OSINT workflow for a company domain.",
];

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me about OSINT workflows, tool selection, scan results, setup, or API key configuration.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.aiAssistant.chat.useMutation();

  const conversation = useMemo(
    () => messages.filter((message) => message.content.trim().length > 0),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const sendMessage = async (content = input) => {
    const text = content.trim();
    if (!text || chatMutation.isPending) return;

    const nextMessages: ChatMessage[] = [...conversation, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    const response = await chatMutation.mutateAsync({ messages: nextMessages });
    if (response.success) {
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } else {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: response.error || "AI assistant is unavailable. Check the configured LLM API key.",
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-neon-cyan">
              <Bot className="h-8 w-8" />
              AI Assistant
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Workflow guidance, scan interpretation, and setup help for the OSINT platform.
            </p>
          </div>
          <Badge className="w-fit border-neon-green/40 bg-neon-green/10 text-neon-green">
            <Shield className="mr-1 h-3.5 w-3.5" />
            Defensive OSINT Mode
          </Badge>
        </div>

        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <Shield className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-100">
            Use the assistant for authorized investigations, configuration, reporting, and defensive analysis.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <Card className="flex min-h-[640px] flex-col border-neon-cyan/30 bg-black/40">
            <CardHeader className="border-b border-neon-cyan/20">
              <CardTitle className="text-neon-cyan">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neon-cyan/40 bg-neon-cyan/10">
                        <Bot className="h-4 w-4 text-neon-cyan" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap rounded border p-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "border-neon-pink/40 bg-neon-pink/10 text-white"
                          : "border-neon-cyan/30 bg-[#0a0e27] text-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neon-pink/40 bg-neon-pink/10">
                        <User className="h-4 w-4 text-neon-pink" />
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex items-center gap-3 text-sm text-neon-cyan">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-neon-cyan/20 pt-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about tools, scan results, API keys, or a safe OSINT workflow..."
                    className="min-h-20 resize-none border-neon-cyan/30 bg-[#0a0e27] text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={chatMutation.isPending || !input.trim()}
                    className="h-20 bg-neon-cyan text-black hover:bg-neon-cyan/80"
                  >
                    {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="border-neon-pink/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-neon-pink">Quick Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={chatMutation.isPending}
                    className="w-full rounded border border-neon-cyan/20 bg-[#0a0e27] p-3 text-left text-sm text-gray-200 transition hover:border-neon-cyan/60 hover:text-neon-cyan disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-black/40">
              <CardHeader>
                <CardTitle className="text-white">Session</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() =>
                    setMessages([
                      {
                        role: "assistant",
                        content: "Ask me about OSINT workflows, tool selection, scan results, setup, or API key configuration.",
                      },
                    ])
                  }
                  className="w-full border-red-500/40 text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
