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

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Casting Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
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
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm font-cinzel flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all backdrop-blur-md"
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
                className="py-3 px-4 rounded-xl glass-card hover:bg-white/10 text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0"
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
                          className={`text-[10px] font-semibold w-20 text-right ${
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

            {/* Revealed Hexagram Banner with Quote */}
            {currentHexagram && (
              <div className="rounded-xl glass-panel-gold p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Quẻ Số {currentHexagram.number}
                    </span>
                    <h3 className="text-base sm:text-xl font-bold font-cinzel text-amber-200 mt-1">
                      {currentHexagram.name} ({currentHexagram.chineseName})
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Thượng: <strong className="text-amber-300">{currentHexagram.upperTrigram}</strong> ({currentHexagram.upperTrigramSymbol}) • Hạ: <strong className="text-amber-300">{currentHexagram.lowerTrigram}</strong> ({currentHexagram.lowerTrigramSymbol})
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg glass-card text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-amber-300">Ý nghĩa: </strong>
                    {currentHexagram.meaning}
                  </p>
                  <p>
                    <strong className="text-amber-300">Lời Thoán: </strong>
                    <span className="italic">{currentHexagram.judgment}</span>
                  </p>
                </div>

                {/* Famous Quote Banner */}
                <div className="p-3.5 rounded-xl glass-card border-amber-400/40 text-xs relative overflow-hidden">
                  <Quote className="w-8 h-8 text-amber-400/20 absolute right-2 top-2 pointer-events-none" />
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Minh Triết Tương Ứng Của Danh Nhân
                  </div>
                  <p className="font-playfair text-xs sm:text-sm text-amber-100 italic leading-relaxed">
                    "{currentHexagram.quote.text}"
                  </p>
                  <div className="text-right text-[11px] font-bold text-amber-300 mt-1">
                    — {currentHexagram.quote.author}
                  </div>
                </div>

                {/* Submit button for master deep reading */}
                <button
                  type="button"
                  onClick={handleInterpretKinhDich}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-40 backdrop-blur-md"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang luận giải càn khôn & kế sách hành xử...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Bắt Đầu Luận Giải Quẻ Dịch & Kế Sách
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl glass-panel-gold p-5 flex-1 flex flex-col shadow-xl min-h-[480px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-amber-400/30 flex items-center justify-center text-amber-400 backdrop-blur-md">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200">
                    Bản Luận Giải Chu Dịch
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentHexagram ? currentHexagram.name : "Kinh Dịch Chiêm Bái"}
                  </p>
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
                    <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <Coins className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-cinzel text-sm font-semibold text-amber-300">
                      Đang suy ngẫm lẽ biến dịch càn khôn...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Bậc cao nhân Chu Dịch đang suy xét hào từ, tượng quẻ và kế sách hành xử phù hợp nhất với thời thế.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <p className="font-semibold">Lỗi chiêm quẻ:</p>
                  <p>{error}</p>
                </div>
              ) : readingResult ? (
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  <div className="p-3 rounded-xl glass-card text-xs text-amber-200 border-amber-400/30">
                    <span className="font-semibold text-amber-300">Vấn đề chiêm bái: </span>
                    {question || "Dự đoán sự việc"}
                  </div>
                  <MarkdownRenderer content={readingResult} />

                  {/* Follow-up Consultation Chat */}
                  <ConsultationChat
                    discipline="kinh-dich"
                    masterTitle="Bậc Cao Nhân Chu Dịch"
                    masterSubtitle="Đàm đạo về hào động, thời thế và đạo quân tử xử thế"
                    contextSummary={`Quẻ Dịch: ${currentHexagram?.name || "Chiêm quẻ"}, câu hỏi: ${question || "Dự đoán thời thế"}`}
                    initialMessagePlaceholder="Thỉnh giáo thêm về hào động biến hoá hay cách xử trí trong hoàn cảnh này..."
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500">
                    <Layers className="w-7 h-7 text-amber-500/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-300">
                      Chưa có quẻ Dịch được gieo
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Hãy gieo đủ 6 hào và bấm "Bắt Đầu Luận Giải Quẻ Dịch & Kế Sách".
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
