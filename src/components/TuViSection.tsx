import React, { useState, useEffect, useRef } from "react";
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
  UploadCloud,
  Cloud,
} from "lucide-react";
import { TU_VI_ASPECTS } from "../data/tuViData";
import { TuViAspect, UserProfile, AstrologicalProfile } from "../types";
import { ImageUpload } from "./ImageUpload";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ConsultationChat } from "./ConsultationChat";
import { saveHistoryItem, isUserLoggedIn } from "../utils/historyStorage";
import { updateUserAstroProfile, saveStoredUser } from "./AuthModal";
import { auth, getAccessToken } from "../firebase";
import { saveAstroChartToFirestore, saveUserProfileToFirestore } from "../utils/firebaseSync";
import { uploadAstroChartToDrive } from "../utils/googleDriveService";
import { motion, AnimatePresence } from "motion/react";

interface TuViSectionProps {
  onSavedToHistory?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onUpdateUser?: (user: UserProfile | null) => void;
}

export const TuViSection: React.FC<TuViSectionProps> = ({
  onSavedToHistory,
  currentUser,
  onOpenAuth,
  onUpdateUser,
}) => {
  const [selectedAspect, setSelectedAspect] = useState<TuViAspect>(TU_VI_ASPECTS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    TU_VI_ASPECTS[0].suggestions[0]
  );
  const [customQuestion, setCustomQuestion] = useState<string>("");

  // Optional user details (guest / member)
  const [name, setName] = useState<string>("");

  // Image upload state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Interpretation result & state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [cloudSavedMsg, setCloudSavedMsg] = useState<string | null>(null);

  // Auto-fill from user profile if available
  useEffect(() => {
    if (currentUser?.astroProfile?.fullName && !name) {
      setName(currentUser.astroProfile.fullName);
    } else if (currentUser?.name && !name) {
      setName(currentUser.name);
    }
    if (currentUser?.astroProfile?.tuViImageUrl && !imageBase64) {
      setImageBase64(currentUser.astroProfile.tuViImageUrl);
    }
  }, [currentUser]);

  const handleSaveChartToCloud = async () => {
    if (!imageBase64) return;
    setIsSavingToCloud(true);
    setCloudSavedMsg(null);
    try {
      const chartName = name.trim() || currentUser?.name || "Bạn Tri Kỷ";

      // 1. Save to Firestore
      if (auth.currentUser) {
        await saveAstroChartToFirestore(auth.currentUser.uid, {
          id: "chart_tu_vi_current",
          userId: auth.currentUser.uid,
          type: "tu-vi",
          title: `Lá Số Tử Vi - ${chartName}`,
          fullName: chartName,
          chartImageUrl: imageBase64,
          notes: `Lá số tử vi cho khía cạnh ${selectedAspect.title}`,
          updatedAt: Date.now(),
        });
      }

      // 2. Save to Google Drive if connected
      const driveToken = getAccessToken();
      if (driveToken) {
        await uploadAstroChartToDrive(driveToken, {
          type: "tu-vi",
          fullName: chartName,
          chartImageUrl: imageBase64,
          notes: `Lá số tử vi cho khía cạnh ${selectedAspect.title}`,
        });
      }

      // 3. Update user profile
      if (currentUser && onUpdateUser) {
        const updatedUser: UserProfile = {
          ...currentUser,
          astroProfile: {
            ...(currentUser.astroProfile || {
              fullName: chartName,
              birthDate: "",
              birthHour: "Tý (23h - 1h)",
              calendarType: "solar",
              gender: "Khác",
              birthPlace: "",
              sunSign: "Bạch Dương",
              moonSign: "Bạch Dương",
              risingSign: "Bạch Dương",
            }),
            tuViImageUrl: imageBase64,
          },
        };
        saveStoredUser(updatedUser);
        onUpdateUser(updatedUser);
        if (auth.currentUser) {
          saveUserProfileToFirestore(updatedUser).catch(console.warn);
        }
      }

      setCloudSavedMsg("Đã lưu lá số lên Firebase & Google Drive!");
      setTimeout(() => setCloudSavedMsg(null), 3500);
    } catch (err: any) {
      setCloudSavedMsg(`Lưu thất bại: ${err?.message || "Lỗi lưu trữ"}`);
      setTimeout(() => setCloudSavedMsg(null), 3500);
    } finally {
      setIsSavingToCloud(false);
    }
  };

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
        name: name.trim() || currentUser?.name || "Bạn",
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

      // Save to local history only if logged in, including image
      const saved = saveHistoryItem({
        type: "tu-vi",
        title: `Tử Vi - ${selectedAspect.title}`,
        aspectOrSpread: selectedAspect.title,
        question: customQuestion || selectedQuestion || selectedAspect.title,
        resultMarkdown: data.reading,
        meta: {
          aspect: selectedAspect.title,
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
      {/* Lightbox Modal for Chart Image */}
      {isImageModalOpen && imageBase64 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 text-amber-200">
              <div className="flex items-center gap-2 font-cinzel font-semibold text-sm">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span>Ảnh Lá Số Tử Vi Của Bạn</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={imageBase64}
                  download="la-so-tu-vi.png"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                alt="Lá Số Tử Vi Phóng To"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

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
            Lập lá số trực tuyến tại khung chuyên dụng bên dưới, chụp hoặc tải ảnh lá số để được
            luận giải chi tiết thiên bàn, địa bàn, 12 cung vị, các sao chiếu mệnh và vận hạn chuẩn xác.
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

          {/* Ô Tạo Lá Số Tử Vi (Chuyển sang trang web ngoài trong tab mới) */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 space-y-4 border border-amber-500/40 shadow-xl bg-gradient-to-br from-amber-500/10 via-black/40 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel tracking-wide flex items-center gap-2">
                    Tạo Lá Số Tử Vi Trực Tuyến
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Nhấn vào nút bên dưới để chuyển sang trang web tạo lá số Tử Vi chuẩn xác. Sau khi an sao lập lá số xong, bạn chỉ cần <strong>chụp ảnh màn hình</strong> hoặc <strong>lưu ảnh lá số</strong> rồi tải lên ở Bước 3.
                  </p>
                </div>
              </div>

              <a
                href="https://tuvi.cohoc.net/lap-la-so-tu-vi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/40 hover:to-amber-600/40 text-amber-200 border border-amber-400/50 hover:border-amber-300 text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-amber-500/20 shrink-0 group"
              >
                <span>Tạo Lá Số Tại Đây</span>
                <ExternalLink className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Guide Steps */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-100 space-y-1.5 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quy trình 3 bước tiện lợi:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                <li>Bấm nút <strong>"Tạo Lá Số Tại Đây"</strong> ở trên để mở trang lập lá số trong tab mới.</li>
                <li>Nhập ngày giờ sinh, bấm Lập Lá Số và <strong>chụp ảnh màn hình</strong> lá số Tử Vi.</li>
                <li>Quay lại đây và <strong>tải ảnh lá số</strong> vào khung bên dưới để AI luận giải 12 cung vị!</li>
              </ol>
            </div>
          </div>

          {/* Form Image Upload & Submit Action */}
          <form onSubmit={handleInterpret} className="rounded-2xl glass-panel p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <h2 className="text-xs sm:text-sm font-semibold text-amber-300 font-cinzel flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Bước 3: Tải Lên Ảnh Lá Số Vừa Tạo
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

            {/* Image upload area */}
            <ImageUpload
              label="Tải Lên Ảnh Lá Số Tử Vi (Khuyên Dùng Để AI Phân Tích Toàn Diện)"
              sublabel="Tải ảnh lá số vừa tạo ở trên (JPG, PNG). AI sẽ đọc kỹ từng cung vị, chính tinh, tuần triệt."
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
                  <span>Đã nạp ảnh lá số tử vi</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveChartToCloud}
                    disabled={isSavingToCloud}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isSavingToCloud ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>Lưu lên Firebase / Drive</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem ảnh phóng to
                  </button>
                  <a
                    href={imageBase64}
                    download="la-so-tu-vi.png"
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Lưu ảnh lá số về máy
                  </a>
                </div>
              </div>
            )}

            {cloudSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{cloudSavedMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base font-cinzel tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 backdrop-blur-md cursor-pointer"
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
                      Đang an sao & phân tích tinh bàn cùng bạn...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Đang xem xét thế đứng Tam Hợp, Xung Chiếu và hóa khí các cung vị để chia sẻ lời khuyên thấu đáo nhất cùng bạn.
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

                  {/* Attached Chart Image Preview in Result */}
                  {imageBase64 && (
                    <div className="p-3 rounded-xl glass-card border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <FileImage className="w-3.5 h-3.5" />
                          Lá số tử vi đã phân tích:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Phóng to
                          </button>
                          <a
                            href={imageBase64}
                            download="la-so-tu-vi.png"
                            className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Lưu ảnh
                          </a>
                        </div>
                      </div>
                      <img
                        src={imageBase64}
                        alt="Lá Số Tử Vi"
                        className="w-full max-h-48 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setIsImageModalOpen(true)}
                      />
                    </div>
                  )}

                  {/* Rendered Markdown */}
                  <div className="leading-relaxed">
                    <MarkdownRenderer content={readingResult} />
                  </div>

                  {/* Master Follow-up Interactive Consultation */}
                  <ConsultationChat
                    discipline="tu-vi"
                    masterTitle="Người Bạn Đồng Hành Tử Vi"
                    masterSubtitle="Cùng trò chuyện sâu hơn về các cung vị, thời vận và kế hoạch sắp tới"
                    contextSummary={`Luận giải Tử Vi cho bạn ${name || "bạn thân"}, khía cạnh ${selectedAspect.title}, câu hỏi: ${customQuestion || selectedQuestion}`}
                    initialMessagePlaceholder="Tâm sự thêm về cung hạn, sao chiếu hoặc cách vượt qua thử thách..."
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
                      Vui lòng tạo lá số ở khung trên, tải ảnh lên và nhấn "Khởi Động Luận Giải Tử Vi" để bắt đầu cùng bạn phân tích lá số.
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

