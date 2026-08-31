import React, { useState } from "react";
import {
  Star,
  Sparkles,
  Send,
  Save,
  Check,
  RefreshCw,
  Copy,
  Compass,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem } from "../utils/historyStorage";
import { motion } from "motion/react";

interface NatalChartSectionProps {
  onSavedToHistory?: () => void;
}

const ZODIAC_SIGNS = [
  "Bạch Dương (Aries ♈)",
  "Kim Ngưu (Taurus ♉)",
  "Song Tử (Gemini ♊)",
  "Cự Giải (Cancer ♋)",
  "Sư Tử (Leo ♌)",
  "Xử Nữ (Virgo ♍)",
  "Thiên Bình (Libra ♎)",
  "Bọ Cạp (Scorpio ♏)",
  "Nhân Mã (Sagittarius ♐)",
  "Ma Kết (Capricorn ♑)",
  "Bảo Bình (Aquarius ♒)",
  "Song Ngư (Pisces ♓)",
  "Chưa rõ / Tự động phân tích",
];

const FOCUS_TOPICS = [
  {
    id: "big-three",
    title: "Bộ Ba Cốt Lõi (Sun - Moon - Rising)",
    desc: "Bản ngã ý thức, thế giới cảm xúc nội tâm và diện mạo xã hội.",
    icon: Star,
  },
  {
    id: "career-mc",
    title: "Sự Nghiệp & Thiên Đỉnh (Midheaven - House 10)",
    desc: "Đỉnh cao danh vọng, sứ mệnh xã hội và lĩnh vực thành công rực rỡ nhất.",
    icon: Compass,
  },
  {
    id: "love-venus",
    title: "Tình Yêu & Tương Thích (Venus & Mars - House 7)",
    desc: "Cách bạn yêu, hình mẫu bạn đời lý tưởng và bài học kết nối tình cảm.",
    icon: Flame,
  },
  {
    id: "soul-nodes",
    title: "Bài Học Nghiệp Quả & Sứ Mệnh (North & South Node)",
    desc: "Vùng an toàn kiếp trước cần vượt qua và hướng tiến hóa linh hồn kiếp này.",
    icon: Wind,
  },
];

