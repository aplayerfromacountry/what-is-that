import React, { useState, useEffect } from "react";
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
  User,
  LogIn,
  BookmarkCheck,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  Eye,
  X,
  FileImage,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem, isUserLoggedIn } from "../utils/historyStorage";
import { updateUserAstroProfile } from "./AuthModal";
import { UserProfile, AstrologicalProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NatalChartSectionProps {
  onSavedToHistory?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onUpdateUser?: (user: UserProfile | null) => void;
}

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

export const NatalChartSection: React.FC<NatalChartSectionProps> = ({
  onSavedToHistory,
  currentUser,
  onOpenAuth,
  onUpdateUser,
}) => {
  const [name, setName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(FOCUS_TOPICS[0]);
  const [userQuestion, setUserQuestion] = useState("");

  // Image Upload
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    if (currentUser?.astroProfile?.fullName && !name) {
      setName(currentUser.astroProfile.fullName);
    } else if (currentUser?.name && !name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSaved(false);

    try {
      const payload = {
        name: name.trim() || currentUser?.name || "Bạn",
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
        throw new Error(data.error || "Không thể giải mã bản đồ sao lúc này.");
      }

      setReadingResult(data.reading);

      // Save to local history only if logged in, including image
      const saved = saveHistoryItem({
        type: "natal-chart",
        title: `Bản Đồ Sao - ${selectedTopic.title}`,
        aspectOrSpread: selectedTopic.title,
        question: userQuestion || selectedTopic.title,
        resultMarkdown: data.reading,
        meta: {
          aspect: selectedTopic.title,
          hasImage: !!imageBase64,
          imageUrl: imageBase64 || undefined,
        },
      });

      if (saved) {
        setHasSaved(true);
        if (onSavedToHistory) onSavedToHistory();
      }
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
      {/* Lightbox Modal for Chart Image */}
      {isImageModalOpen && imageBase64 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 text-amber-200">
              <div className="flex items-center gap-2 font-cinzel font-semibold text-sm">
                <FileImage className="w-4 h-4 text-indigo-400" />
                <span>Ảnh Bản Đồ Sao Của Bạn</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={imageBase64}
                  download="ban-do-sao.png"
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Ảnh Về Máy
                </a>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh] rounded-xl border border-white/20 shadow-2xl bg-[#090b10]">
              <img
                src={imageBase64}
                alt="Bản Đồ Sao Phóng To"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

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
            Lập biểu đồ sao tại khung bên dưới, lưu ảnh và tải lên để AI phân tích cấu trúc hành tinh, 12 nhà và góc chiếu.
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

          {/* Ô Tạo Bản Đồ Sao Trực Tuyến (Chuyển sang trang web ngoài trong tab mới) */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 space-y-4 border border-indigo-500/40 shadow-xl bg-gradient-to-br from-indigo-500/10 via-black/40 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel tracking-wide flex items-center gap-2">
                    Tạo Bản Đồ Sao Trực Tuyến (Astro.com)
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Nhấn vào nút bên dưới để chuyển sang cổng tính toán Astro.com chuẩn quốc tế. Sau khi tạo biểu đồ sao xong, bạn chỉ cần <strong>chụp ảnh màn hình</strong> hoặc <strong>lưu ảnh biểu đồ tròn (Natal Chart Wheel)</strong> rồi tải lên ở Bước 2.
                  </p>
                </div>
              </div>

              <a
                href="https://www.astro.com/cgi/chart.cgi?btyp=w2gw&usechpref=1&rs=2&lang=e"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-600/30 hover:from-indigo-500/40 hover:to-purple-600/40 text-indigo-200 border border-indigo-400/50 hover:border-indigo-300 text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20 shrink-0 group"
              >
                <span>Tạo Bản Đồ Sao Tại Đây</span>
                <ExternalLink className="w-4 h-4 text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Guide Steps */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-100 space-y-1.5 leading-relaxed">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quy trình 3 bước tiện lợi:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                <li>Bấm nút <strong>"Tạo Bản Đồ Sao Tại Đây"</strong> ở trên để mở trang Astro.com trong tab mới.</li>
                <li>Nhập ngày giờ sinh, địa điểm và <strong>chụp ảnh màn hình biểu đồ tròn (Natal Chart Wheel)</strong>.</li>
                <li>Quay lại đây và <strong>tải ảnh biểu đồ sao</strong> vào khung bên dưới để AI luận giải chi tiết!</li>
              </ol>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl glass-panel p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                Bước 2: Tải Lên Ảnh Bản Đồ Sao Vừa Tạo
              </h2>

              {/* Optional Name */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tên bạn:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="glass-input rounded-lg px-2.5 py-1 text-xs text-slate-200 w-36"
                />
              </div>
            </div>

            {/* Image upload */}
            <ImageUpload
              label="Tải Lên Ảnh Biểu Đồ Sao (Khuyên Dùng Để Đọc Toàn Diện Hành Tinh)"
              sublabel="Tải ảnh biểu đồ bánh xe sao vừa tạo ở trên (JPG, PNG). AI sẽ phân tích chính xác từng độ góc và 12 cung nhà."
              imagePreview={imageBase64}
              onImageChange={(b64, mime) => {
                setImageBase64(b64);
                setImageMimeType(mime);
              }}
            />

            {/* If image is uploaded, offer quick download & zoom buttons */}
            {imageBase64 && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã nạp ảnh bản đồ sao</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem ảnh phóng to
                  </button>
                  <a
                    href={imageBase64}
                    download="ban-do-sao.png"
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Lưu ảnh bản đồ sao về máy
                  </a>
                </div>
              </div>
            )}

            {/* Additional Question */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Câu hỏi thêm hoặc thắc mắc riêng về lá số chiêm tinh:
              </label>
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ví dụ: Tôi muốn hỏi về vị trí sao Kim và cách hóa giải góc chiếu bất lợi trong năm nay..."
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 hover:from-indigo-400 hover:to-amber-400 text-white font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
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
                      Đang cùng bạn giải mã cấu trúc năng lượng, góc hợp và 12 cung Nhà để khai mở tiềm năng bản thân.
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

                  {/* Attached Chart Image Preview in Result */}
                  {imageBase64 && (
                    <div className="p-3 rounded-xl glass-card border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                          <FileImage className="w-3.5 h-3.5" />
                          Bản đồ sao đã phân tích:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="text-[11px] text-indigo-300 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Phóng to
                          </button>
                          <a
                            href={imageBase64}
                            download="ban-do-sao.png"
                            className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Lưu ảnh
                          </a>
                        </div>
                      </div>
                      <img
                        src={imageBase64}
                        alt="Bản Đồ Sao"
                        className="w-full max-h-48 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setIsImageModalOpen(true)}
                      />
                    </div>
                  )}

                  <MarkdownRenderer content={readingResult} />

                  {/* Follow up Consultation Chat */}
                  <ConsultationChat
                    discipline="natal-chart"
                    masterTitle="Người Bạn Chiêm Tinh Học"
                    masterSubtitle="Cùng khám phá sâu hơn về góc chiếu hành tinh, 12 cung Nhà và tiềm năng bản thân"
                    contextSummary={`Bản đồ sao cho bạn ${name || "bạn thân"}, chủ đề ${selectedTopic.title}, câu hỏi: ${userQuestion || "Không có"}`}
                    initialMessagePlaceholder="Hỏi thêm về góc chiếu, sao nghịch hành hoặc định hướng bản thân..."
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
                      Vui lòng tạo bản đồ sao ở khung trên, tải ảnh lên và nhấn "Khởi Động Giải Mã Bản Đồ Sao" để bắt đầu hành trình chiêm bái các vì sao.
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
