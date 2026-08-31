import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  label: string;
  sublabel?: string;
  imagePreview: string | null;
  onImageChange: (base64: string | null, mimeType: string | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  sublabel = "Kéo thả hoặc bấm để tải ảnh lá số / biểu đồ (JPG, PNG, WEBP - Tối đa 15MB)",
  imagePreview,
  onImageChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng tải lên định dạng hình ảnh hợp lệ (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Kích thước tệp quá lớn. Vui lòng chọn ảnh dưới 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageChange(result, file.type);
    };
    reader.onerror = () => {
      setErrorMsg("Không thể đọc tệp ảnh. Vui lòng thử lại.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-300">
        <span className="flex items-center gap-1.5 text-amber-300">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          {label}
        </span>
        {imagePreview && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Xóa ảnh
          </button>
        )}
      </div>

      {imagePreview ? (
        <div className="relative rounded-xl overflow-hidden border border-white/15 glass-card group">
          <div className="max-h-64 sm:max-h-80 w-full flex items-center justify-center bg-black/40 backdrop-blur-md overflow-hidden">
            <img
              src={imagePreview}
              alt="Uploaded chart preview"
              className="max-h-64 sm:max-h-80 object-contain w-full transition-transform duration-300 group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-2.5 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              ✓ Đã nhận diện ảnh lá số / biểu đồ
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
            >
              Đổi ảnh khác
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-4 sm:p-6 transition-all duration-200 flex flex-col items-center justify-center text-center backdrop-blur-md ${
            isDragging
              ? "border-amber-400 bg-amber-500/15 scale-[0.99]"
              : "border-white/15 hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.05]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2.5 shadow-sm backdrop-blur-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            Tải ảnh lá số để AI quan sát chính tinh & cung vị
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-sm">
            {sublabel}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
