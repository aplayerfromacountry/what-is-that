import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  Send,
  Save,
  Check,
  RefreshCw,
  Copy,
  Layers,
  Heart,
  Briefcase,
  Compass,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TAROT_DECK, TAROT_SPREADS } from "../data/tarotData";
import { TarotCard, DrawnCard, TarotSpread } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem } from "../utils/historyStorage";
import { motion, AnimatePresence } from "motion/react";

interface TarotSectionProps {
  onSavedToHistory?: () => void;
}

export const TarotSection: React.FC<TarotSectionProps> = ({ onSavedToHistory }) => {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(TAROT_SPREADS[1]); // Default 3 cards
  const [question, setQuestion] = useState<string>("");
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDeckShuffling, setIsDeckShuffling] = useState<boolean>(false);

  // Interpretation status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Shuffle deck on mount or spread change
  useEffect(() => {
    shuffleDeck();
  }, [selectedSpread]);

  const shuffleDeck = () => {
    setIsDeckShuffling(true);
    setDrawnCards([]);
    setReadingResult(null);
    setError(null);
    setHasSaved(false);

    setTimeout(() => {
      const copy = [...TAROT_DECK];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setShuffledDeck(copy);
      setIsDeckShuffling(false);
    }, 400);
  };

  const handleDrawCard = (card: TarotCard, index: number) => {
    if (drawnCards.length >= selectedSpread.cardCount) return;

    // Check if card is already drawn
    if (drawnCards.some((c) => c.id === card.id)) return;

    // 25% chance of being reversed
    const isReversed = Math.random() < 0.25;
    const positionIndex = drawnCards.length;
    const positionName = selectedSpread.positions[positionIndex] || `Vị trí ${positionIndex + 1}`;

    const newDrawnCard: DrawnCard = {
      ...card,
      isReversed,
      positionName,
    };

    const updated = [...drawnCards, newDrawnCard];
    setDrawnCards(updated);

    // Sparkle effect if finished drawing all cards
    if (updated.length === selectedSpread.cardCount) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#fbbf24", "#818cf8", "#f472b6"],
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleQuickDrawAll = () => {
    setDrawnCards([]);
    setReadingResult(null);
    const available = [...shuffledDeck];
    const picked: DrawnCard[] = [];

    for (let i = 0; i < selectedSpread.cardCount; i++) {
      if (available.length === 0) break;
      const randIdx = Math.floor(Math.random() * available.length);
      const card = available.splice(randIdx, 1)[0];
      const isReversed = Math.random() < 0.25;
      const positionName = selectedSpread.positions[i] || `Vị trí ${i + 1}`;

      picked.push({
        ...card,
        isReversed,
        positionName,
      });
    }

    setDrawnCards(picked);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#818cf8", "#c084fc"],
      });
    } catch (e) {}
  };

  const handleInterpretTarot = async () => {
    if (drawnCards.length < selectedSpread.cardCount) {
      setError(`Vui lòng bốc đủ ${selectedSpread.cardCount} lá bài trước khi luận giải.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      const payload = {
        question: question || "Thông điệp vũ trụ và định hướng cuộc sống dành cho tôi",
        spreadType: selectedSpread.name,
        cards: drawnCards,
      };

      const res = await fetch("/api/tarot/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể luận giải trải bài Tarot lúc này.");
      }

      setReadingResult(data.reading);

      // Save to local history
      saveHistoryItem({
        type: "tarot",
        title: `Tarot - ${selectedSpread.name}`,
        aspectOrSpread: selectedSpread.name,
        question: question || "Thông điệp vũ trụ dành cho tôi",
        resultMarkdown: data.reading,
        meta: {
          cards: drawnCards.map((c) => ({
            name: c.name,
            isReversed: c.isReversed,
            position: c.positionName,
          })),
        },
      });
      setHasSaved(true);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố khi kết nối Tarot AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!readingResult) return;
    navigator.clipboard.writeText(readingResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="tarot-section" className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Tarot Tương Tác • Tự Tay Rút Bài Ngẫu Nhiên
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-playfair text-amber-200 tracking-wide">
            Bốc Bài Tarot & Thấu Cảm Trực Giác
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Tĩnh tâm, tập trung vào câu hỏi trong lòng, chọn trải bài và tự tay rút các lá bài từ bộ
            bài ngẫu nhiên để đón nhận thông điệp chỉ dẫn từ vũ trụ.
          </p>
        </div>
      </div>

      {/* Spreads selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Bước 1: Chọn Kiểu Trải Bài
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {TAROT_SPREADS.map((spread) => {
            const isSelected = selectedSpread.id === spread.id;
            return (
              <button
                key={spread.id}
                type="button"
                onClick={() => {
                  setSelectedSpread(spread);
                  setDrawnCards([]);
                }}
                className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md ${
                  isSelected
                    ? "bg-purple-600/20 border-purple-400/60 text-amber-200 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400/40"
                    : "glass-card text-slate-300 hover:border-purple-400/40"
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-1">
                  {spread.name}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                  {spread.description}
                </p>
                <div className="mt-2 text-[10px] font-bold text-amber-400/90">
                  {spread.cardCount} Lá bài
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Input */}
      <div className="rounded-2xl glass-panel p-4 sm:p-5 space-y-2">
        <label className="block text-xs sm:text-sm font-semibold text-amber-300 font-cinzel">
          Bước 2: Tâm Niệm Câu Hỏi / Vấn Đề Cần Thấu Suốt
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Tôi nên có thái độ và hành động thế nào trước cơ hội công việc mới?"
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={shuffleDeck}
              disabled={isDeckShuffling}
              className="px-3.5 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              title="Xáo trộn lại bộ bài"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isDeckShuffling ? "animate-spin" : ""}`} />
              Xáo bài
            </button>
            <button
              type="button"
              onClick={handleQuickDrawAll}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Bốc nhanh {selectedSpread.cardCount} lá
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Deck Fan & Drawn Cards Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Card Selection Deck (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl glass-panel p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Bước 3: Nhấp Vào Lá Bài Bất Kỳ Để Tự Rút ({drawnCards.length}/{selectedSpread.cardCount})
              </div>
              {drawnCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawnCards([])}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Rút lại
                </button>
              )}
            </div>

            {/* Shuffled Card Deck Grid */}
            <div className="relative p-4 rounded-xl glass-card overflow-hidden">
              <p className="text-[11px] text-center text-slate-300 mb-3">
                {drawnCards.length >= selectedSpread.cardCount
                  ? "✓ Đã rút đủ bài cho trải này! Bấm 'Luận Giải Trải Bài' bên dưới."
                  : `Hãy nhấp chọn ${selectedSpread.cardCount - drawnCards.length} lá bài bạn cảm thấy thu hút nhất:`}
              </p>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-1">
                {shuffledDeck.map((card, idx) => {
                  const isDrawn = drawnCards.some((c) => c.id === card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isDrawn || drawnCards.length >= selectedSpread.cardCount}
                      onClick={() => handleDrawCard(card, idx)}
                      className={`h-20 sm:h-24 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center p-1 relative group backdrop-blur-md ${
                        isDrawn
                          ? "opacity-20 scale-90 border-white/5 bg-white/5 cursor-not-allowed"
                          : "bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border-amber-400/30 hover:border-amber-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/15 active:scale-95"
                      }`}
                    >
                      <div className="w-full h-full rounded border border-amber-500/10 flex flex-col items-center justify-center bg-radial from-amber-500/5 to-transparent">
                        <Sparkles className="w-3 h-3 text-amber-400/60 group-hover:text-amber-300" />
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-200 mt-1">
                          {idx + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawn Cards Display */}
            {drawnCards.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-semibold text-amber-300 font-cinzel">
                  Các Lá Bài Đã Được Khai Mở:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {drawnCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 bg-gradient-to-b ${card.colorGradient} border-amber-400/30 text-xs space-y-1.5 shadow-lg relative overflow-hidden transition-all backdrop-blur-md`}
                    >
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {card.positionName}
                      </div>
                      <div className="font-bold text-slate-100 text-sm flex items-center justify-between">
                        <span>{card.name}</span>
                        {card.isReversed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Ngược
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {card.keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-amber-200/90 border border-amber-500/10 backdrop-blur-sm"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug pt-1">
                        {card.isReversed ? card.reversedMeaning : card.uprightMeaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              type="button"
              onClick={handleInterpretTarot}
              disabled={isLoading || drawnCards.length < selectedSpread.cardCount}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.99] transition-all disabled:opacity-40 backdrop-blur-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang lắng nghe trực giác & luận giải...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Bắt Đầu Luận Giải Trải Bài Tarot
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Reading Result (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl glass-panel-gold p-5 flex-1 flex flex-col shadow-xl min-h-[480px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-purple-400/30 flex items-center justify-center text-purple-400 backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200">
                    Bản Luận Giải Trực Giác
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedSpread.name}</p>
                </div>
              </div>

              {readingResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{copied ? "Đã chép" : "Chép"}</span>
                  </button>
                  {hasSaved && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <Save className="w-3 h-3" /> Đã lưu
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
                    <Sparkles className="w-7 h-7 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-cinzel text-sm font-semibold text-amber-300">
                      Đang kết nối trực giác & thông điệp các lá bài...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Tarot Reader đang cảm nhận năng lượng và biểu tượng từ các lá bài để giải mã cho bạn.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <p className="font-semibold">Lỗi luận giải:</p>
                  <p>{error}</p>
                </div>
              ) : readingResult ? (
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  <div className="p-3 rounded-xl glass-card text-xs text-purple-200 border-purple-400/30">
                    <span className="font-semibold text-purple-300">Câu hỏi chiêm bái: </span>
                    {question || "Thông điệp vũ trụ"}
                  </div>
                  <MarkdownRenderer content={readingResult} />

                  {/* Master Follow-up Consultation */}
                  <ConsultationChat
                    discipline="tarot"
                    masterTitle="Tarot Reader Trực Giác"
                    masterSubtitle="Lắng nghe tâm tư và soi chiếu thông điệp sâu hơn từ các lá bài"
                    contextSummary={`Trải bài ${selectedSpread.name}, các lá đã rút: ${drawnCards.map(c => `${c.card.nameVi} (${c.position})`).join(", ")}, câu hỏi: ${question || "Thông điệp vũ trụ"}`}
                    initialMessagePlaceholder="Tâm sự hoặc hỏi thêm Reader về một lá bài cụ thể hay lời khuyên tiếp theo..."
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500">
                    <Layers className="w-7 h-7 text-purple-400/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-300">
                      Chưa có trải bài được kích hoạt
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Hãy chọn {selectedSpread.cardCount} lá bài và bấm "Bắt Đầu Luận Giải Trải Bài Tarot".
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
