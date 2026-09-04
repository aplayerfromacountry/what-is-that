import React, { useState, useEffect } from "react";
import {
  History,
  Trash2,
  Search,
  Calendar,
  Compass,
  Star,
  Sparkles,
  Layers,
  ExternalLink,
  X,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Eye,
  FileImage,
  Cloud,
  RefreshCw,
} from "lucide-react";
import {
  getHistory,
  deleteHistoryItem,
  deleteMultipleHistoryItems,
  clearAllHistory,
  syncUserHistoryFromServer,
  isUserLoggedIn,
} from "../utils/historyStorage";
import { HistoryItem, UserProfile } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface HistorySectionProps {
  onSelectType?: (type: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich") => void;
  onHistoryChanged?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  onSelectType,
  onHistoryChanged,
  currentUser,
  onOpenAuth,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewingFullImage, setViewingFullImage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Selection mode
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    mode: "single" | "selected" | "all";
    targetId?: string;
    targetTitle?: string;
  }>({
    isOpen: false,
    mode: "all",
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadData = async (syncWithServer: boolean = false) => {
    const data = getHistory();
    setHistoryItems(data);
    if (onHistoryChanged) onHistoryChanged();

    const userKey = currentUser?.email || currentUser?.id;
    if (syncWithServer && userKey) {
      setIsSyncing(true);
      try {
        const synced = await syncUserHistoryFromServer(userKey);
        setHistoryItems(synced);
        if (onHistoryChanged) onHistoryChanged();
      } catch (err) {
        console.warn("History sync error:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);
  }, [currentUser?.email, currentUser?.id]);

  const handleManualSync = async () => {
    const userKey = currentUser?.email || currentUser?.id;
    if (!userKey) {
      showToast("Vui lòng đăng nhập để đồng bộ hóa với đám mây!");
      return;
    }
    setIsSyncing(true);
    try {
      const synced = await syncUserHistoryFromServer(userKey);
      setHistoryItems(synced);
      if (onHistoryChanged) onHistoryChanged();
      showToast("Đã đồng bộ hóa lịch sử đám mây thành công!");
    } catch (err) {
      showToast("Lỗi khi đồng bộ lịch sử đám mây.");
    } finally {
      setIsSyncing(false);
    }
  };

  const openDeleteSingleConfirm = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      mode: "single",
      targetId: id,
      targetTitle: title,
    });
  };

  const openDeleteSelectedConfirm = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      mode: "selected",
    });
  };

  const openClearAllConfirm = () => {
    if (historyItems.length === 0) return;
    setConfirmModal({
      isOpen: true,
      mode: "all",
    });
  };

  const handleExecuteDelete = () => {
    if (confirmModal.mode === "single" && confirmModal.targetId) {
      deleteHistoryItem(confirmModal.targetId);
      if (selectedItem?.id === confirmModal.targetId) {
        setSelectedItem(null);
      }
      setSelectedIds((prev) => prev.filter((id) => id !== confirmModal.targetId));
      showToast("Đã xóa bản luận giải khỏi lịch sử.");
    } else if (confirmModal.mode === "selected") {
      deleteMultipleHistoryItems(selectedIds);
      if (selectedItem && selectedIds.includes(selectedItem.id)) {
        setSelectedItem(null);
      }
      showToast(`Đã xóa ${selectedIds.length} bản ghi đã chọn.`);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } else if (confirmModal.mode === "all") {
      clearAllHistory();
      setSelectedItem(null);
      setSelectedIds([]);
      setIsSelectionMode(false);
      showToast("Đã xóa sạch toàn bộ lịch sử xem.");
    }

    setConfirmModal({ isOpen: false, mode: "all" });
    loadData();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `a_private_place_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Đã xuất dữ liệu lịch sử thành công.");
  };

  const handleCopyDetail = () => {
    if (!selectedItem) return;
    navigator.clipboard.writeText(
      `# ${selectedItem.title}\n\n**Câu hỏi**: ${selectedItem.question}\n**Thời gian**: ${new Date(
        selectedItem.timestamp
      ).toLocaleString("vi-VN")}\n\n---\n\n${selectedItem.resultMarkdown}`
    );
    setCopied(true);
    showToast("Đã sao chép nội dung luận giải.");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredItems = historyItems.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;
    const matchKw =
      !searchKeyword ||
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.resultMarkdown.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchType && matchKw;
  });

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const currentFilteredIds = filteredItems.map((item) => item.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tu-vi":
        return <Compass className="w-4 h-4 text-amber-400" />;
      case "natal-chart":
        return <Star className="w-4 h-4 text-indigo-400" />;
      case "tarot":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "kinh-dich":
        return <Layers className="w-4 h-4 text-yellow-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "tu-vi":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "natal-chart":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "tarot":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "kinh-dich":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-700";
    }
  };

  return (
    <div id="history-section" className="space-y-6">
      {/* Lightbox Modal for Full Image from History */}
      {viewingFullImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 text-amber-200">
              <div className="flex items-center gap-2 font-cinzel font-semibold text-sm">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span>Ảnh Biểu Đồ / Lá Số Đã Lưu</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingFullImage}
                  download="hinh-anh-la-so.png"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Ảnh Về Máy
                </a>
                <button
                  type="button"
                  onClick={() => setViewingFullImage(null)}
                  className="p-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh] rounded-xl border border-white/20 shadow-2xl bg-[#090b10]">
              <img
                src={viewingFullImage}
                alt="Ảnh biểu đồ phóng to"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-md">
              <History className="w-3.5 h-3.5" />
              Lưu Trữ Tự Động • Toàn Quyền Quản Lý & Xóa Lịch Sử
            </div>
            {currentUser && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm backdrop-blur-md">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đồng bộ đám mây</span>
                <span className="text-emerald-400/70 font-mono">({currentUser.email || currentUser.name})</span>
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-playfair text-amber-200">
            Lịch Sử Luận Giải Đã Lưu ({historyItems.length})
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Toàn bộ các lần luận giải Tử Vi, Bản Đồ Sao, Tarot và Kinh Dịch được đồng bộ vĩnh viễn trên đám mây máy chủ và bảo mật riêng tư.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Lấy dữ liệu lịch sử mới nhất từ đám mây máy chủ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-400" : ""}`} />
              {isSyncing ? "Đang đồng bộ..." : "Đồng bộ đám mây"}
            </button>
          )}

          {historyItems.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedIds([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isSelectionMode
                    ? "bg-amber-500/20 text-amber-300 border-amber-400"
                    : "glass-card hover:bg-white/10 text-slate-200 border-white/10"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {isSelectionMode ? "Hủy chọn nhiều" : "Chọn nhiều để xóa"}
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-2 rounded-xl glass-card hover:bg-white/10 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất tệp JSON
              </button>

              <button
                type="button"
                onClick={openClearAllConfirm}
                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors backdrop-blur-md shadow-sm"
                title="Xóa toàn bộ lịch sử xem"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa tất cả
              </button>
            </>
          )}
        </div>
      </div>

      {/* Multi-selection Bar (When active) */}
      {isSelectionMode && historyItems.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-2.5 py-1.5 rounded-lg glass-card hover:bg-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5"
            >
              {filteredItems.length > 0 &&
              filteredItems.every((item) => selectedIds.includes(item.id)) ? (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  Bỏ chọn tất cả
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  Chọn tất cả ({filteredItems.length})
                </>
              )}
            </button>
            <span className="text-xs text-amber-200 font-medium">
              Đã chọn <strong className="text-amber-400">{selectedIds.length}</strong> mục
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={openDeleteSelectedConfirm}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-40 disabled:pointer-events-none text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa {selectedIds.length} mục đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa câu hỏi, nội dung luận giải..."
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Tất cả" },
            { id: "tu-vi", label: "Tử Vi" },
            { id: "natal-chart", label: "Bản Đồ Sao" },
            { id: "tarot", label: "Tarot" },
            { id: "kinh-dich", label: "Kinh Dịch" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap backdrop-blur-md ${
                filterType === tab.id
                  ? "bg-amber-500/20 text-amber-300 border-amber-400 font-semibold shadow-sm"
                  : "glass-card text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl glass-panel p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-7 h-7 text-amber-400/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-semibold text-slate-200">
              {historyItems.length === 0
                ? "Lịch sử xem đang trống"
                : "Không tìm thấy kết quả phù hợp với bộ lọc"}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {historyItems.length === 0 && !currentUser?.isLoggedIn
                ? "Lưu ý: Tính năng lưu trữ và đồng bộ lịch sử xem chỉ áp dụng cho tài khoản đã đăng nhập. Hãy đăng nhập để lưu giữ các bản luận giải của bạn."
                : "Sau khi thực hiện luận giải Tử Vi, Bản Đồ Sao, Tarot hoặc Kinh Dịch, kết quả sẽ được lưu tại đây để bạn có thể xem lại hoặc xóa bất kỳ lúc nào."}
            </p>
          </div>

          {!currentUser?.isLoggedIn && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs font-cinzel shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Đăng Nhập Để Kích Hoạt Lưu Lịch Sử
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelectId(item.id, { stopPropagation: () => {} } as any);
                  } else {
                    setSelectedItem(item);
                  }
                }}
                className={`rounded-xl glass-card p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-lg relative border ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10 shadow-amber-500/10"
                    : "hover:border-amber-400/50 hover:shadow-amber-500/10"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelectionMode && (
                        <button
                          type="button"
                          onClick={(e) => toggleSelectId(item.id, e)}
                          className="p-1 rounded text-amber-400 hover:text-amber-300"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${getTypeBadge(
                          item.type
                        )}`}
                      >
                        {getTypeIcon(item.type)}
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-200 group-hover:text-amber-300 line-clamp-1 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    <strong className="text-amber-300/90">Hỏi: </strong>
                    {item.question}
                  </p>

                  {/* If item has saved imageUrl, render tiny preview thumbnail */}
                  {item.meta?.imageUrl && (
                    <div className="pt-1">
                      <img
                        src={item.meta.imageUrl}
                        alt="Ảnh lá số"
                        className="w-full h-20 object-cover rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-amber-400 group-hover:underline font-medium flex items-center gap-1 text-[11px]">
                    Xem chi tiết <ExternalLink className="w-3 h-3" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => openDeleteSingleConfirm(item.id, item.title, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                    title="Xóa bản ghi này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-2xl glass-panel-gold w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/15">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/5 border border-amber-400/30">
                  {getTypeIcon(selectedItem.type)}
                </div>
                <div>
                  <h3 className="font-bold font-cinzel text-amber-200 text-sm sm:text-base">
                    {selectedItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>
                      {new Date(selectedItem.timestamp).toLocaleString("vi-VN", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                    {(selectedItem.meta?.hasImage || selectedItem.meta?.imageUrl) && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30">
                        Có ảnh đính kèm
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDeleteSingleConfirm(selectedItem.id, selectedItem.title)}
                  className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1.5 transition-colors"
                  title="Xóa bản luận giải này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa bản này</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDetail}
                  className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "Đã sao chép" : "Sao chép"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="p-3.5 rounded-xl glass-card text-xs sm:text-sm text-amber-100 border-amber-400/30">
                <strong className="text-amber-300">Vấn đề / Câu hỏi đã đặt: </strong>
                {selectedItem.question}
              </div>

              {/* Attached Image if exists */}
              {selectedItem.meta?.imageUrl && (
                <div className="p-3 rounded-xl glass-card border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5" />
                      Ảnh biểu đồ / lá số đã lưu:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingFullImage(selectedItem.meta!.imageUrl!)}
                        className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Phóng to
                      </button>
                      <a
                        href={selectedItem.meta.imageUrl}
                        download={`la-so-${selectedItem.id}.png`}
                        className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Tải ảnh về
                      </a>
                    </div>
                  </div>
                  <img
                    src={selectedItem.meta.imageUrl}
                    alt="Ảnh lá số"
                    className="w-full max-h-56 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setViewingFullImage(selectedItem.meta!.imageUrl!)}
                  />
                </div>
              )}

              {/* Cards / Hexagram metadata badges if any */}
              {selectedItem.meta?.cards && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl glass-card">
                  {selectedItem.meta.cards.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-medium backdrop-blur-sm"
                    >
                      {c.position}: <strong>{c.name}</strong> ({c.isReversed ? "Ngược" : "Xuôi"})
                    </span>
                  ))}
                </div>
              )}

              {selectedItem.meta?.hexagram && (
                <div className="p-3 rounded-xl glass-card space-y-2 border-amber-400/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                      Quẻ Chủ: {selectedItem.meta.hexagram.name} (Quẻ {selectedItem.meta.hexagram.number}/64)
                    </span>
                    {selectedItem.meta.hexagram.relatingName && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold">
                        Quẻ Biến: {selectedItem.meta.hexagram.relatingName}
                      </span>
                    )}
                    {selectedItem.meta.hexagram.changingLines && selectedItem.meta.hexagram.changingLines.length > 0 && (
                      <span className="text-[11px] text-amber-300">
                        Động: {selectedItem.meta.hexagram.changingLines.map((l) => `Hào ${l}`).join(", ")}
                      </span>
                    )}
                  </div>
                  {selectedItem.meta.hexagram.quote && (
                    <div className="text-xs italic text-amber-200/90 pt-1 border-t border-white/10">
                      "{selectedItem.meta.hexagram.quote.text}" — <strong>{selectedItem.meta.hexagram.quote.author}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Content */}
              <div className="text-xs sm:text-sm leading-relaxed">
                <MarkdownRenderer content={selectedItem.resultMarkdown} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between backdrop-blur-md">
              <button
                type="button"
                onClick={() => openDeleteSingleConfirm(selectedItem.id, selectedItem.title)}
                className="px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/15 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa khỏi lịch sử
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-200 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-2xl glass-panel-gold w-full max-w-md p-6 space-y-4 shadow-2xl border border-rose-500/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 font-cinzel">
                  {confirmModal.mode === "all" && "Xác nhận xóa toàn bộ lịch sử?"}
                  {confirmModal.mode === "selected" && `Xác nhận xóa ${selectedIds.length} mục đã chọn?`}
                  {confirmModal.mode === "single" && "Xác nhận xóa bản luận giải này?"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {confirmModal.mode === "all" &&
                    "Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu luận giải đã lưu trên trình duyệt của bạn và không thể khôi phục."}
                  {confirmModal.mode === "selected" &&
                    `Bạn có chắc chắn muốn xóa ${selectedIds.length} bản ghi đã được chọn khỏi lịch sử?`}
                  {confirmModal.mode === "single" && (
                    <>
                      Bản ghi: <strong className="text-amber-200">"{confirmModal.targetTitle}"</strong> sẽ bị xóa khỏi lịch sử xem.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, mode: "all" })}
                className="px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

