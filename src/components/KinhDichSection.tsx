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
  ArrowRight,
  Dices,
  Search,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { HEXAGRAMS, getRandomHexagram, findHexagramByBinary, TRIGRAMS } from "../data/kinhDichData";
import { Hexagram } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem } from "../utils/historyStorage";
import { motion, AnimatePresence } from "motion/react";

interface KinhDichSectionProps {
  onSavedToHistory?: () => void;
}

// Bát Quái Tiên Thiên Số trong Mai Hoa Dịch Số cổ truyền
const MAI_HOA_TRIGRAMS: { num: number; name: string; symbol: string; bits: string; nature: string }[] = [
  { num: 1, name: "Càn (Trời)", symbol: "☰", bits: "111", nature: "Kim • Cương kiện" },
  { num: 2, name: "Đoài (Đầm)", symbol: "☱", bits: "110", nature: "Kim • Vui vẻ" },
  { num: 3, name: "Ly (Lửa)", symbol: "☲", bits: "101", nature: "Hỏa • Sáng suốt" },
  { num: 4, name: "Chấn (Sấm)", symbol: "☳", bits: "100", nature: "Mộc • Khởi động" },
  { num: 5, name: "Tốn (Gió)", symbol: "☴", bits: "011", nature: "Mộc • Thấm nhập" },
  { num: 6, name: "Khảm (Nước)", symbol: "☵", bits: "010", nature: "Thủy • Hiểm trở" },
  { num: 7, name: "Cấn (Núi)", symbol: "☶", bits: "001", nature: "Thổ • Tĩnh chỉ" },
  { num: 8, name: "Khôn (Đất)", symbol: "☷", bits: "000", nature: "Thổ • Nhu thuận" },
];

