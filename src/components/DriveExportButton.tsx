import React, { useState } from "react";
import { Cloud, Check, RefreshCw, ExternalLink } from "lucide-react";
import { HistoryItem, UserProfile } from "../types";
import { getAccessToken, googleSignIn } from "../firebase";
import { exportSingleReadingToDrive, DriveFileItem } from "../utils/googleDriveService";

interface DriveExportButtonProps {
  item: {
    type: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich";
    title: string;
    question?: string;
    aspectOrSpread?: string;
    resultMarkdown: string;
    timestamp?: number;
  };
  currentUser?: UserProfile | null;
  className?: string;
  compact?: boolean;
}

export const DriveExportButton: React.FC<DriveExportButtonProps> = ({
  item,
  currentUser,
  className = "",
  compact = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DriveFileItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      let token = getAccessToken();
      if (!token) {
        // Request Google Sign-in with Drive scopes
        const authRes = await googleSignIn();
        token = authRes.accessToken;
      }

      if (!token) {
        throw new Error("Chưa nhận được quyền truy cập Google Drive.");
      }

      const historyItemObj: HistoryItem = {
        id: `reading_${Date.now()}`,
        type: item.type,
        title: item.title,
        question: item.question || "",
        aspectOrSpread: item.aspectOrSpread || "",
        resultMarkdown: item.resultMarkdown,
        timestamp: item.timestamp || Date.now(),
      };

      const result = await exportSingleReadingToDrive(token, historyItemObj, currentUser);
      setUploadedFile(result);
    } catch (err: any) {
      console.error("Export to Drive error:", err);
      setError(err?.message || "Lỗi khi lưu vào Drive");
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  if (uploadedFile) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-lg">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Đã lưu Drive</span>
        </span>
        {uploadedFile.webViewLink && (
          <a
            href={uploadedFile.webViewLink}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 transition-colors"
            title="Mở tài liệu trên Google Drive"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`flex items-center gap-1.5 rounded-lg border transition-all text-xs font-medium ${
          compact
            ? "px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30 text-[11px]"
            : "px-2.5 py-1.5 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 hover:from-blue-500/25 hover:to-indigo-500/25 text-blue-200 border-blue-500/30 hover:border-blue-400/50 shadow-sm"
        } ${className} disabled:opacity-50`}
        title="Lưu bản luận giải vào tài khoản Google Drive của bạn"
      >
        {isExporting ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-300" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
        )}
        <span>{isExporting ? "Đang lưu..." : compact ? "Drive" : "Lưu vào Google Drive"}</span>
      </button>

      {error && (
        <span className="absolute -top-7 left-0 whitespace-nowrap bg-rose-950 border border-rose-500/40 text-rose-200 text-[10px] px-2 py-0.5 rounded shadow-lg z-20">
          {error}
        </span>
      )}
    </div>
  );
};
