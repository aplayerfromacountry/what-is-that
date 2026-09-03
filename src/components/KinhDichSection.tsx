import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  RefreshCw,
  Coins,
  Quote,
  Save,
  Check,
  Copy,
  ChevronRight,
  BookOpen,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";
import { HEXAGRAMS, getRandomHexagram, TRIGRAMS } from "../data/kinhDichData";
import { Hexagram } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem } from "../utils/historyStorage";
import { motion, AnimatePresence } from "motion/react";

interface KinhDichSectionProps {
  onSavedToHistory?: () => void;
}

export const KinhDichSection: React.FC<KinhDichSectionProps> = ({ onSavedToHistory }) => {
  const [question, setQuestion] = useState<string>("");
  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [tossHistory, setTossHistory] = useState<number[]>([]); // 6 tosses (sums: 6, 7, 8, 9)
  const [currentCoins, setCurrentCoins] = useState<[number, number, number]>([2, 3, 2]); // 2: Âm, 3: Dương
  const [currentHexagram, setCurrentHexagram] = useState<Hexagram | null>(null);

  // Interpretation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Single coin toss step (3 coins)
  const handleTossOnce = () => {
    if (tossHistory.length >= 6) return;

    setIsTossing(true);
    setTimeout(() => {
      // Each coin has 50% chance of 2 (Yin) or 3 (Yang)
      const c1 = Math.random() < 0.5 ? 2 : 3;
      const c2 = Math.random() < 0.5 ? 2 : 3;
      const c3 = Math.random() < 0.5 ? 2 : 3;
      const sum = c1 + c2 + c3; // 6 (Lão Âm), 7 (Thiếu Dương), 8 (Thiếu Âm), 9 (Lão Dương)

      setCurrentCoins([c1, c2, c3]);
      const newHistory = [...tossHistory, sum];
      setTossHistory(newHistory);
      setIsTossing(false);

      if (newHistory.length === 6) {
        // Complete 6 lines! Calculate hexagram
        determineHexagram(newHistory);
      }
    }, 350);
  };

  // Instant full 6-line cast
  const handleQuickCast = () => {
    setIsTossing(true);
    setReadingResult(null);
    setHasSaved(false);

    setTimeout(() => {
      const history: number[] = [];
      for (let i = 0; i < 6; i++) {
        const c1 = Math.random() < 0.5 ? 2 : 3;
        const c2 = Math.random() < 0.5 ? 2 : 3;
        const c3 = Math.random() < 0.5 ? 2 : 3;
        history.push(c1 + c2 + c3);
      }
      setTossHistory(history);
      setCurrentCoins([3, 3, 2]);
      determineHexagram(history);
      setIsTossing(false);
    }, 400);
  };

  const determineHexagram = (history: number[]) => {
    // Binary string: 7 or 9 => 1 (Yang line), 6 or 8 => 0 (Yin line)
    // Lines are from 1 (bottom) to 6 (top)
    const binary = history.map((s) => (s % 2 === 1 ? "1" : "0")).join("");

    // Find hexagram in dataset or random fallback
    const found = HEXAGRAMS.find((h) => h.binary === binary) || getRandomHexagram();
    setCurrentHexagram(found);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#eab308", "#ca8a04"],
      });
    } catch (e) {}
  };

  const handleReset = () => {
    setTossHistory([]);
    setCurrentHexagram(null);
    setReadingResult(null);
    setError(null);
    setHasSaved(false);
  };

  const handleInterpretKinhDich = async () => {
    if (!currentHexagram) {
      setError("Vui lòng hoàn tất 6 lần gieo quẻ trước khi luận giải.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      // Find changing lines (6 = Lão Âm, 9 = Lão Dương)
      const changingLines = tossHistory
        .map((val, idx) => ((val === 6 || val === 9) ? idx + 1 : null))
        .filter((val): val is number => val !== null);

      const payload = {
        question: question || "Dự đoán sự việc & định hướng hành động theo Kinh Dịch",
        primaryHexagram: currentHexagram,
        changingLines,
        quote: currentHexagram.quote,
      };

      const res = await fetch("/api/kinh-dich/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể luận giải quẻ Dịch lúc này.");
      }

      setReadingResult(data.reading);

      // Auto save
      saveHistoryItem({
        type: "kinh-dich",
        title: `Kinh Dịch - ${currentHexagram.name}`,
        aspectOrSpread: currentHexagram.name,
        question: question || "Chiêm đoán quẻ Dịch",
        resultMarkdown: data.reading,
        meta: {
          hexagram: {
            name: currentHexagram.name,
            number: currentHexagram.number,
            quote: currentHexagram.quote,
          },
        },
      });
      setHasSaved(true);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố khi kết nối Chu Dịch AI.");
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
    <div id="kinh-dich-section" className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <Coins className="w-3.5 h-3.5" />
            Chu Dịch Chiêm Bái • 64 Quẻ Âm Dương Biến Dịch
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-playfair text-amber-200 tracking-wide">
            Gieo Quẻ Kinh Dịch & Minh Triết Danh Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Mô phỏng gieo 3 đồng tiền cổ Lục Hào, đón nhận quẻ Cát Hung, Lời Thoán, Tượng Quẻ cùng
            câu châm ngôn triết học của các bậc vĩ nhân thế giới tương ứng với đạo biến dịch.
          </p>
        </div>
      </div>

      {/* Top 2 Columns on Desktop: Steps 1 & 2 on Left, Revealed Hexagram on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Casting Area (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Question input */}
          <div className="rounded-2xl glass-panel p-4 sm:p-5 space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Bước 1: Khởi Tâm Niệm Sự Việc Cần Hỏi
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ví dụ: Dự định đầu tư hợp tác kinh doanh sắp tới của tôi sẽ diễn tiến ra sao?"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200"
            />
          </div>

          {/* Interactive Coin Casting Board */}
          <div className="rounded-2xl glass-panel-gold p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Bước 2: Gieo 3 Đồng Tiền Cổ 6 Lần (Đã Gieo: {tossHistory.length}/6 Hào)
              </h2>
              {tossHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Gieo lại từ đầu
                </button>
              )}
            </div>

            {/* Bronze Coins Interactive Display */}
            <div className="flex items-center justify-center gap-4 py-4">
              {currentCoins.map((coinVal, idx) => (
                <div
                  key={idx}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/80 bg-gradient-to-br ${
                    coinVal === 3
                      ? "from-amber-400 via-yellow-500 to-amber-700"
                      : "from-amber-600 via-amber-700 to-stone-800"
                  } shadow-lg shadow-amber-500/25 flex flex-col items-center justify-center text-slate-950 font-bold transition-transform duration-300 backdrop-blur-md ${
                    isTossing ? "rotate-180 scale-105" : "hover:scale-105"
                  }`}
                >
                  <div className="w-6 h-6 rounded-sm border-2 border-amber-900/60 bg-amber-950/20 flex items-center justify-center text-[10px] font-mono">
                    {coinVal === 3 ? "陽" : "陰"}
                  </div>
                  <span className="text-[10px] font-semibold mt-1 text-slate-900">
                    {coinVal === 3 ? "Dương (+3)" : "Âm (+2)"}
                  </span>
                </div>
              ))}
            </div>

            {/* Toss Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleTossOnce}
                disabled={isTossing || tossHistory.length >= 6}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm font-cinzel flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all backdrop-blur-md cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                {tossHistory.length < 6
                  ? `Tung Đồng Tiền Lần ${tossHistory.length + 1}`
                  : "✓ Đã Gieo Đủ 6 Hào"}
              </button>

              <button
                type="button"
                onClick={handleQuickCast}
                disabled={isTossing}
                className="py-3 px-4 rounded-xl glass-card hover:bg-white/10 text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Gieo Tức Thì 6 Hào
              </button>
            </div>

            {/* 6 Hexagram Lines Visualizer (Rendered from Line 6 down to Line 1) */}
            {tossHistory.length > 0 && (
              <div className="rounded-xl glass-card p-4 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1 border-b border-white/10">
                  <span>Hào (Từ dưới lên trên):</span>
                  <span>Âm Dương / Hào Động</span>
                </div>

                <div className="flex flex-col-reverse gap-2">
                  {tossHistory.map((val, idx) => {
                    const isYang = val % 2 === 1;
                    const isChanging = val === 6 || val === 9;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">
                          Hào {idx + 1}:
                        </span>
                        {/* Line representation */}
                        <div className="flex-1 flex items-center gap-1.5 h-4">
                          {isYang ? (
                            // Solid Yang line
                            <div className="flex-1 h-3 rounded-sm bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm" />
                          ) : (
                            // Broken Yin line
                            <>
                              <div className="flex-1 h-3 rounded-sm bg-gradient-to-r from-slate-500 to-slate-400" />
                              <div className="w-4" />
                              <div className="flex-1 h-3 rounded-sm bg-gradient-to-r from-slate-400 to-slate-500" />
                            </>
                          )}
                        </div>
                        {/* Changing Line Indicator */}
                        <span
                          className={`text-[10px] font-semibold w-24 text-right ${
                            isChanging
                              ? "text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30"
                              : "text-slate-400"
                          }`}
                        >
                          {val === 9
                            ? "Lão Dương ◯"
                            : val === 6
                            ? "Lão Âm ✕"
                            : isYang
                            ? "Thiếu Dương"
                            : "Thiếu Âm"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Revealed Hexagram Card (Phần Gieo Ra Quẻ Gì) (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {currentHexagram ? (
            <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 space-y-4 shadow-xl border border-amber-500/40 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="inline-flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                    {currentHexagram.number}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                      Kết Quả Gieo Quẻ
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold font-cinzel text-amber-100">
                      {currentHexagram.name} ({currentHexagram.chineseName})
                    </h3>
                  </div>
                </div>
                <span className="text-xs text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Quẻ Số {currentHexagram.number}/64
                </span>
              </div>

              {/* Trigrams Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Thượng Quái</span>
                  <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">
                    {currentHexagram.upperTrigram} ({currentHexagram.upperTrigramSymbol})
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Hạ Quái</span>
                  <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">
                    {currentHexagram.lowerTrigram} ({currentHexagram.lowerTrigramSymbol})
                  </div>
                </div>
              </div>

              {/* Meaning & Judgment */}
              <div className="p-3.5 rounded-xl glass-card text-xs sm:text-sm text-slate-200 space-y-2">
                <p>
                  <strong className="text-amber-300 font-semibold">Ý nghĩa quẻ: </strong>
                  {currentHexagram.meaning}
                </p>
                <p>
                  <strong className="text-amber-300 font-semibold">Lời Thoán (Thoán Từ): </strong>
                  <span className="italic text-amber-100">{currentHexagram.judgment}</span>
                </p>
              </div>

              {/* Famous Quote Banner */}
              <div className="p-4 rounded-xl glass-card border-amber-400/40 text-xs relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-950/20 to-transparent">
                <Quote className="w-10 h-10 text-amber-400/15 absolute right-2 top-2 pointer-events-none" />
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Minh Triết Tương Ứng Của Danh Nhân
                </div>
                <p className="font-playfair text-xs sm:text-sm text-amber-100 italic leading-relaxed">
                  "{currentHexagram.quote.text}"
                </p>
                <div className="text-right text-xs font-bold text-amber-300 mt-1.5">
                  — {currentHexagram.quote.author}
                </div>
              </div>

              {/* Action Button: Start Deep Reading */}
              <button
                type="button"
                onClick={handleInterpretKinhDich}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-40 backdrop-blur-md cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang quan sát hào biến & luận giải...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Bắt Đầu Luận Giải Quẻ Dịch & Kế Sách
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Placeholder when waiting for coins to be cast */
            <div className="rounded-2xl glass-panel-gold p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4 shadow-xl border border-white/10 min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
                <Layers className="w-8 h-8 text-amber-400/80 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base sm:text-lg font-bold font-cinzel text-amber-200">
                  {tossHistory.length === 0
                    ? "Đang Chờ Khởi Tâm Gieo Quẻ"
                    : `Đã Gieo Được ${tossHistory.length}/6 Hào`}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tossHistory.length === 0
                    ? "Hãy điền câu hỏi ở Bước 1 và nhấn tung đồng tiền 6 lần (hoặc Gieo Tức Thì) ở Bước 2. Thông tin quẻ số, thượng/hạ quái và danh ngôn sẽ hiển thị tại đây."
                    : "Tiếp tục gieo cho đủ 6 hào để xác lập quẻ Thượng - Hạ và hào biến tương ứng."}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-2 pt-2">
                {[0, 1, 2, 3, 4, 5].map((stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      stepIdx < tossHistory.length
                        ? "bg-amber-400 scale-110 shadow-sm shadow-amber-400/50"
                        : "bg-white/15 border border-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Full-Width Interpretation Result & Consultation Chat (Bản Luận Giải đặt xuống dưới 2 bước) */}
      <div className="w-full">
        <div className="rounded-2xl glass-panel-gold p-5 sm:p-7 flex flex-col shadow-2xl border border-amber-500/30 min-h-[380px]">
          {/* Header of Interpretation */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-cinzel text-amber-200">
                  Bản Luận Giải Chu Dịch & Kế Sách Càn Khôn
                </h3>
                <p className="text-xs text-slate-400">
                  {currentHexagram
                    ? `Luận giải chuyên sâu cho quẻ ${currentHexagram.name} • ${currentHexagram.chineseName}`
                    : "Chiêm bái biến dịch theo câu hỏi của bạn"}
                </p>
              </div>
            </div>

            {readingResult && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sao chép toàn bộ bản luận giải"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                {hasSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                    <Save className="w-3.5 h-3.5" /> Đã lưu vào lịch sử
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body of Interpretation */}
          <div>
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <Coins className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-cinzel text-base font-semibold text-amber-300">
                    Đang cùng bạn chiêm nghiệm lẽ biến dịch càn khôn...
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Đang phân tích kỹ lưỡng quẻ chủ, hào từ, lời thoán và đề xuất các kế sách ứng xử đắc nhân tâm phù hợp nhất.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm space-y-2">
                <p className="font-semibold">Lỗi luận giải quẻ:</p>
                <p>{error}</p>
              </div>
            ) : readingResult ? (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
                <div className="p-3.5 rounded-xl glass-card text-xs sm:text-sm text-amber-200 border-amber-400/30 flex items-start gap-2">
                  <span className="font-semibold text-amber-300 shrink-0">Vấn đề chiêm bái:</span>
                  <span className="italic">{question || "Dự đoán sự việc & định hướng hành động"}</span>
                </div>

                <div className="prose-container bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5">
                  <MarkdownRenderer content={readingResult} />
                </div>

                {/* Follow-up Consultation Chat */}
                <ConsultationChat
                  discipline="kinh-dich"
                  masterTitle="Người Bạn Chu Dịch"
                  masterSubtitle="Cùng bạn trò chuyện về hào động, thời thế và cách ứng biến trong cuộc sống"
                  contextSummary={`Quẻ Dịch: ${currentHexagram?.name || "Chiêm quẻ"}, câu hỏi: ${question || "Dự đoán thời thế"}`}
                  initialMessagePlaceholder="Hỏi thêm về hào động biến hoá hay cách xử trí phù hợp nhất..."
                />
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500">
                  <Layers className="w-7 h-7 text-amber-500/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">
                    Bản luận giải sẽ xuất hiện tại đây
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Sau khi hoàn tất gieo đủ 6 hào và bấm <strong>"Bắt Đầu Luận Giải Quẻ Dịch & Kế Sách"</strong> ở trên, toàn bộ nội dung phân tích chi tiết và khung đàm đạo sẽ mở ra tại đây.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
