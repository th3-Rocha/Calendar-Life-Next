"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Menu, X } from "lucide-react";
import Sidebar, { DriveItem } from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import { getNextVideo } from "@/lib/utils";

function findFirstVideo(items: DriveItem[]): DriveItem | null {
  for (const item of items) {
    if (item.type === "file") return item;
    if (item.children?.length) {
      const found = findFirstVideo(item.children);
      if (found) return found;
    }
  }
  return null;
}

function countStats(items: DriveItem[]): { modules: number; lessons: number } {
  let modules = 0;
  let lessons = 0;

  const walk = (nodes: DriveItem[]) => {
    for (const node of nodes) {
      if (node.type === "folder") {
        modules += 1;
        if (node.children?.length) walk(node.children);
      } else {
        lessons += 1;
      }
    }
  };

  walk(items);
  return { modules, lessons };
}

export default function HomePage() {
  const [structure, setStructure] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoName, setActiveVideoName] = useState<string>("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    async function fetchStructure() {
      try {
        const response = await fetch("/api/structure");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Falha ao carregar estrutura");
        }

        const data: DriveItem[] = await response.json();
        setStructure(data);

        const firstVideo = findFirstVideo(data);
        if (firstVideo) {
          setActiveVideoId(firstVideo.id);
          setActiveVideoName(firstVideo.name);
        }
      } catch (err) {
        const e = err as Error;
        setError(e.message || "Falha ao carregar conteúdo");
      } finally {
        setLoading(false);
      }
    }

    fetchStructure();
  }, []);

  const stats = useMemo(() => countStats(structure), [structure]);

  const handleVideoSelect = (fileId: string, fileName: string) => {
    setActiveVideoId(fileId);
    setActiveVideoName(fileName);
    setIsNavOpen(false);
  };

  const handleNextVideo = () => {
    if (!activeVideoId) return;
    const next = getNextVideo(activeVideoId, structure);
    if (!next) return;
    setActiveVideoId(next.id);
    setActiveVideoName(next.name);
  };

  const hasNextVideo = activeVideoId
    ? getNextVideo(activeVideoId, structure) !== null
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100">
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 text-center backdrop-blur">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm text-zinc-300">Preparando o tatame...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100">
        <div className="flex h-screen items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6">
            <h2 className="mb-2 text-xl font-semibold text-emerald-200">
              Erro ao carregar conteúdo
            </h2>
            <p className="text-sm text-zinc-200">{error}</p>
            <p className="mt-3 text-xs text-zinc-400">
              Verifique permissões do Drive e configurações da conta de serviço.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0b0b0c] text-zinc-100">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#0b0b0c]/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/90 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <span className="text-xs font-bold text-black">BJJ</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-emerald-300">
                JIU DOJO
              </p>
              <p className="text-[10px] text-zinc-500">Arte suave • Treinos</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNavOpen((v) => !v)}
            className="rounded-full border border-zinc-700 p-2 text-zinc-200 hover:bg-zinc-800/70 lg:hidden"
            aria-label="Abrir módulos"
          >
            {isNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
            <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1">
              {stats.modules} módulos
            </span>
            <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1">
              {stats.lessons} aulas
            </span>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden">
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm border-r border-zinc-800 bg-[#0b0b0c] shadow-2xl">
            <Sidebar
              data={structure}
              activeVideoId={activeVideoId}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      )}

      {/* Layout */}
      <main className="mx-auto grid h-[calc(100vh-3.5rem)] w-full max-w-none grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[340px_1fr]">
        <aside className="hidden h-[calc(100vh-3.5rem)] overflow-hidden border-r border-zinc-800 lg:block">
          <Sidebar
            data={structure}
            activeVideoId={activeVideoId}
            onVideoSelect={handleVideoSelect}
          />
        </aside>

        <section className="h-[calc(100vh-3.5rem)]">
          <VideoPlayer
            key={activeVideoId || "empty"}
            fileId={activeVideoId || ""}
            fileName={activeVideoName}
            onNext={handleNextVideo}
            hasNext={hasNextVideo}
          />
        </section>
      </main>
    </div>
  );
}