export const NatalChartSection: React.FC<NatalChartSectionProps> = ({ onSavedToHistory }) => {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("Hà Nội, Việt Nam");
  const [sunSign, setSunSign] = useState(ZODIAC_SIGNS[12]);
  const [moonSign, setMoonSign] = useState(ZODIAC_SIGNS[12]);
  const [risingSign, setRisingSign] = useState(ZODIAC_SIGNS[12]);

  const [selectedTopic, setSelectedTopic] = useState(FOCUS_TOPICS[0]);
  const [userQuestion, setUserQuestion] = useState("");

  // Image Upload
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      const payload = {
        name,
        birthDate,
        birthTime,
        birthPlace,
        sunSign,
        moonSign,
        risingSign,
        focusTopic: selectedTopic.title,
        userQuestion: userQuestion || `Phân tích sâu về ${selectedTopic.title}`,
        imageBase64,
        imageMimeType,
      };

      const res = await fetch("/api/natal-chart/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể giải mã bản đồ sao.");
      }

      setReadingResult(data.reading);

      // Auto save
      saveHistoryItem({
        type: "natal-chart",
        title: `Bản Đồ Sao - ${selectedTopic.title}`,
        aspectOrSpread: selectedTopic.title,
        question: userQuestion || selectedTopic.title,
        resultMarkdown: data.reading,
        meta: {
          aspect: selectedTopic.title,
          hasImage: !!imageBase64,
        },
      });
      setHasSaved(true);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố khi kết nối chiêm tinh.");
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
    <div id="natal-chart-section" className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <Star className="w-3.5 h-3.5" />
            Chiêm Tinh Học Phương Tây • Western Astrology
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-playfair text-amber-200 tracking-wide">
            Giải Mã Bản Đồ Sao Cá Nhân (Natal Chart)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Khám phá tấm bản đồ tâm hồn được vũ trụ khắc họa vào khoảnh khắc bạn cất tiếng khóc chào đời.
            Tải lên biểu đồ sao hoặc nhập thông tin sinh để được phân tích cấu trúc hành tinh, nhà và góc chiếu.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Topic Selectors */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Bước 1: Chọn Chủ Đề Trọng Tâm Cần Phân Tích
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FOCUS_TOPICS.map((topic) => {
                const Icon = topic.icon;
                const isSelected = selectedTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 backdrop-blur-md ${
                      isSelected
                        ? "bg-indigo-500/20 border-indigo-400/60 text-amber-200 ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-500/10"
                        : "glass-card text-slate-300 hover:border-indigo-400/40"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 backdrop-blur-sm ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          : "bg-white/5 text-slate-400 group-hover:text-amber-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-1">
                        {topic.title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                        {topic.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl glass-panel p-4 sm:p-5 space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Bước 2: Tải Lên Ảnh Biểu Đồ Sao Hoặc Nhập Thông Tin Sinh
            </h2>

            {/* Image upload */}
            <ImageUpload
              label="Tải Ảnh Bản Đồ Sao (Natal Chart Wheel) Để AI Nhận Diện Góc Chiếu & Cung Vị"
              sublabel="Tải ảnh biểu đồ sao từ Astro.com, Astro-Seek hoặc ứng dụng chiêm tinh của bạn (JPG, PNG)."
              imagePreview={imageBase64}
              onImageChange={(b64, mime) => {
                setImageBase64(b64);
                setImageMimeType(mime);
              }}
            />

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tên hoặc Biệt danh:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Alex"
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nơi Sinh (Thành phố, Quốc gia):</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="TP. Hồ Chí Minh, Việt Nam"
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Ngày Sinh (Dương Lịch):</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Giờ Sinh Chính Xác:</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs sm:text-sm"
                />
              </div>

              {/* Big 3 optional dropdowns */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cung Mặt Trời (Sun Sign):</label>
                <select
                  value={sunSign}
                  onChange={(e) => setSunSign(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {ZODIAC_SIGNS.map((s, i) => (
                    <option key={i} value={s} className="bg-[#0f172a] text-slate-200">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cung Mặt Trăng (Moon Sign):</label>
                <select
                  value={moonSign}
                  onChange={(e) => setMoonSign(e.target.value)}
                  className="w-full glass-input rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {ZODIAC_SIGNS.map((s, i) => (
                    <option key={i} value={s} className="bg-[#0f172a] text-slate-200">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Input */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Câu hỏi hoặc mong muốn cụ thể từ bản đồ sao:
              </label>
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ví dụ: Tôi muốn hiểu rõ tiềm năng tài chính và các thời điểm chuyển biến sự nghiệp qua góc chiếu của sao Mộc..."
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 backdrop-blur-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang soi chiếu vị trí các hành tinh...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Khởi Động Giải Mã Bản Đồ Sao
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl glass-panel-gold p-5 flex-1 flex flex-col shadow-xl min-h-[480px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-indigo-400/30 flex items-center justify-center text-indigo-400 backdrop-blur-md">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200">
                    Bản Luận Giải Chiêm Tinh
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedTopic.title}</p>
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
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                    <Star className="w-7 h-7 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-cinzel text-sm font-semibold text-amber-300">
                      Đang quan sát thiên cầu & góc chiếu hành tinh...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Nhà Chiêm Tinh Học đang giải mã cấu trúc năng lượng, góc hợp và 12 cung Nhà để khai mở bản ngã.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <p className="font-semibold">Lỗi chiêm tinh:</p>
                  <p>{error}</p>
                </div>
              ) : readingResult ? (
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  <div className="p-3 rounded-xl glass-card text-xs text-indigo-200 border-indigo-400/30">
                    <span className="font-semibold text-indigo-300">Trọng tâm giải mã: </span>
                    {userQuestion || selectedTopic.title}
                  </div>
                  <MarkdownRenderer content={readingResult} />

                  {/* Follow up Consultation Chat */}
                  <ConsultationChat
                    discipline="natal-chart"
                    masterTitle="Nhà Chiêm Tinh Học"
                    masterSubtitle="Đàm đạo sâu hơn về góc chiếu hành tinh, 12 cung Nhà và bài học linh hồn"
                    contextSummary={`Bản đồ sao cho ${name || "Bạn"}, chủ đề ${selectedTopic.title}, câu hỏi: ${userQuestion || "Không có"}`}
                    initialMessagePlaceholder="Hỏi nhà chiêm tinh về góc chiếu, sao nghịch hành hoặc tiến hóa linh hồn..."
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500">
                    <Star className="w-7 h-7 text-indigo-400/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-300">
                      Chưa có dữ liệu bản đồ sao
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Vui lòng nhập thông tin sinh hoặc tải ảnh biểu đồ để bắt đầu hành trình chiêm bái các vì sao.
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
