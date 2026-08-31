import React, { useState } from "react";
import {
  UserCheck,
  Briefcase,
  HeartHandshake,
  Globe,
  ShieldAlert,
  Hourglass,
  HelpCircle,
  Sparkles,
  Send,
  Save,
  Check,
  RefreshCw,
  Copy,
  ChevronRight,
  BookOpen,
  Compass,
} from "lucide-react";
import { TU_VI_ASPECTS } from "../data/tuViData";
import { TuViAspect } from "../types";
import { ImageUpload } from "./ImageUpload";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem } from "../utils/historyStorage";
import { motion } from "motion/react";

interface TuViSectionProps {
  onSavedToHistory?: () => void;
}

export const TuViSection: React.FC<TuViSectionProps> = ({ onSavedToHistory }) => {
  const [selectedAspect, setSelectedAspect] = useState<TuViAspect>(TU_VI_ASPECTS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    TU_VI_ASPECTS[0].suggestions[0]
  );
  const [customQuestion, setCustomQuestion] = useState<string>("");

  // User details
  const [name, setName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [birthHour, setBirthHour] = useState<string>("Giờ Thìn (07h - 09h)");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");

  // Image upload state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // Interpretation result & state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const getAspectIcon = (iconName: string) => {
    switch (iconName) {
      case "UserCheck":
        return <UserCheck className="w-5 h-5" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-5 h-5" />;
      case "Globe":
        return <Globe className="w-5 h-5" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-5 h-5" />;
      case "Hourglass":
        return <Hourglass className="w-5 h-5" />;
      case "HelpCircle":
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const handleSelectAspect = (aspect: TuViAspect) => {
    setSelectedAspect(aspect);
    setSelectedQuestion(aspect.suggestions[0] || "");
    setHasSaved(false);
  };

  const handleInterpret = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      const payload = {
        name,
        birthDate,
        birthHour,
        calendarType,
        gender,
        aspectTitle: selectedAspect.title,
        selectedQuestion,
        customQuestion,
        imageBase64,
        imageMimeType,
      };

      const res = await fetch("/api/tu-vi/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể luận giải lá số lúc này.");
      }

      setReadingResult(data.reading);

      // Auto save to local history
      saveHistoryItem({
        type: "tu-vi",
        title: `Tử Vi - ${selectedAspect.title}`,
        aspectOrSpread: selectedAspect.title,
        question: customQuestion || selectedQuestion || selectedAspect.title,
        resultMarkdown: data.reading,
        meta: {
          aspect: selectedAspect.title,
          hasImage: !!imageBase64,
        },
      });
      setHasSaved(true);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố khi kết nối luận giải.");
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
    <div id="tu-vi-section" className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 relative overflow-hidden backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Tử Vi Đẩu Số Chuyên Sâu • Đàm Đạo Uyên Thâm
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-playfair text-amber-200 tracking-wide">
            Luận Giải Lá Số Tử Vi Theo 7 Khía Cạnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Chọn 1 trong 7 khía cạnh cuộc đời, chọn câu hỏi gợi ý hoặc tải lên ảnh lá số sẵn có
            để được luận giải chi tiết thiên bàn, địa bàn, các cung vị và vận hạn chuẩn xác.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Controls & 7 Aspects, Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form & Aspect Selection Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 7 Aspects Grid */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Bước 1: Chọn 1 Trong 7 Khía Cạnh Cần Soi Chiếu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TU_VI_ASPECTS.map((aspect) => {
                const isSelected = selectedAspect.id === aspect.id;
                return (
                  <button
                    key={aspect.id}
                    type="button"
                    onClick={() => handleSelectAspect(aspect)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 group relative backdrop-blur-md ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                        : "glass-card text-slate-300 hover:border-amber-400/40"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors backdrop-blur-sm ${
                        isSelected
                          ? "bg-amber-500/25 text-amber-300 border border-amber-400/40"
                          : "bg-white/5 text-slate-400 group-hover:text-amber-300 group-hover:bg-white/10"
                      }`}
                    >
                      {getAspectIcon(aspect.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-amber-200 line-clamp-1">
                        {aspect.title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                        {aspect.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI 5 Suggestions for Selected Aspect */}
          <div className="rounded-2xl glass-panel p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Bước 2: Gợi Ý 5 Câu Hỏi Trọng Tâm Cho "{selectedAspect.title}"
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Nhấp vào một trong 5 câu hỏi được đúc kết dưới đây hoặc tự điền câu hỏi ở khung bên dưới:
            </p>

            <div className="space-y-2">
              {selectedAspect.suggestions.map((sug, idx) => {
                const isPicked = selectedQuestion === sug;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(sug);
                      setCustomQuestion("");
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 backdrop-blur-md ${
                      isPicked
                        ? "bg-amber-500/20 border-amber-400/60 text-amber-200 font-medium shadow-sm"
                        : "glass-card text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        {idx + 1}
                      </span>
                      <span>{sug}</span>
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isPicked ? "text-amber-400 translate-x-0.5" : "text-slate-500"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Custom Question input */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hoặc tự đặt thêm câu hỏi / ghi chú riêng:
              </label>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ví dụ: Tôi muốn hỏi thêm về thời điểm thuận lợi để chuyển việc vào cuối năm nay..."
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Form Birth Details & Image Upload */}
          <form onSubmit={handleInterpret} className="rounded-2xl glass-panel p-4 sm:p-5 space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Bước 3: Thông Tin Bản Mệnh & Tải Ảnh Lá Số (Nếu Có)
            </h2>

            {/* Image upload area */}
            <ImageUpload
              label="Tải Lên Ảnh Lá Số Tử Vi (Khuyên Dùng Để AI Phân Tích Chuẩn Xác)"
              sublabel="Chụp hoặc tải ảnh lá số từ các trang lập lá số (JPG, PNG). AI sẽ đọc kỹ từng cung vị, chính tinh, tuần triệt."
              imagePreview={imageBase64}
              onImageChange={(b64, mime) => {
                setImageBase64(b64);
                setImageMimeType(mime);
              }}
            />

            {/* Birth Details Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Giới Tính:</label>
                <div className="flex gap-2">
                  {(["Nam", "Nữ", "Khác"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all backdrop-blur-md ${
                        gender === g
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                          : "glass-card text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Ngày Sinh ({calendarType === "solar" ? "Dương Lịch" : "Âm Lịch"}):
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="flex-1 glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                  />
                  <select
                    value={calendarType}
                    onChange={(e) => setCalendarType(e.target.value as "solar" | "lunar")}
                    className="glass-input rounded-lg px-2 py-2 text-xs text-slate-300"
                  >
                    <option value="solar" className="bg-[#0f172a] text-slate-200">Dương</option>
                    <option value="lunar" className="bg-[#0f172a] text-slate-200">Âm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Giờ Sinh (12 Canh Giờ):</label>
                <select
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                >
                  <option value="Giờ Tý (23h - 01h)" className="bg-[#0f172a] text-slate-200">Giờ Tý (23h - 01h)</option>
                  <option value="Giờ Sửu (01h - 03h)" className="bg-[#0f172a] text-slate-200">Giờ Sửu (01h - 03h)</option>
                  <option value="Giờ Dần (03h - 05h)" className="bg-[#0f172a] text-slate-200">Giờ Dần (03h - 05h)</option>
                  <option value="Giờ Mão (05h - 07h)" className="bg-[#0f172a] text-slate-200">Giờ Mão (05h - 07h)</option>
                  <option value="Giờ Thìn (07h - 09h)" className="bg-[#0f172a] text-slate-200">Giờ Thìn (07h - 09h)</option>
                  <option value="Giờ Tỵ (09h - 11h)" className="bg-[#0f172a] text-slate-200">Giờ Tỵ (09h - 11h)</option>
                  <option value="Giờ Ngọ (11h - 13h)" className="bg-[#0f172a] text-slate-200">Giờ Ngọ (11h - 13h)</option>
                  <option value="Giờ Mùi (13h - 15h)" className="bg-[#0f172a] text-slate-200">Giờ Mùi (13h - 15h)</option>
                  <option value="Giờ Thân (15h - 17h)" className="bg-[#0f172a] text-slate-200">Giờ Thân (15h - 17h)</option>
                  <option value="Giờ Dậu (17h - 19h)" className="bg-[#0f172a] text-slate-200">Giờ Dậu (17h - 19h)</option>
                  <option value="Giờ Tuất (19h - 21h)" className="bg-[#0f172a] text-slate-200">Giờ Tuất (19h - 21h)</option>
                  <option value="Giờ Hợi (21h - 23h)" className="bg-[#0f172a] text-slate-200">Giờ Hợi (21h - 23h)</option>
                  <option value="Chưa rõ giờ sinh" className="bg-[#0f172a] text-slate-200">Chưa rõ giờ sinh</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 backdrop-blur-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang quan sát thiên bàn & luận giải...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Khởi Động Luận Giải Tử Vi
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Interpretation Reading Column (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl glass-panel-gold p-5 flex-1 flex flex-col shadow-xl min-h-[480px]">
            {/* Header of reading */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-amber-400/30 flex items-center justify-center text-amber-400 backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200">
                    Bản Luận Giải Tử Vi
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedAspect.title}</p>
                </div>
              </div>

              {readingResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                    title="Sao chép kết quả"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{copied ? "Đã chép" : "Chép"}</span>
                  </button>
                  {hasSaved && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <Save className="w-3 h-3" /> Đã lưu lịch sử
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <Compass className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-cinzel text-sm font-semibold text-amber-300">
                      Đang an sao & quán chiếu tinh bàn...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Bậc thầy đang xem xét thế đứng Tam Hợp, Xung Chiếu và hóa khí các cung vị để đưa ra lời
                      khuyên thấu đáo nhất.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <p className="font-semibold">Chưa thể hoàn tất luận giải:</p>
                  <p>{error}</p>
                </div>
              ) : readingResult ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Selected Question Header tag */}
                  <div className="p-3 rounded-xl glass-card text-xs text-amber-200 border-amber-400/30">
                    <span className="font-semibold text-amber-300">Chủ đề chiêm nghiệm: </span>
                    {customQuestion || selectedQuestion}
                  </div>

                  {/* Rendered Markdown */}
                  <div className="leading-relaxed">
                    <MarkdownRenderer content={readingResult} />
                  </div>

                  {/* Master Follow-up Interactive Consultation */}
                  <ConsultationChat
                    discipline="tu-vi"
                    masterTitle="Thầy Tử Vi Đẩu Số Tiền Bối"
                    masterSubtitle="Đàm đạo sâu hơn về các cung vị, đại vận và thế đứng lá số"
                    contextSummary={`Luận giải Tử Vi cho đương số ${name || "Gia chủ"}, khía cạnh ${selectedAspect.title}, câu hỏi: ${customQuestion || selectedQuestion}`}
                    initialMessagePlaceholder="Hỏi thêm Thầy về cung hạn, sao chiếu hoặc cách hóa giải..."
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500">
                    <BookOpen className="w-7 h-7 text-amber-500/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-300">
                      Chưa có dữ liệu luận giải
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Vui lòng chọn khía cạnh, câu hỏi và nhấn "Khởi Động Luận Giải Tử Vi" để Thầy tiến hành
                      quán chiếu lá số.
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
