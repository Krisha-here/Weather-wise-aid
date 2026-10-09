import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { useDateContext } from "@/context/DateContext";
import { fetchChatbotContext, type ChatbotContext } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

const suggestions = [
  "What is today's flood risk?",
  "Is there a cyclone threat?",
  "What's the rainfall forecast?",
  "Should residents evacuate?",
  "Give me safety advice",
];

export default function ChatbotPage() {
  const { selectedDate } = useDateContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", content: "Hello! I'm your **AI Disaster Assistant**. Ask me about current weather conditions, flood risk, cyclone predictions, or safety advice. I am connected to the Gemini Agent model.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [ctx, setCtx] = useState<ChatbotContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatbotContext(selectedDate).then(setCtx).catch(console.error);
  }, [selectedDate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;
    
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userId = Date.now();
    const botId = Date.now() + 1;

    // Combine into a single state update to avoid batching issues
    setMessages(prev => [...prev,
      { id: userId, role: 'user', content: msg, timestamp: ts },
      { id: botId, role: 'bot', content: '', timestamp: ts }
    ]);
    
    setInput('');
    setIsLoading(true);

    try {
      const telegram_chat_id = localStorage.getItem("coastal_telegram_chat_id");
      const res = await fetch('http://localhost:8000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          date: selectedDate.toISOString().slice(0, 10),
          telegram_chat_id
        })
      });

      if (!res.body) throw new Error("Connection failed.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            
            const payload = trimmed.slice(6);
            if (payload === '[DONE]') {
              setIsLoading(false);
              return;
            }
            
            try {
              const parsed = JSON.parse(payload);
              if (parsed.token) {
                setMessages(prev => prev.map(m =>
                   m.id === botId ? { ...m, content: m.content + parsed.token } : m
                ));
              }
            } catch (err) {
              console.error("Token parsing error:", err);
            }
          }
        }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now() + 5, 
        role: 'bot', 
        content: "Sorry, I am having trouble connecting to the backend. Please ensure the FastAPI server is running.", 
        timestamp: ts 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">AI Disaster Assistant</h1>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" /> Chat
            {ctx && (
              <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                Context: Risk {ctx.current_risk_level} • Score {ctx.risk_score}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="rounded-full bg-primary/10 p-1.5 h-7 w-7 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.role === "bot" ? (
                  <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_strong]:text-inherit">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.timestamp}</p>
              </div>
              {msg.role === "user" && (
                <div className="rounded-full bg-accent p-1.5 h-7 w-7 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-3.5 w-3.5 text-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>

        <div className="border-t border-border p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, flood, cyclone risk..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