export const KinhDichSection: React.FC<KinhDichSectionProps> = ({ onSavedToHistory }) => {
  const [question, setQuestion] = useState<string>("");
  const [castMode, setCastMode] = useState<"luc-hao" | "mai-hoa" | "select">("luc-hao");
  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [tossHistory, setTossHistory] = useState<number[]>([]); // 6 tosses (sums: 6, 7, 8, 9)
  const [currentCoins, setCurrentCoins] = useState<[number, number, number]>([2, 3, 2]); // 2: Âm, 3: Dương
  const [currentHexagram, setCurrentHexagram] = useState<Hexagram | null>(null);
  const [relatingHexagram, setRelatingHexagram] = useState<Hexagram | null>(null);
  const [changingLines, setChangingLines] = useState<number[]>([]);

  // Mai Hoa state
  const [upperTrigramNum, setUpperTrigramNum] = useState<number>(1);
  const [lowerTrigramNum, setLowerTrigramNum] = useState<number>(1);
  const [movingLineNum, setMovingLineNum] = useState<number>(1);

  // Search in 64 hexagrams
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Cast by Mai Hoa Dich So
  const handleCastMaiHoa = (upper?: number, lower?: number, moving?: number) => {
    const upNum = upper || Math.floor(Math.random() * 8) + 1;
    const lowNum = lower || Math.floor(Math.random() * 8) + 1;
    const mvNum = moving || Math.floor(Math.random() * 6) + 1;

    setUpperTrigramNum(upNum);
    setLowerTrigramNum(lowNum);
    setMovingLineNum(mvNum);

    const upTrigram = MAI_HOA_TRIGRAMS.find((t) => t.num === upNum) || MAI_HOA_TRIGRAMS[0];
    const lowTrigram = MAI_HOA_TRIGRAMS.find((t) => t.num === lowNum) || MAI_HOA_TRIGRAMS[0];

    // Combine 6 lines: lower 3 bits (lines 1, 2, 3), upper 3 bits (lines 4, 5, 6)
    const lineBits = (lowTrigram.bits + upTrigram.bits).split("");
    const history: number[] = lineBits.map((bit, idx) => {
      const lineIndex = idx + 1;
      const isYang = bit === "1";
      if (lineIndex === mvNum) {
        // Moving line
        return isYang ? 9 : 6; // Lão Dương hoặc Lão Âm
      }
      // Static line
      return isYang ? 7 : 8; // Thiếu Dương hoặc Thiếu Âm
    });

    setTossHistory(history);
    determineHexagram(history);
  };

  // Direct select from 64 hexagrams
  const handleSelectHexagram = (hex: Hexagram, movingLine: number = 0) => {
    const bits = hex.binary.split("");
    const history = bits.map((bit, idx) => {
      const lineIndex = idx + 1;
      const isYang = bit === "1";
      if (lineIndex === movingLine) {
        return isYang ? 9 : 6;
      }
      return isYang ? 7 : 8;
    });

    setTossHistory(history);
    determineHexagram(history);
  };

  // Determine Quẻ Chủ & Quẻ Biến from 6-line history
  const determineHexagram = (history: number[]) => {
    // Primary binary: 7 or 9 => 1 (Yang line), 6 or 8 => 0 (Yin line)
    // Lines are from 1 (bottom) to 6 (top)
    const binary = history.map((s) => (s % 2 === 1 ? "1" : "0")).join("");
    const found = HEXAGRAMS.find((h) => h.binary === binary) || getRandomHexagram();
    setCurrentHexagram(found);

    // Identify changing lines: 6 (Lão Âm -> Dương) and 9 (Lão Dương -> Âm)
    const chLines = history
      .map((val, idx) => (val === 6 || val === 9 ? idx + 1 : null))
      .filter((val): val is number => val !== null);
    setChangingLines(chLines);

    // Calculate relating hexagram (Quẻ Biến) if changing lines exist
    if (chLines.length > 0) {
      const transformedBinary = history
        .map((s) => {
          if (s === 6) return "1"; // Lão Âm biến thành Dương
          if (s === 9) return "0"; // Lão Dương biến thành Âm
          return s % 2 === 1 ? "1" : "0"; // Thiếu Dương / Thiếu Âm giữ nguyên
        })
        .join("");

      const relFound = HEXAGRAMS.find((h) => h.binary === transformedBinary) || null;
      setRelatingHexagram(relFound);
    } else {
      setRelatingHexagram(null);
    }

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
    setRelatingHexagram(null);
    setChangingLines([]);
    setReadingResult(null);
    setError(null);
    setHasSaved(false);
  };

  const handleInterpretKinhDich = async () => {
    if (!currentHexagram) {
      setError("Vui lòng hoàn tất việc gieo quẻ trước khi luận giải.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      const payload = {
        question: question || "Dự đoán sự việc & định hướng hành động theo Kinh Dịch",
        primaryHexagram: currentHexagram,
        relatingHexagram: relatingHexagram,
        changingLines: changingLines,
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
        title: `Kinh Dịch - ${currentHexagram.name}${relatingHexagram ? ` ➔ Biến: ${relatingHexagram.name}` : ""}`,
        aspectOrSpread: currentHexagram.name,
        question: question || "Chiêm đoán quẻ Dịch",
        resultMarkdown: data.reading,
        meta: {
          hexagram: {
            name: currentHexagram.name,
            number: currentHexagram.number,
            quote: currentHexagram.quote,
            relatingName: relatingHexagram?.name,
            relatingNumber: relatingHexagram?.number,
            changingLines,
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

  // Filter 64 hexagrams for direct selection
  const filteredHexagrams = HEXAGRAMS.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.number.toString() === searchTerm.trim() ||
      h.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="kinh-dich-section" className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <Coins className="w-3.5 h-3.5" />
            Chu Dịch Cổ Truyền • Trọn Vẹn 64 Quẻ Âm Dương Biến Dịch
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-playfair text-amber-200 tracking-wide">
            Gieo Quẻ Kinh Dịch & Minh Triết Danh Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Hệ thống chuẩn xác trọn vẹn 64 Quẻ Chu Dịch cổ truyền. Hỗ trợ phương pháp Tiễn Tiền Pháp (3 đồng tiền cổ Lục Hào),
            Mai Hoa Dịch Số (khởi quẻ Thượng - Hạ - Hào Động) và tra cứu 64 quẻ, luận giải Quẻ Chủ, Quẻ Biến cùng minh triết danh nhân.
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

          {/* Interactive Casting Board */}
          <div className="rounded-2xl glass-panel-gold p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Bước 2: Chọn Cách Gieo 64 Quẻ Cổ Đại
              </h2>
              {tossHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Gieo lại từ đầu
                </button>
              )}
            </div>

            {/* Casting Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCastMode("luc-hao")}
                className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  castMode === "luc-hao"
                    ? "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Coins className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Gieo 3 Đồng Tiền</span>
              </button>
              <button
                type="button"
                onClick={() => setCastMode("mai-hoa")}
                className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  castMode === "mai-hoa"
                    ? "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Dices className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Mai Hoa Dịch Số</span>
              </button>
              <button
                type="button"
                onClick={() => setCastMode("select")}
                className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  castMode === "select"
                    ? "bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Chọn 64 Quẻ</span>
              </button>
            </div>

            {/* MODE 1: Lục Hào (3 Bronze Coins) */}
            {castMode === "luc-hao" && (
              <div className="space-y-4 pt-1">
                <div className="text-center text-[11px] text-slate-400">
                  Tiễn Tiền Pháp cổ truyền: 3 đồng tiền gieo 6 lần từ Sơ Hào (dưới) lên Thượng Hào (trên).
                  Đã gieo: <strong className="text-amber-300 font-mono">{tossHistory.length}/6</strong> hào.
                </div>

                {/* Bronze Coins Interactive Display */}
                <div className="flex items-center justify-center gap-4 py-2">
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
                    Gieo Nhanh 6 Hào
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: Mai Hoa Dịch Số (Thiệu Khang Tiết) */}
            {castMode === "mai-hoa" && (
              <div className="space-y-4 pt-1">
                <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                  <strong className="text-amber-300">Phép Khởi Quẻ Mai Hoa Cổ Truyền:</strong> Phối hợp Thượng Quái (Ngoại quái),
                  Hạ Quái (Nội quái) theo Bát Quái Tiên Thiên (1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn)
                  và định Hào Động (1-6) để xuất hiện Quẻ Biến.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Thượng Quái Selector */}
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <label className="text-[11px] text-amber-300 font-semibold block">
                      Thượng Quái (1-8)
                    </label>
                    <select
                      value={upperTrigramNum}
                      onChange={(e) => setUpperTrigramNum(Number(e.target.value))}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-amber-200"
                    >
                      {MAI_HOA_TRIGRAMS.map((t) => (
                        <option key={t.num} value={t.num}>
                          {t.num}. {t.name} {t.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hạ Quái Selector */}
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <label className="text-[11px] text-amber-300 font-semibold block">
                      Hạ Quái (1-8)
                    </label>
                    <select
                      value={lowerTrigramNum}
                      onChange={(e) => setLowerTrigramNum(Number(e.target.value))}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-amber-200"
                    >
                      {MAI_HOA_TRIGRAMS.map((t) => (
                        <option key={t.num} value={t.num}>
                          {t.num}. {t.name} {t.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hào Động Selector */}
                  <div className="p-3 rounded-xl glass-card space-y-1.5">
                    <label className="text-[11px] text-amber-300 font-semibold block">
                      Hào Động (1-6)
                    </label>
                    <select
                      value={movingLineNum}
                      onChange={(e) => setMovingLineNum(Number(e.target.value))}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-amber-200"
                    >
                      {[1, 2, 3, 4, 5, 6].map((line) => (
                        <option key={line} value={line}>
                          Hào {line} {line === 1 ? "(Sơ hào)" : line === 6 ? "(Thượng hào)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCastMaiHoa(upperTrigramNum, lowerTrigramNum, movingLineNum)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm font-cinzel flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Lập Quẻ Theo Số Đã Chọn
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCastMaiHoa()}
                    className="py-3 px-4 rounded-xl glass-card hover:bg-white/10 text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Khởi Quẻ Mai Hoa Ngẫu Nhiên
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: Tra Cứu Trực Tiếp 64 Quẻ */}
            {castMode === "select" && (
              <div className="space-y-3 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên quẻ, số quẻ (1-64) hoặc ý nghĩa..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {filteredHexagrams.slice(0, 15).map((hex) => (
                    <div
                      key={hex.id}
                      onClick={() => handleSelectHexagram(hex, 0)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        currentHexagram?.id === hex.id
                          ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center">
                          {hex.number}
                        </span>
                        <div>
                          <div className="font-semibold text-amber-200">
                            {hex.name} <span className="text-[10px] text-slate-400 font-normal">({hex.chineseName})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[240px]">
                            {hex.upperTrigram} / {hex.lowerTrigram} • {hex.meaning}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400/60" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6 Hexagram Lines Visualizer (Rendered from Line 6 down to Line 1) */}
            {tossHistory.length > 0 && (
              <div className="rounded-xl glass-card p-4 space-y-2 mt-3">
                <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1 border-b border-white/10">
                  <span>Hào (Từ Sơ hào lên Thượng hào):</span>
                  <span>Âm Dương / Hào Động</span>
                </div>

                <div className="flex flex-col-reverse gap-2">
                  {tossHistory.map((val, idx) => {
                    const isYang = val % 2 === 1;
                    const isChanging = val === 6 || val === 9;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400 w-14 shrink-0">
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
                          className={`text-[10px] font-semibold w-28 text-right ${
                            isChanging
                              ? "text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30"
                              : "text-slate-400"
                          }`}
                        >
                          {val === 9
                            ? "Lão Dương ◯ (Động)"
                            : val === 6
                            ? "Lão Âm ✕ (Động)"
                            : isYang
                            ? "Thiếu Dương ⚊"
                            : "Thiếu Âm ⚋"}
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
              {/* Primary Hexagram Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="inline-flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                    {currentHexagram.number}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Quẻ Chủ (Bản Quái)
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold font-cinzel text-amber-100">
                      {currentHexagram.name}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 block font-mono">
                    Quẻ {currentHexagram.number}/64
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block font-serif">
                    {currentHexagram.chineseName}
                  </span>
                </div>
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
                  <strong className="text-amber-300 font-semibold">Ý nghĩa cốt lõi: </strong>
                  {currentHexagram.meaning}
                </p>
                <p>
                  <strong className="text-amber-300 font-semibold">Lời Thoán (Thoán Từ): </strong>
                  <span className="italic text-amber-100">{currentHexagram.judgment}</span>
                </p>
                {currentHexagram.image && (
                  <p>
                    <strong className="text-amber-300 font-semibold">Tượng Quẻ (Đại Tượng): </strong>
                    <span className="italic text-slate-300">{currentHexagram.image}</span>
                  </p>
                )}
              </div>

              {/* Relating Hexagram Card (Quẻ Biến nếu có hào động) */}
              {relatingHexagram ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 via-amber-950/20 to-black/30 border border-amber-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-rose-400" />
                      Quẻ Biến (Chi Quái): {relatingHexagram.name} (Quẻ {relatingHexagram.number}/64)
                    </span>
                    <span className="text-[10px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/20">
                      Hào động: {changingLines.map((l) => `Hào ${l}`).join(", ")}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong className="text-amber-200">Xu hướng biến dịch: </strong>
                    {relatingHexagram.meaning} (Thượng {relatingHexagram.upperTrigram} {relatingHexagram.upperTrigramSymbol} • Hạ {relatingHexagram.lowerTrigram} {relatingHexagram.lowerTrigramSymbol}).
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 text-center">
                  Quẻ định tịnh (không có hào động biến). Thế cục ổn định, lấy tĩnh chế động.
                </div>
              )}

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
            /* Placeholder when waiting for casting */
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
                    ? "Hãy điền câu hỏi ở Bước 1 và chọn cách gieo quẻ (3 Đồng Tiền, Mai Hoa Dịch Số hoặc Tra cứu 64 Quẻ). Thông tin Quẻ Chủ, Quẻ Biến và danh ngôn sẽ hiển thị tại đây."
                    : "Tiếp tục hoàn tất để xác lập quẻ Thượng - Hạ và hào động biến dịch tương ứng."}
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
