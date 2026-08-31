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
} from "lucide-react";
import { getHistory, deleteHistoryItem, clearAllHistory } from "../utils/historyStorage";
import { HistoryItem } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface HistorySectionProps {
  onSelectType?: (type: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich") => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onSelectType }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = () => {
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bản luận giải này khỏi lịch sử?")) {
      deleteHistoryItem(id);
      loadData();
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem không?")) {
      clearAllHistory();
      loadData();
      setSelectedItem(null);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `huyen_co_quan_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyDetail = () => {
    if (!selectedItem) return;
    navigator.clipboard.writeText(
      `# ${selectedItem.title}\n\n**Câu hỏi**: ${selectedItem.question}\n**Thời gian**: ${new Date(
        selectedItem.timestamp
      ).toLocaleString("vi-VN")}\n\n---\n\n${selectedItem.resultMarkdown}`
    );
    setCopied(true);
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
      {/* Top Banner */}
      <div className="rounded-2xl glass-panel-gold p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2.5 shadow-sm backdrop-blur-md">
            <History className="w-3.5 h-3.5" />
            Lưu Trữ Tự Động • Xem Lại Mọi Lúc
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-playfair text-amber-200">
            Lịch Sử Luận Giải Đã Lưu ({historyItems.length})
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Toàn bộ các lần luận giải Tử Vi, Bản Đồ Sao, Tarot và Kinh Dịch của bạn được lưu an toàn trên trình duyệt này.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-2">
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
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors backdrop-blur-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

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
        <div className="rounded-2xl glass-panel p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-7 h-7 text-amber-400/50" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            {historyItems.length === 0
              ? "Bạn chưa có bản luận giải nào được lưu"
              : "Không tìm thấy kết quả phù hợp với bộ lọc"}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sau khi thực hiện luận giải Tử Vi, Bản Đồ Sao, Tarot hoặc Kinh Dịch, kết quả sẽ tự động
            được lưu tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="rounded-xl glass-card hover:border-amber-400/50 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-lg hover:shadow-amber-500/10 relative"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${getTypeBadge(
                      item.type
                    )}`}
                  >
                    {getTypeIcon(item.type)}
                    {item.type.toUpperCase()}
                  </span>
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
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-amber-400 group-hover:underline font-medium flex items-center gap-1 text-[11px]">
                  Xem chi tiết <ExternalLink className="w-3 h-3" />
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                  title="Xóa bản ghi này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
                    {selectedItem.meta?.hasImage && (
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

              {selectedItem.meta?.hexagram?.quote && (
                <div className="p-3 rounded-xl glass-card text-xs italic text-amber-200 border-amber-400/30">
                  "{selectedItem.meta.hexagram.quote.text}" — <strong>{selectedItem.meta.hexagram.quote.author}</strong>
                </div>
              )}

              {/* Markdown Content */}
              <div className="text-xs sm:text-sm leading-relaxed">
                <MarkdownRenderer content={selectedItem.resultMarkdown} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-white/10 bg-black/40 flex justify-end backdrop-blur-md">
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
    </div>
  );
};
