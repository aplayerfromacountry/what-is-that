import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  ChevronUp,
  Upload,
  Disc3,
  ListMusic,
  Plus,
  Trash2,
  FileAudio,
  Sparkles,
  CheckCircle2,
  User,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";
import {
  UserTrackItem,
  syncAndGetTracks,
  saveTracksForUser,
  deleteTrackForUser,
  updateTrackDuration,
  clearAllTracksForUser,
} from "../utils/musicStorage";

export interface UserTrack extends UserTrackItem {}

interface MusicPlayerProps {
  currentUser?: UserProfile | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentUser }) => {
  const [playlist, setPlaylist] = useState<UserTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(true);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute active user storage key
  const activeUserId = currentUser?.id || currentUser?.email || "guest_user";
  const userName = currentUser?.name || "Khách";

  // Load persisted tracks whenever active user changes & sync with cloud
  useEffect(() => {
    let isMounted = true;
    const loadUserMusic = async () => {
      setIsLoadingTracks(true);
      try {
        const savedTracks = await syncAndGetTracks(activeUserId, (updatedTracks) => {
          if (isMounted) {
            setPlaylist(updatedTracks);
          }
        });
        if (isMounted) {
          setPlaylist(savedTracks);
          setCurrentTrackIndex(0);
          setCurrentTime(0);
          setDuration(0);
          setIsPlaying(false);
        }
      } catch (err) {
        console.error("Error loading user music:", err);
      } finally {
        if (isMounted) setIsLoadingTracks(false);
      }
    };

    loadUserMusic();

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  const currentTrack = playlist[currentTrackIndex] || null;

  // Handle files selected or dropped
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToUpload: {
      id: string;
      title: string;
      artist: string;
      file: File;
      fileSize: string;
    }[] = [];

    Array.from(files).forEach((file, index) => {
      if (
        file.type.startsWith("audio/") ||
        /\.(mp3|wav|m4a|ogg|aac|flac|webm)$/i.test(file.name)
      ) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + " MB";

        filesToUpload.push({
          id: `track-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
          title: nameWithoutExt,
          artist: currentUser?.name ? `Tải lên bởi ${currentUser.name}` : "Nhạc của bạn",
          file,
          fileSize: sizeFormatted,
        });
      }
    });

    if (filesToUpload.length > 0) {
      try {
        const savedItems = await saveTracksForUser(activeUserId, filesToUpload);
        
        setPlaylist((prev) => {
          const updated = [...prev, ...savedItems];
          if (prev.length === 0) {
            setCurrentTrackIndex(0);
            setIsPlaying(true);
          }
          return updated;
        });

        // Trigger flash notification
        setSaveNotification(`Đã lưu ${filesToUpload.length} bài hát vào tài khoản ${userName}!`);
        setTimeout(() => setSaveNotification(null), 3500);
      } catch (err) {
        console.error("Error saving uploaded tracks to storage:", err);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Next Track
  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Prev Track
  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Select a specific track from playlist
  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowPlaylistDrawer(false);
  };

  // Delete a track from playlist & storage
  const handleDeleteTrack = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteTrackForUser(activeUserId, id);
    } catch (err) {
      console.error("Error deleting track from db:", err);
    }

    setPlaylist((prev) => {
      const idxToDelete = prev.findIndex((t) => t.id === id);
      const filtered = prev.filter((t) => t.id !== id);

      if (filtered.length === 0) {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setCurrentTrackIndex(0);
        return [];
      }

      if (idxToDelete === currentTrackIndex) {
        const nextIdx = idxToDelete >= filtered.length ? 0 : idxToDelete;
        setCurrentTrackIndex(nextIdx);
      } else if (idxToDelete < currentTrackIndex) {
        setCurrentTrackIndex((curr) => curr - 1);
      }

      return filtered;
    });
  };

  // Clear all tracks
  const handleClearAll = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách nhạc đã lưu của tài khoản này?")) {
      await clearAllTracksForUser(activeUserId);
      setPlaylist([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setCurrentTrackIndex(0);
    }
  };

  // Sync audio source when current track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.src;
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, currentTrack?.src]);

  // Sync Volume & Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && currentTrack) {
            const d = audioRef.current.duration;
            setDuration(d);
            if (currentTrack.duration !== d) {
              updateTrackDuration(currentTrack.id, d);
              setPlaylist((prev) =>
                prev.map((t, idx) => (idx === currentTrackIndex ? { ...t, duration: d } : t))
              );
            }
          }
        }}
        onEnded={handleNext}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac,.webm"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Floating Notification for saving music */}
        <AnimatePresence>
          {saveNotification && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -top-12 right-0 bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{saveNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* CASE 1: EMPTY PLAYLIST -> INVITING UPLOAD BUTTON */}
          {playlist.length === 0 ? (
            <motion.button
              key="empty-upload-trigger"
              type="button"
              id="music-upload-initial-btn"
              onClick={() => fileInputRef.current?.click()}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0e131f]/95 border shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(251,191,36,0.18)] backdrop-blur-2xl transition-all cursor-pointer ${
                isDraggingOver
                  ? "border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50 scale-105"
                  : "border-amber-500/40 hover:border-amber-400/80 hover:shadow-amber-500/20"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                <Upload className="w-4 h-4 animate-bounce" />
              </div>
              <div className="text-left font-playfair pr-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-bold text-amber-200 leading-tight">
                    Tải Nhạc Của Bạn Lên
                  </p>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Tự lưu
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {currentUser?.isLoggedIn
                    ? `Lưu theo tài khoản: ${currentUser.name}`
                    : "Bấm để chọn tệp .mp3 / .wav"}
                </p>
              </div>
            </motion.button>
          ) : !isExpanded ? (
            /* CASE 2: PLAYLIST HAS TRACKS -> COMPACT FLOATING BAR */
            <motion.div
              key="compact-player"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 p-2 pr-3.5 rounded-full bg-[#0d111a]/95 border border-amber-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(251,191,36,0.15)] backdrop-blur-xl group hover:border-amber-400/60 transition-all font-playfair"
            >
              {/* Spinning Vinyl Disc */}
              <div
                onClick={() => setIsExpanded(true)}
                className="relative cursor-pointer w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-slate-900 via-amber-950/80 to-slate-900 border border-amber-400/40 flex items-center justify-center shadow-inner overflow-hidden shrink-0"
              >
                <Disc3
                  className={`w-6 h-6 text-amber-300 ${
                    isPlaying ? "animate-spin" : ""
                  }`}
                  style={{ animationDuration: "3.5s" }}
                />
                <div className="absolute w-2.5 h-2.5 bg-amber-400 rounded-full border border-black/60 shadow-sm" />
              </div>

              {/* Track Info Ticker */}
              <div
                onClick={() => setIsExpanded(true)}
                className="cursor-pointer flex flex-col justify-center max-w-[130px] sm:max-w-[180px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <p className="text-xs font-bold text-amber-200 truncate leading-tight">
                    {currentTrack?.title || "Nhạc của bạn"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  <span>{playlist.length} bài đã lưu</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-sans">vĩnh viễn</span>
                </div>
              </div>

              {/* Quick Controls: Prev, Play/Pause, Next */}
              <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                <button
                  type="button"
                  id="music-compact-prev-btn"
                  onClick={handlePrev}
                  title="Bài trước"
                  className="p-1 rounded-full text-slate-400 hover:text-amber-200 hover:bg-white/5 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  id="music-compact-play-btn"
                  onClick={togglePlay}
                  title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                  className="p-1.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 transition-all shadow-sm active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  id="music-compact-next-btn"
                  onClick={handleNext}
                  title="Bài tiếp theo"
                  className="p-1 rounded-full text-slate-400 hover:text-amber-200 hover:bg-white/5 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Expand Toggle */}
                <button
                  type="button"
                  id="music-expand-toggle-btn"
                  onClick={() => setIsExpanded(true)}
                  title="Mở rộng bảng điều khiển"
                  className="ml-1 p-1 rounded-full text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* CASE 3: EXPANDED MUSIC PLAYER DIALOG */
            <motion.div
              key="expanded-player"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ duration: 0.28 }}
              className="w-80 sm:w-[390px] rounded-2xl bg-[#0c0f17]/95 border border-amber-500/35 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(251,191,36,0.18)] backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-3.5 relative overflow-hidden font-playfair"
            >
              {/* Glow Accents */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header with Account Indicator */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-amber-200 tracking-wide">
                        Kho Nhạc Cá Nhân
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Đa Thiết Bị</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                      Tài khoản: <span className="text-amber-300/90 font-sans">{userName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
                    className="p-1 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-colors text-[11px] flex items-center gap-1 border border-white/10 px-2 py-0.5"
                    title="Danh sách bài hát"
                  >
                    <ListMusic className="w-3 h-3 text-amber-400" />
                    <span>{playlist.length} Bài</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Thu gọn"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Track Info Card */}
              <div className="flex items-center gap-3.5 bg-white/[0.03] p-3 rounded-xl border border-white/5 relative z-10">
                {/* Vinyl Art */}
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-tr from-slate-900 via-amber-950 to-slate-900 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                  <Disc3
                    className={`w-9 h-9 text-amber-300 ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                    style={{ animationDuration: "3.5s" }}
                  />
                  <div className="absolute w-3.5 h-3.5 bg-amber-400 rounded-full border border-black/70 shadow-sm" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      Bài {currentTrackIndex + 1} / {playlist.length}
                    </span>
                    {currentTrack?.fileSize && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {currentTrack.fileSize}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-100 truncate">
                    {currentTrack?.title || "Chưa có bài hát"}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {currentTrack?.artist || "Tải lên từ thiết bị của bạn"}
                  </p>
                </div>
              </div>

              {/* Progress Scrubber */}
              <div className="space-y-1 relative z-10">
                <div
                  onClick={(e) => {
                    if (!audioRef.current || duration === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    const newTime = pct * duration;
                    audioRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden relative group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full relative"
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls & Volume Bar */}
              <div className="flex items-center justify-between pt-1 relative z-10">
                {/* Volume Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                    title={isMuted ? "Bật âm thanh" : "Tắt âm"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-14 sm:w-20 accent-amber-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Primary Buttons: Prev, Play/Pause, Next */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="music-expanded-prev-btn"
                    onClick={handlePrev}
                    className="p-2 rounded-xl text-slate-300 hover:text-amber-200 hover:bg-white/5 border border-white/5 transition-all active:scale-95"
                    title="Bài trước"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id="music-expanded-play-btn"
                    onClick={togglePlay}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/25 border border-amber-400/50 transition-all active:scale-95"
                    title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 translate-x-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    id="music-expanded-next-btn"
                    onClick={handleNext}
                    className="p-2 rounded-xl text-slate-300 hover:text-amber-200 hover:bg-white/5 border border-white/5 transition-all active:scale-95"
                    title="Bài tiếp theo"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload More Files Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/5 border border-white/5 transition-all flex items-center gap-1"
                  title="Tải thêm bài hát mới (tự động lưu vào tài khoản)"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Collapsible Playlist Tray */}
              <AnimatePresence>
                {showPlaylistDrawer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10 pt-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase font-bold text-amber-300/90 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Danh Sách Đã Lưu ({playlist.length}):
                      </p>
                      <div className="flex items-center gap-2">
                        {playlist.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-[10px] text-rose-400/80 hover:text-rose-300 transition-colors"
                          >
                            Xóa hết
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] text-amber-300 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm bài</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {playlist.map((trk, i) => {
                        const isCurrent = i === currentTrackIndex;
                        return (
                          <div
                            key={trk.id}
                            onClick={() => handleSelectTrack(i)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all group ${
                              isCurrent
                                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                                : "text-slate-300 hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                0{i + 1}
                              </span>
                              <div className="truncate">
                                <p className="truncate font-bold">{trk.title}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                                  <span>{trk.duration > 0 ? formatTime(trk.duration) : "Tệp đã lưu"}</span>
                                  {trk.fileSize && <span>• {trk.fileSize}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isCurrent && isPlaying && (
                                <div className="flex items-center gap-0.5 mr-1">
                                  <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                                  <span
                                    className="w-1 h-4 bg-amber-400 animate-pulse rounded-full"
                                    style={{ animationDelay: "150ms" }}
                                  />
                                  <span
                                    className="w-1 h-2 bg-amber-400 animate-pulse rounded-full"
                                    style={{ animationDelay: "300ms" }}
                                  />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTrack(e, trk.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Xóa bài này khỏi danh sách"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
