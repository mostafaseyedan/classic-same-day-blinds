import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Message {
  id: string;
  from: 'user' | 'agent';
  text: string;
  time: string;
  read?: boolean;
}

const AGENT_NAME = 'Sarah';
const AGENT_ROLE = 'Window Treatment Specialist';

function getTimeStr() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const QUICK_REPLIES = [
  'Get a price quote',
  'Track my order',
  'Measuring help',
  'Same-day delivery?',
  'Installation info',
];

const AUTO_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['price', 'quote', 'cost', 'how much', 'pricing', 'cheap', 'afford', 'expensive'],
    response: "Great question! Our custom blinds start at $39 per window. Prices vary based on size, material, and style. I'd love to give you an accurate quote — could you share your window dimensions and the room you're working on?",
  },
  {
    keywords: ['track', 'order', 'status', 'where', 'shipping', 'delivered', 'delivery status'],
    response: 'To look up your order, head to the Track Order page at the top of our site and enter your Order ID. If you need extra help, share your order number here and I\'ll pull it up for you right away!',
  },
  {
    keywords: ['measure', 'measuring', 'size', 'dimension', 'width', 'height', 'fit', 'inside mount', 'outside mount'],
    response: "Measuring is super important and I'm happy to walk you through it! For inside mounts, measure the exact width at the top, middle, and bottom — use the narrowest. For outside mounts, add 3\" on each side. Check out our full How to Measure guide in the menu, or I can guide you step by step right here!",
  },
  {
    keywords: ['same day', 'today', 'fast', 'quick', 'rush', 'urgent', 'immediately', 'asap'],
    response: 'Yes! We specialize in same-day delivery across the DFW area. Orders placed before 11 AM on weekdays typically deliver the same day. Just complete your order and we\'ll get it moving right away! 🚀',
  },
  {
    keywords: ['install', 'installation', 'hang', 'mounting', 'how to install', 'tools'],
    response: "Installing our blinds is easy — most people finish in under 15 minutes with just a drill and screwdriver. We include all hardware and full instructions. For tricky spots or larger windows, we also offer professional installation — just ask!",
  },
  {
    keywords: ['return', 'refund', 'exchange', 'wrong', 'broken', 'damaged', 'defect'],
    response: "We stand behind every product with a 30-day return policy and a 3-year warranty. If something's wrong with your order, I'll make it right. Can you share your order number so I can get started?",
  },
  {
    keywords: ['color', 'fabric', 'material', 'sample', 'swatch', 'style', 'wood', 'faux'],
    response: "We carry a wide range of materials — faux wood, real wood, fabric shades, cellular, and more — in dozens of colors. I can help you pick the right style for your space! What room are you working on and what's the overall vibe you're going for?",
  },
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening'],
    response: `Hi there! Great to hear from you 😊 I'm here to help with anything — pricing, measuring, order tracking, or product questions. What can I do for you today?`,
  },
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate', 'helpful', 'great', 'perfect', 'awesome'],
    response: "You're so welcome! Don't hesitate to reach out if you have more questions — I'm always here. Happy decorating! 🪟✨",
  },
  {
    keywords: ['phone', 'call', 'number', 'contact', 'speak', 'talk'],
    response: 'Absolutely! You can call us at **(817) 540-9300** (local) or **(800) 961-9867** (toll free), Monday–Friday 8AM–5PM. Want me to help you with something right now?',
  },
];

const DEFAULT_RESPONSE =
  "Thanks for your message! I'm checking on that for you right now. In the meantime, feel free to browse our products or check out our measuring guide. I'll have an answer for you in just a moment! 😊";

function getAutoResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of AUTO_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

export default function ChatPopup() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const addAgentMessage = useCallback((text: string, delay = 0) => {
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `msg_${Date.now()}_${Math.random()}`, from: 'agent', text, time: getTimeStr() },
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
        `Hi there! 👋 I'm ${AGENT_NAME}, your window treatment specialist. How can I help you today? Feel free to ask about pricing, measuring, orders, or delivery!`,
        1200
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
        from: 'user',
        text: trimmed,
        time: getTimeStr(),
        read: false,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');

      // Show read receipt after brief delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, read: true } : m))
        );
      }, 800);

      // Agent typing + response
      const responseDelay = 1000 + Math.random() * 800;
      setTimeout(() => setIsTyping(true), 400);
      addAgentMessage(getAutoResponse(trimmed), responseDelay);

      // Bump unread if closed
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    },
    [addAgentMessage, isOpen]
  );

  const handleSend = () => sendMessage(inputText);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => sendMessage(text);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer whitespace-nowrap"
        aria-label="Open live chat"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-chat-3-fill text-lg"></i>
        </div>
        <span className="text-sm font-semibold">{t('Live Chat', 'Chat en Vivo')}</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
        {unreadCount === 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          <div
            ref={popupRef}
            className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '520px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              animation: 'chatSlideUp 0.22s ease-out',
            }}
          >
            {/* Header */}
            <div className="bg-green-700 px-4 py-3.5 flex items-center gap-3 shrink-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://readdy.ai/api/search-image?query=professional%20friendly%20female%20customer%20service%20representative%20headshot%20portrait%20smiling%20warm%20neutral%20background%20high%20quality%20photo&width=80&height=80&seq=agent-avatar-001&orientation=squarish"
                    alt={AGENT_NAME}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-green-700 rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">{AGENT_NAME}</p>
                <p className="text-green-200 text-xs">{AGENT_ROLE}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-green-100 text-xs font-medium">Online</span>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/15 ml-2"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-full">
                    <i className="ri-customer-service-2-line text-green-700 text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Start a conversation</p>
                    <p className="text-xs text-gray-400 mt-1">We're here Mon–Fri 8AM–5PM</p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'agent' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-green-100 shrink-0 mt-1">
                      <img
                        src="https://readdy.ai/api/search-image?query=professional%20friendly%20female%20customer%20service%20representative%20headshot%20portrait%20smiling%20warm%20neutral%20background%20high%20quality%20photo&width=80&height=80&seq=agent-avatar-001&orientation=squarish"
                        alt={AGENT_NAME}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className={`max-w-[78%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-green-700 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                      {msg.from === 'user' && (
                        <i className={`text-xs ${msg.read ? 'ri-check-double-line text-green-500' : 'ri-check-line text-gray-400'}`}></i>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-green-100 shrink-0 mt-1">
                    <img
                      src="https://readdy.ai/api/search-image?query=professional%20friendly%20female%20customer%20service%20representative%20headshot%20portrait%20smiling%20warm%20neutral%20background%20high%20quality%20photo&width=80&height=80&seq=agent-avatar-001&orientation=squarish"
                      alt={AGENT_NAME}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (only shown if just one or two messages from agent) */}
            {messages.filter((m) => m.from === 'user').length === 0 && !isTyping && messages.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 flex-wrap shrink-0">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    className="px-3 py-1.5 bg-white border-2 border-green-200 text-green-700 text-xs font-semibold rounded-full hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('Type a message...', 'Escribe un mensaje...')}
                  rows={1}
                  maxLength={500}
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent leading-relaxed max-h-24 overflow-y-auto"
                  style={{ minHeight: '42px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <i className="ri-send-plane-fill text-base"></i>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                {t('Replies within minutes · Mon–Fri 8AM–5PM', 'Respuestas en minutos · Lun–Vie 8AM–5PM')}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}