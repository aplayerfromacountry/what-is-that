import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Droplets,
  Feather,
  Trash2,
  Calendar,
  CloudCheck,
  RefreshCw,
  Heart,
  Flame,
  Wind,
  Quote,
  Check,
  Copy,
  ChevronRight,
  Info,
  Sun,
  Moon,
  Sparkle,
  Compass,
  Send,
  Zap,
} from "lucide-react";
import {
  PlantDiaryEntry,
  PlantTreeType,
  UserPlantGardenState,
  UserProfile,
} from "../types";
import {
  calculateTreeLevel,
} from "../data/plantTrees";
import {
  getPlantGarden,
  syncPlantGardenFromServer,
  addPlantActionEntry,
  deletePlantDiaryEntry,
} from "../utils/plantDiaryStorage";

interface PlantDiarySectionProps {
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

// Curated Affirmations & Manifestations for Good Things
const MANIFEST_CATEGORIES = [
  {
    category: "Bình An & Chữa Lành",
    icon: Heart,
    color: "text-rose-300 border-rose-500/30 bg-rose-500/10",
    suggestions: [
      "Tôi chọn bình an trong từng nhịp thở, tâm trí tôi thảnh thơi và ngập tràn tình thương.",
      "Tôi bao dung cho chính mình và mở lòng đón nhận những điều lành đang đến.",
      "Mỗi ngày trôi qua, thân tâm tôi đều được hồi phục, tươi mới và an yên.",
    ],
  },
  {
    category: "Tài Lộc & Hanh Thông",
    icon: Sparkles,
    color: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    suggestions: [
      "Dòng chảy tài lộc, may mắn và những cơ hội quý giá luôn tự nhiên tìm đến với tôi.",
      "Mọi dự định và công việc của tôi đều hanh thông, gặt hái kết quả rực rỡ vượt mong đợi.",
      "Trí tuệ và trực giác của tôi luôn sắc bén, sáng suốt trong mọi lựa chọn quan trọng.",
    ],
  },
  {
    category: "Nhân Duyên & Yêu Thương",
    icon: Sun,
    color: "text-pink-300 border-pink-500/30 bg-pink-500/10",
    suggestions: [
      "Tôi thu hút những nhân duyên chân thành, nâng đỡ và mang lại niềm vui cho nhau.",
      "Trái tim tôi tràn đầy sự ấm áp, yêu thương bản thân trọn vẹn và lan tỏa năng lượng tích cực.",
      "Mọi mối quan hệ quanh tôi đều ngày càng gắn kết, thấu hiểu và hòa thuận.",
    ],
  },
  {
    category: "Tự Tin & Khai Mở",
    icon: Zap,
    color: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
    suggestions: [
      "Tôi tin tưởng vào con đường mình đang đi, tôi đủ dũng khí để vượt qua mọi thử thách.",
      "Vũ trụ đang sắp đặt mọi điều tốt đẹp nhất để bảo bọc và nâng bước tôi mỗi ngày.",
      "Tôi xứng đáng được hạnh phúc, tự do và sống một cuộc đời trọn vẹn ý nghĩa.",
    ],
  },
];

// Curated Releasing & Letting Go Prompts for Negative Thoughts / Sorrows
const RELEASE_CATEGORIES = [
  {
    category: "Áp Lực & Mệt Mỏi",
    icon: Wind,
    color: "text-purple-300 border-purple-500/30 bg-purple-500/10",
    suggestions: [
      "Tôi trút bỏ áp lực công việc và những gánh nặng đè nặng trên vai hôm nay...",
      "Tôi cho phép bản thân được nghỉ ngơi, buông lỏng cơ thể và thả lỏng tâm trí...",
      "Tôi ngừng đòi hỏi mọi thứ phải hoàn hảo ngay lập tức, từng bước một là đủ tốt rồi...",
    ],
  },
  {
    category: "Tổn Thương & Ấm Ức",
    icon: Feather,
    color: "text-indigo-300 border-indigo-500/30 bg-indigo-500/10",
    suggestions: [
      "Tôi tha thứ cho những điều không như ý và chọn buông bỏ những lời nói làm tổn thương tôi...",
      "Tôi không còn giữ chặt những ấm ức trong lòng, xin gửi lại cho gió cuốn đi...",
      "Tôi trả lại sự bình yên cho trái tim, không để nỗi buồn của quá khứ trói buộc hiện tại...",
    ],
  },
  {
    category: "Nỗi Sợ & Bất An",
    icon: Flame,
    color: "text-violet-300 border-violet-500/30 bg-violet-500/10",
    suggestions: [
      "Tôi hóa giải nỗi sợ hãi về tương lai và những điều chưa xảy ra...",
      "Tôi buông bỏ cảm giác lo âu về tài chính, công việc hay những bất định ngoài tầm kiểm soát...",
      "Tôi chấp nhận những điều không thể thay đổi và tập trung vào giây phút hiện tại...",
    ],
  },
  {
    category: "Tự Trách & Kỳ Vọng",
    icon: Moon,
    color: "text-slate-300 border-slate-500/30 bg-slate-500/10",
    suggestions: [
      "Tôi ngừng tự phán xét và ngừng so sánh bản thân với bất kỳ ai khác...",
      "Tôi buông bỏ cảm giác day dứt về những sai lầm đã qua, đó là bài học để tôi trưởng thành...",
      "Tôi giải phóng bản thân khỏi áp lực phải làm vừa lòng tất cả mọi người...",
    ],
  },
];

const TRANQUILITY_LEVELS = [
  { level: 1, title: "Tâm Khởi An", desc: "Bắt đầu quán chiếu thân tâm, nhận diện những vui buồn và gieo mầm bình an." },
  { level: 2, title: "Tâm Tĩnh Lặng", desc: "Sóng gió lắng dịu, những muộn phiền dần hóa giải thành sự sáng suốt." },
  { level: 3, title: "Tâm Thanh Khiết", desc: "Tâm thức sáng trong như mặt hồ phẳng lặng, đón nhận ánh sáng trí tuệ." },
  { level: 4, title: "Tâm Hỷ Lạc", desc: "An vui tự tại, tràn đầy lòng biết ơn và tần số rung động tích cực." },
  { level: 5, title: "Đại Giác An Nhiên", desc: "Hòa nhịp cùng dòng chảy vũ trụ, tâm không vướng bận, vạn sự hanh thông." },
];

export const PlantDiarySection: React.FC<PlantDiarySectionProps> = ({
  currentUser,
  onOpenAuth,
}) => {
  const [garden, setGarden] = useState<UserPlantGardenState>(getPlantGarden());
  const [filterType, setFilterType] = useState<"all" | "water" | "weed">("all");

  // Inputs
  const [manifestInput, setManifestInput] = useState("");
  const [sorrowInput, setSorrowInput] = useState("");

  // Animation states
  const [isManifestingAnim, setIsManifestingAnim] = useState(false);
  const [isReleasingAnim, setIsReleasingAnim] = useState(false);
  const [recentlyTendedToast, setRecentlyTendedToast] = useState<{
    type: "water" | "weed";
    message: string;
    detail: string;
    exp: number;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Level data
  const levelData = calculateTreeLevel(garden.totalExp);
  const currentLvlConfig =
    TRANQUILITY_LEVELS.find((l) => l.level === levelData.level) || TRANQUILITY_LEVELS[0];

  // Sync with server on mount or user login change
  useEffect(() => {
    syncPlantGardenFromServer(currentUser?.email || currentUser?.id).then(
      (latest) => {
        setGarden(latest);
      }
    );
  }, [currentUser]);

  // Handle Manifest Good Things (Water action)
  const handleManifestSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manifestInput.trim()) return;

    setIsManifestingAnim(true);
    const textToSave = manifestInput.trim();
    setManifestInput("");

    // Spiritual wisdom response
    const blessings = [
      "Vũ trụ đã lắng nghe ước nguyện chân thành của bạn. Năng lượng tốt lành đang được nuôi dưỡng và phản hồi trở lại cuộc sống của bạn.",
      "Lời khẳng định tích cực của bạn vừa tỏa ra một trường năng lượng ấm áp. Hãy mỉm cười và đón nhận sự an lành trong từng bước đi.",
      "Tâm tưởng sinh vạn sự. Niềm tin thiện lành hôm nay chính là hoa thơm trái ngọt của ngày mai.",
      "Ánh sáng và tình thương đang bao bọc lấy ước vọng của bạn. Hãy kiên định và an nhiên bước tiếp.",
    ];
    const wisdom = blessings[Math.floor(Math.random() * blessings.length)];

    const result = await addPlantActionEntry("water", textToSave, wisdom);
    setGarden(result.garden);

    setRecentlyTendedToast({
      type: "water",
      message: "Đã gửi lời manifest tốt lành vào vũ trụ!",
      detail: "+15 Điểm An Lạc • Ước nguyện đã được lưu vào sổ tịnh hóa",
      exp: 15,
    });

    setTimeout(() => {
      setIsManifestingAnim(false);
    }, 2400);

    setTimeout(() => {
      setRecentlyTendedToast(null);
    }, 5500);
  };

