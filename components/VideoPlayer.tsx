"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface VideoPlayerProps {
  fileId: string;
  fileName: string;
  onNext?: () => void;
  hasNext?: boolean;
}

export default function VideoPlayer({
  fileId,
  fileName,
  onNext,
  hasNext,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const [showControls, setShowControls] = useState(true);
  const [isWatchedAuto, setIsWatchedAuto] = useState(false);
  const [isCheckedManual, setIsCheckedManual] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const progressPercent = useMemo(() => {
    if (!duration || Number.isNaN(duration)) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  useEffect(() => {
    if (!fileId) return;

    // state reset handled by remount via key

    const syncMarks = () => {
      const watched =
        localStorage.getItem(`video_watched_${fileId}`) === "true";
      const checked =
        localStorage.getItem(`lesson_checked_${fileId}`) === "true";
      setIsWatchedAuto(watched);
      setIsCheckedManual(checked);
    };

    const syncTimeout = window.setTimeout(syncMarks, 0);

    const savedProgress = localStorage.getItem(`video_progress_${fileId}`);
    if (savedProgress && videoRef.current) {
      const parsed = parseFloat(savedProgress);
      if (!Number.isNaN(parsed)) videoRef.current.currentTime = parsed;
    }

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === `video_watched_${fileId}` ||
        event.key === `lesson_checked_${fileId}`
      ) {
        syncMarks();
      }
    };
    window.addEventListener("storage", onStorage);

    const syncInterval = window.setInterval(syncMarks, 1200);

    progressSaveIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        localStorage.setItem(
          `video_progress_${fileId}`,
          videoRef.current.currentTime.toString(),
        );
      }
    }, 5000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(syncInterval);
      window.clearTimeout(syncTimeout);
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [fileId]);

  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleManualCheck = () => {
    if (!fileId) return;
    const next = !isCheckedManual;
    setIsCheckedManual(next);
    localStorage.setItem(`lesson_checked_${fileId}`, String(next));
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        2200,
      );
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      await videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    const d = videoRef.current.duration;
    setCurrentTime(t);

    if (d > 0 && t / d >= 0.95 && !isWatchedAuto) {
      localStorage.setItem(`video_watched_${fileId}`, "true");
      setIsWatchedAuto(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    localStorage.setItem(`video_watched_${fileId}`, "true");
    localStorage.setItem(`video_progress_${fileId}`, "0");
    setIsWatchedAuto(true);

    if (onNext && hasNext) {
      setTimeout(() => onNext(), 1200);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    videoRef.current.muted = v === 0;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const t = parseFloat(e.target.value);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!fileId) {
    return (
      <div className="h-full bg-[#0c0c0d] flex items-center justify-center text-zinc-300">
        <div className="text-center max-w-md px-6">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Play className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Escolha uma aula para começar
          </h2>
          <p className="text-sm text-zinc-400">
            Abra um módulo e selecione uma aula para iniciar seu treino.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col bg-[#0b0b0d] text-white">
      {/* Video area */}
      <div
        className="relative flex-1 bg-black"
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={`/api/stream?fileId=${fileId}`}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={togglePlay}
        />

        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/25"
          >
            <span className="rounded-full bg-emerald-500/90 hover:bg-emerald-500 p-5 transition shadow-xl shadow-emerald-900/30">
              <Play className="w-10 h-10 text-white" fill="white" />
            </span>
          </button>
        )}

        {/* Controls */}
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pt-3 pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm md:text-base font-semibold truncate">
                  {fileName}
                </p>
                <p className="text-[11px] text-zinc-300">
                  {formatTime(currentTime)} / {formatTime(duration)} •{" "}
                  {progressPercent.toFixed(0)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleManualCheck}
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition ${
                    isCheckedManual
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-600/80 bg-black/30 text-zinc-200 hover:border-zinc-400"
                  }`}
                  title="Marcar aula como concluída manualmente"
                >
                  {isCheckedManual ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  {isCheckedManual ? "Concluída" : "Marcar"}
                </button>

                {isWatchedAuto && (
                  <span className="hidden sm:inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finalizada
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full mb-3 h-1 appearance-none rounded-lg cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 ${progressPercent}%, #52525b ${progressPercent}%)`,
              }}
            />

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="hover:text-emerald-300 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {hasNext && (
                  <button
                    onClick={onNext}
                    className="hover:text-emerald-300 transition"
                    title="Próxima aula"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                )}

                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="hover:text-emerald-300 transition"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-20 transition-all duration-200 h-1 rounded-lg appearance-none cursor-pointer bg-zinc-600"
                  />
                </div>

                <span className="text-xs text-zinc-200">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="hover:text-emerald-300 transition"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
