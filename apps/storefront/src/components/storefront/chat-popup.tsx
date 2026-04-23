"use client";

import { Button, CloseButton } from "@blinds/ui";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, Check, Checks, Headphones, ChatsCircle } from "@phosphor-icons/react";

interface Message {
  id: string;
  from: "user" | "agent";
  text: string;
  time: string;
  read?: boolean;
}

const AGENT_NAME = "Buying Assistant";
const AGENT_ROLE = "Product guidance";

function getTimeStr() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const QUICK_REPLIES = [
  "Compare materials",
  "Track my order",
  "Measuring help",
];

const AUTO_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["price", "quote", "cost", "how much", "pricing", "cheap", "afford", "expensive"],
    response:
      "Share the room, width, height, and product family you are considering, and I can help narrow the best path before you configure.",
  },
  {
    keywords: ["track", "order", "status", "where", "shipping", "delivered", "delivery status"],
    response:
      "For an existing order, use the Track Order page in the header. If you are asking before purchase, I can help you compare the fastest product paths.",
  },
  {
    keywords: ["measure", "measuring", "size", "dimension", "width", "height", "fit", "inside mount", "outside mount"],
    response:
      "For inside mount, measure width in three places and use the narrowest number. Measure height in three places and use the tallest. If you want, I can guide you step by step.",
  },
  {
    keywords: ["same day", "today", "fast", "quick", "rush", "urgent", "immediately", "asap"],
    response:
      "If speed matters, start with in-stock options and same-day eligible lines. I can help narrow the catalog toward the fastest route.",
  },
  {
    keywords: ["install", "installation", "hang", "mounting", "how to install", "tools"],
    response:
      "Most standard installs are straightforward once the right mount type is selected. If you tell me the room and window type, I can help you choose before checkout.",
  },
  {
    keywords: ["return", "refund", "exchange", "wrong", "broken", "damaged", "defect"],
    response:
      "If this is about an existing order, the quickest next step is to share the order number. If you are still shopping, I can help reduce the chance of ordering the wrong product.",
  },
  {
    keywords: ["color", "fabric", "material", "sample", "swatch", "style", "wood", "faux"],
    response:
      "If finish and material are the main decision, I would start by narrowing faux wood, real wood, roller, or cellular based on the room and light control you want.",
  },
  {
    keywords: ["hello", "hi", "hey", "howdy", "good morning", "good afternoon", "good evening"],
    response:
      "I can help with product selection, measuring, delivery path, or order questions. What are you shopping for?",
  },
  {
    keywords: ["thanks", "thank you", "thx", "appreciate", "helpful", "great", "perfect", "awesome"],
    response: "Glad to help. If you want, I can narrow the next step or point you to the right product family.",
  },
  {
    keywords: ["phone", "call", "number", "contact", "speak", "talk"],
    response:
      "You can call the showroom team during business hours, or tell me what you are trying to solve and I can guide the next step here.",
  },
];

const DEFAULT_RESPONSE =
  "Tell me the room, dimensions, material preference, or delivery timing you care about, and I will help narrow the right direction.";

function getAutoResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of AUTO_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

export function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const popupRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const addAgentMessage = useCallback((text: string, delay = 0) => {
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `msg_${Date.now()}_${Math.random()}`, from: "agent", text, time: getTimeStr() },
      ]);
    }, delay);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    if (!hasGreeted) {
      setHasGreeted(true);
      setIsTyping(true);
      addAgentMessage(
        `Tell me the room, measurements, material, or delivery priority, and I can help narrow the right blind path.`,
        900,
      );
    }
  };

  const handleClose = () => setIsOpen(false);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        from: "user",
        text: trimmed,
        time: getTimeStr(),
        read: false,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? { ...m, read: true } : m)));
      }, 800);

      const responseDelay = 900 + Math.random() * 600;
      setTimeout(() => setIsTyping(true), 250);
      addAgentMessage(getAutoResponse(trimmed), responseDelay);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    },
    [addAgentMessage, isOpen],
  );

  const handleSend = () => sendMessage(inputText);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => sendMessage(text);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-[calc(1rem+var(--safe-bottom))] right-[0.5rem] z-[9990] flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border border-white/30 bg-olive/65 text-white shadow-[0_12px_44px_rgba(101,116,93,0.2)] backdrop-blur-2xl transition-colors duration-300 hover:bg-olive/82 sm:bottom-[calc(1.5rem+var(--safe-bottom))] sm:right-[1rem]"
          aria-label="Open live chat"
        >
          <ChatsCircle className="h-5.5 w-5.5" weight="regular" />
          {unreadCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-xl border-2 border-white bg-brass px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          ) : (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brass" />
          )}
        </button>
      )}

      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-end p-0 sm:p-6">
          <div
            ref={popupRef}
            className="pointer-events-auto dialog-shell flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none animate-in slide-in-from-bottom-5 fade-in duration-300 sm:h-[620px] sm:max-h-[calc(100vh-48px)] sm:max-w-[520px] sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-center gap-4 bg-slate px-4 py-4 sm:px-5">
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-shell/10">
                  <Image
                    src="/images/home/agent-avatar.jpg"
                    alt={AGENT_NAME}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate bg-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold leading-tight text-white">{AGENT_NAME}</p>
                </div>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/60">{AGENT_ROLE}</p>
              </div>
              <CloseButton
                onClick={handleClose}
                variant="light"
                magnetic
                className="shrink-0"
              />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-shell/50 px-4 py-4 sm:px-5 sm:py-5">
              {messages.length === 0 && !isTyping && (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-olive/10">
                    <Headphones className="h-8 w-8 text-olive" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate">Start a conversation</p>
                    <p className="mt-1 text-xs text-slate/50">Ask about products, measuring, or delivery timing.</p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "agent" && (
                    <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm">
                      <Image
                        src="/images/home/agent-avatar.jpg"
                        alt={AGENT_NAME}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`flex max-w-[84%] flex-col gap-1 sm:max-w-[80%] ${msg.from === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm ${msg.from === "user" ? "rounded-xl bg-olive text-white" : "rounded-xl bg-white text-slate"
                        }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={`flex items-center gap-1 ${msg.from === "user" ? "justify-end pr-1" : "justify-start pl-1"}`}
                    >
                      <span className="text-[10px] font-bold text-slate/40">{msg.time}</span>
                      {msg.from === "user" &&
                        (msg.read ? (
                          <Checks className="h-3 w-3 text-olive" />
                        ) : (
                          <Check className="h-3 w-3 text-slate/30" />
                        ))}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start gap-2.5">
                  <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm">
                    <Image
                      src="/images/home/agent-avatar.jpg"
                      alt={AGENT_NAME}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-3.5 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate/40" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.filter((m) => m.from === "user").length === 0 && !isTyping && messages.length > 0 && (
              <div className="shrink-0 bg-shell/50 px-4 pb-2 pt-3 sm:px-5">
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_REPLIES.map((qr) => (
                    <Button
                      key={qr}
                      type="button"
                      variant="secondary"
                      onClick={() => handleQuickReply(qr)}
                      className="h-auto rounded-xl px-2 py-2.5 text-[0.76rem] leading-4 shadow-none"
                    >
                      {qr}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="shrink-0 bg-shell/50 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Tell me the room, dimensions, material, or delivery need."
                  className="min-h-[50px] max-h-28 flex-1 resize-none overflow-y-auto border-0 bg-transparent py-1 text-sm leading-relaxed text-slate outline-none placeholder:text-slate/40"
                />
                <Button
                  type="button"
                  variant="olive"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </div>
              <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate/30">
                Replies within minutes · Mon–Fri 8AM–5PM
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