  // Handle Release Sorrows / Bad Thoughts (Weed action)
  const handleReleaseSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sorrowInput.trim()) return;

    setIsReleasingAnim(true);
    const textToSave = sorrowInput.trim();
    setSorrowInput("");

    // Gentle letting go wisdom
    const consolations = [
      "Những phiền muộn và áp lực đã được hóa giải thành khói mây, tan biến vào hư không. Trái tim bạn giờ đây được trả lại sự nhẹ nhõm.",
      "Bạn đã can đảm gọi tên nỗi buồn và trút bỏ nó. Gánh nặng rời khỏi vai bạn, nhường chỗ cho sự an bình và sáng suốt.",
      "Mọi ấm ức hay tổn thương hôm nay chỉ là một áng mây thoảng qua. Bầu trời nội tâm của bạn luôn trong xanh và tự do.",
      "Xin gửi lại quá khứ cho hư không. Giây phút hiện tại này là món quà tươi mới dành riêng cho bạn.",
    ];
    const wisdom = consolations[Math.floor(Math.random() * consolations.length)];

    const result = await addPlantActionEntry("weed", textToSave, wisdom);
    setGarden(result.garden);

    setRecentlyTendedToast({
      type: "weed",
      message: "Đã xả bỏ nỗi niềm thành công!",
      detail: "+10 Điểm An Lạc • Mọi âu lo đã tan biến vào hư không",
      exp: 10,
    });

    setTimeout(() => {
      setIsReleasingAnim(false);
    }, 2400);

    setTimeout(() => {
      setRecentlyTendedToast(null);
    }, 5500);
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    const updated = deletePlantDiaryEntry(id);
    setGarden(updated);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = garden.entries.filter((entry) => {
    if (filterType === "water") return entry.type === "water";
    if (filterType === "weed") return entry.type === "weed";
    return true;
  });

  return (
    <div className="space-y-6 w-full relative">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel p-5 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl">
        {/* Ambient atmospheric ethereal glows (NO TREE) */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-600/15 via-indigo-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Feather className="w-3.5 h-3.5 text-purple-400" />
              <span>Không Gian Tịnh Hóa • An Định Thân Tâm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-200 to-cyan-200">
              Nơi Xả Bỏ Nỗi Niềm
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Góc tĩnh lặng để bạn trút hết những <strong>gánh nặng, âu lo, phiền muộn</strong> vào cõi hư không; đồng thời gửi gắm những <strong>lời manifest tốt lành</strong> để thu hút may mắn, bình an và năng lượng tích cực cho tâm hồn.
            </p>
          </div>

          {/* Sync & User status badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            {currentUser?.isLoggedIn ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-sm">
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                <span>Sao lưu an toàn ({currentUser.email || currentUser.name})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                title="Đăng nhập để đồng bộ qua các thiết bị"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Lưu trên trình duyệt • Đăng nhập để sao lưu đám mây</span>
              </button>
            )}
          </div>
        </div>

        {/* Breathing / Mindfulness gentle pacing prompt */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
            <span className="text-slate-300 font-medium">
              Thở vào tâm tĩnh lặng • Thở ra miệng mỉm cười • Buông bỏ mọi âu lo
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-amber-300/80">✨ Manifest: +15 EXP</span>
            <span className="text-purple-300/80">🪶 Xả Muộn: +10 EXP</span>
          </div>
        </div>
      </div>

      {/* Overview Stats & Tranquility Level Banner */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 bg-gradient-to-r from-slate-900/60 via-purple-950/20 to-slate-900/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Cảnh Giới Tịnh Hóa
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40">
                  Cấp {levelData.level}/5: {currentLvlConfig.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-light">
                {currentLvlConfig.desc}
              </p>
            </div>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] text-cyan-300 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Manifest</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {garden.waterCount} lần
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] text-purple-300 font-medium flex items-center justify-center gap-1">
                <Feather className="w-3 h-3" />
                <span>Xả Bỏ</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {garden.weedCount} lần
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] text-amber-300 font-medium flex items-center justify-center gap-1">
                <Heart className="w-3 h-3" />
                <span>An Lạc</span>
              </div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {garden.totalExp} EXP
              </div>
            </div>
          </div>
        </div>

        {/* EXP Progress Bar */}
        <div className="w-full mt-3 pt-3 border-t border-white/5 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Tiến độ cảnh giới tiếp theo</span>
            <span className="text-amber-300 font-semibold">
              {levelData.currentLevelExp} / {levelData.expForNextLevel} EXP ({levelData.percent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelData.percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-amber-400 to-cyan-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* TWO PRIMARY INTERACTIVE SANCTUARY PILLARS (MANIFEST vs RELEASE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ======================================================== */}
        {/* PILLAR 1: MANIFEST ĐIỀU TỐT ĐẸP (Golden / Cyan Glow)   */}
        {/* ======================================================== */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-amber-400/30 hover:border-amber-400/60 transition-all shadow-xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-cyan-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-cinzel text-slate-100 group-hover:text-amber-200 transition-colors">
                  Manifest Điều Tốt Đẹp
                </h2>
                <p className="text-xs text-amber-300/80">
                  Gieo mầm hy vọng, biết ơn & sự trù phú (+15 EXP)
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Thu Hút Cát Tường
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-light relative z-10">
            Viết ra những ước nguyện chân thành, lời chúc phúc hoặc lời khẳng định tích cực. Năng lượng bạn phát ra sẽ hòa nhịp cùng vũ trụ để kiến tạo những điều kỳ diệu.
          </p>

          {/* Interactive Form */}
          <form onSubmit={handleManifestSubmit} className="space-y-3 relative z-10">
            <div className="relative">
              <textarea
                rows={3}
                value={manifestInput}
                onChange={(e) => setManifestInput(e.target.value)}
                placeholder="Viết lời manifest của bạn... (Ví dụ: Tôi đón nhận sự bình an, tình yêu thương và mọi cơ hội hanh thông đang chảy tràn vào cuộc sống của tôi...)"
                className="w-full p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed transition-all"
              />
            </div>

            {/* Quick Inspiration Categories & Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1">
                <Sparkle className="w-3 h-3" />
                Gợi ý manifest nhanh:
              </span>
              <div className="space-y-2">
                {MANIFEST_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <cat.icon className="w-3 h-3 text-amber-400" />
                      <span>{cat.category}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setManifestInput(sug)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-amber-500/20 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 text-slate-300 text-left transition-all cursor-pointer line-clamp-1 max-w-full"
                          title={sug}
                        >
                          "{sug.slice(0, 48)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!manifestInput.trim() || isManifestingAnim}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Lời Manifest Vào Vũ Trụ (+15 EXP)</span>
            </button>
          </form>

          {/* Active Manifesting Animation Overlay */}
          <AnimatePresence>
            {isManifestingAnim && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20"
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.6)] mb-3"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <h4 className="text-base font-bold font-cinzel text-amber-200">
                  Đang Hòa Nhập Với Tần Số Vũ Trụ...
                </h4>
                <p className="text-xs text-amber-100/80 mt-1 max-w-xs">
                  Lời nguyện ước của bạn đang tỏa sáng rực rỡ, thu hút những năng lượng an lành và may mắn nhất.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ======================================================== */}
        {/* PILLAR 2: XẢ BỎ NỖI NIỀM & ĐIỀU XẤU (Purple / Violet)   */}
        {/* ======================================================== */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all shadow-xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 via-violet-500/15 to-indigo-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg group-hover:scale-105 transition-transform">
                <Feather className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-cinzel text-slate-100 group-hover:text-purple-200 transition-colors">
                  Xả Bỏ Nỗi Niềm & Điều Xấu
                </h2>
                <p className="text-xs text-purple-300/80">
                  Thanh tẩy gánh nặng tâm lý & buông xả muộn phiền (+10 EXP)
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Tịnh Hóa Tâm Thức
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-light relative z-10">
            Viết ra tất cả những bực bội, tổn thương, áp lực hay sợ hãi đang đè nặng trong lòng bạn. Khi nhấn nút buông bỏ, con chữ sẽ tan biến vào hư không, trả lại cho bạn sự an thản.
          </p>

          {/* Interactive Form */}
          <form onSubmit={handleReleaseSubmit} className="space-y-3 relative z-10">
            <div className="relative">
              <textarea
                rows={3}
                value={sorrowInput}
                onChange={(e) => setSorrowInput(e.target.value)}
                placeholder="Trút bỏ nỗi niềm của bạn vào đây... (Ví dụ: Tôi đang cảm thấy mệt mỏi và lo lắng về những việc xảy ra hôm nay, tôi xin gửi lại tất cả cho hư không để tâm trí được nhẹ nhõm...)"
                className="w-full p-3.5 rounded-2xl bg-black/50 border border-purple-500/30 focus:border-purple-400 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none leading-relaxed transition-all"
              />
            </div>

            {/* Quick Inspiration Categories & Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-purple-300/90 font-medium flex items-center gap-1">
                <Wind className="w-3 h-3" />
                Gợi ý buông bỏ gánh nặng:
              </span>
              <div className="space-y-2">
                {RELEASE_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <cat.icon className="w-3 h-3 text-purple-400" />
                      <span>{cat.category}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSorrowInput(sug)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 hover:text-purple-200 border border-white/10 hover:border-purple-400/40 text-slate-300 text-left transition-all cursor-pointer line-clamp-1 max-w-full"
                          title={sug}
                        >
                          "{sug.slice(0, 48)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!sorrowInput.trim() || isReleasingAnim}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Feather className="w-4 h-4" />
              <span>Hóa Giải & Thả Trôi Vào Hư Không (+10 EXP)</span>
            </button>
          </form>

          {/* Active Dissolving / Burning Animation Overlay */}
          <AnimatePresence>
            {isReleasingAnim && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20"
              >
                <motion.div
                  animate={{ y: [0, -15, 0], scale: [1, 1.2, 0.9] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-purple-400/20 border border-purple-300 flex items-center justify-center text-purple-300 shadow-[0_0_35px_rgba(192,132,252,0.6)] mb-3"
                >
                  <Wind className="w-8 h-8" />
                </motion.div>
                <h4 className="text-base font-bold font-cinzel text-purple-200">
                  Đang Hóa Giải & Tan Vào Hư Không...
                </h4>
                <p className="text-xs text-purple-100/80 mt-1 max-w-xs">
                  Mọi âu lo và phiền muộn đã tan biến như bọt nước. Trái tim bạn trở về với sự tự tại và tĩnh lặng thuần khiết.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Toast notification */}
      <AnimatePresence>
        {recentlyTendedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel-gold border border-amber-400/50 shadow-2xl flex items-center gap-3 max-w-md bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              {recentlyTendedToast.type === "water" ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Feather className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-200">
                {recentlyTendedToast.message}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {recentlyTendedToast.detail}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SỔ NHẬT KÝ TỊNH HÓA (DIARY LOG BOOK - ALL SAVED ENTRIES) */}
      {/* ======================================================== */}
      <div className="rounded-3xl glass-panel p-5 sm:p-7 border border-white/10 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-cinzel text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Sổ Nhật Ký Xả Bỏ & Manifest</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hành trình ghi nhận những lời manifest tốt lành và những muộn phiền đã buông bỏ ({garden.entries.length} mục)
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === "all"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tất Cả ({garden.entries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("water")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterType === "water"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Lời Manifest ({garden.waterCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("weed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterType === "weed"
                  ? "bg-purple-500/20 text-purple-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Feather className="w-3 h-3" />
              <span>Xả Muộn ({garden.weedCount})</span>
            </button>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
              <Feather className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-slate-300 font-cinzel">
                Chưa có trang nhật ký nào
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hãy bắt đầu gửi gắm một lời manifest tốt đẹp, hoặc trút bỏ một điều phiền muộn đang đè nặng trong lòng lên hai khung ở trên.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEntries.map((entry) => {
              const isManifest = entry.type === "water";
              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isManifest
                      ? "bg-amber-950/15 border-amber-500/25 hover:border-amber-500/40"
                      : "bg-purple-950/20 border-purple-500/25 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isManifest
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                        }`}
                      >
                        {isManifest ? (
                          <Sparkles className="w-3.5 h-3.5" />
                        ) : (
                          <Feather className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isManifest ? "text-amber-300" : "text-purple-300"
                        }`}
                      >
                        {isManifest ? "Lời Manifest Điều Lành" : "Nỗi Niềm Đã Xả Bỏ"}
                      </span>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {isManifest ? "+15 EXP" : "+10 EXP"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {entry.dateStr}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(entry.content, entry.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Sao chép nội dung"
                      >
                        {copiedId === entry.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Xóa dòng nhật ký này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pl-9 space-y-2">
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
                      "{entry.content}"
                    </p>

                    {entry.wisdomMessage && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2 text-[11px] text-amber-200/90 italic">
                        <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{entry.wisdomMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
