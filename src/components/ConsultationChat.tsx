import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, User, Bot, Loader2, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConsultationChatProps {
  discipline: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich";
  masterTitle: string;
  masterSubtitle: string;
  contextSummary: string;
  initialMessagePlaceholder?: string;
}

export const ConsultationChat: React.FC<ConsultationChatProps> = ({
  discipline,
  masterTitle,
  masterSubtitle,
  contextSummary,
  initialMessagePlaceholder = "Nhập câu hỏi hoặc tâm sự thêm với Thầy / Reader...",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsgText = inputText.trim();
    const newUserMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch("/api/consultation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline,
          contextSummary,
          conversationHistory: currentHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          newMessage: userMsgText,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể nhận phản hồi.");
      }

      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content:
          "Xin thứ lỗi, dòng năng lượng vừa bị gián đoạn đôi chút. Người hữu duyên vui lòng gửi lại lời tâm sự.",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl glass-panel-gold p-4 sm:p-5 border border-amber-500/30 flex flex-col space-y-4 shadow-xl mt-6 backdrop-blur-xl"
    >
      {/* Master Consultation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e1526]" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-cinzel text-amber-200 flex items-center gap-1.5">
              <span>{masterTitle}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-[11px] text-slate-400">{masterSubtitle}</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-amber-300/90 font-medium hidden sm:flex items-center gap-1">
          <span>Đàm đạo trực tiếp</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center text-xs text-slate-400 space-y-1.5">
            <p className="text-amber-200/90 font-serif italic">
              "Nếu còn điều gì trăn trở chưa tỏ tường từ bài luận giải, bạn hãy cứ tự nhiên giãi bày thêm..."
            </p>
            <p className="text-[10px] text-slate-500">
              Tôi sẽ lắng nghe tâm tư và giải thích sâu hơn cho từng nút thắt của bạn.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md backdrop-blur-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-medium rounded-tr-sm"
                      : "glass-card border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                  <div
                    className={`text-[9px] mt-1.5 flex items-center justify-end ${
                      msg.role === "user" ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-amber-300/80 p-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="italic font-serif">Đang lắng nghe và chiêm nghiệm lời hồi đáp...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={initialMessagePlaceholder}
          disabled={isSending}
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gửi</span>
        </motion.button>
      </form>
    </motion.div>
  );
};
