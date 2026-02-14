"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
  Folder,
  FolderOpen,
  PlayCircle,
  PanelsTopLeft,
} from "lucide-react";

export interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType?: string;
  children?: DriveItem[];
}

interface SidebarProps {
  data: DriveItem[];
  activeVideoId: string | null;
  onVideoSelect: (fileId: string, fileName: string) => void;
}

interface NodeProps {
  item: DriveItem;
  level: number;
  activeVideoId: string | null;
  onVideoSelect: (fileId: string, fileName: string) => void;
  checked: Set<string>;
  watched: Set<string>;
  toggleChecked: (fileId: string) => void;
}

const checkedKey = (fileId: string) => `lesson_checked_${fileId}`;
const watchedKey = (fileId: string) => `video_watched_${fileId}`;

function collectFiles(items: DriveItem[]): DriveItem[] {
  const out: DriveItem[] = [];
  for (const item of items) {
    if (item.type === "file") out.push(item);
    if (item.children?.length) out.push(...collectFiles(item.children));
  }
  return out;
}

function getStats(
  item: DriveItem,
  checked: Set<string>,
  watched: Set<string>,
): { total: number; done: number } {
  if (item.type === "file") {
    const done = checked.has(item.id) || watched.has(item.id) ? 1 : 0;
    return { total: 1, done };
  }

  const children = item.children ?? [];
  return children.reduce(
    (acc, child) => {
      const childStats = getStats(child, checked, watched);
      return {
        total: acc.total + childStats.total,
        done: acc.done + childStats.done,
      };
    },
    { total: 0, done: 0 },
  );
}

function SidebarNode({
  item,
  level,
  activeVideoId,
  onVideoSelect,
  checked,
  watched,
  toggleChecked,
}: NodeProps) {
  const isFolder = item.type === "folder";
  const isActive = !isFolder && activeVideoId === item.id;
  const hasChildren = !!item.children?.length;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasChildren) return;

    const containsActive = (node: DriveItem): boolean => {
      if (node.type === "file") return node.id === activeVideoId;
      return (node.children ?? []).some(containsActive);
    };

    if (activeVideoId && containsActive(item)) {
      window.setTimeout(() => setOpen(true), 0);
    }
  }, [activeVideoId, hasChildren, item]);

  if (isFolder) {
    const stats = getStats(item, checked, watched);
    const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-zinc-800/40"
          style={{ paddingLeft: `${10 + level * 12}px` }}
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
          {open ? (
            <FolderOpen className="h-4 w-4 text-emerald-400" />
          ) : (
            <Folder className="h-4 w-4 text-emerald-400" />
          )}

          <div className="min-w-0 flex-1">
            <p
              className={`truncate ${
                level === 0 ? "font-semibold text-zinc-100" : "text-zinc-200"
              }`}
            >
              {item.name}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-700/80">
                <div
                  className="h-full bg-emerald-400/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">
                {stats.done}/{stats.total}
              </span>
            </div>
          </div>
        </button>

        {open && hasChildren && (
          <div className="space-y-0.5">
            {item.children!.map((child) => (
              <SidebarNode
                key={child.id}
                item={child}
                level={level + 1}
                activeVideoId={activeVideoId}
                onVideoSelect={onVideoSelect}
                checked={checked}
                watched={watched}
                toggleChecked={toggleChecked}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isChecked = checked.has(item.id);
  const isWatched = watched.has(item.id);

  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
        isActive
          ? "bg-emerald-900/30 ring-1 ring-emerald-500/30"
          : "hover:bg-zinc-800/40"
      }`}
      style={{ marginLeft: `${10 + level * 12}px`, marginRight: "6px" }}
    >
      <button
        type="button"
        onClick={() => onVideoSelect(item.id, item.name)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <PlayCircle
          className={`h-4 w-4 shrink-0 ${
            isActive ? "text-emerald-300" : "text-zinc-400"
          }`}
        />
        <span
          className={`truncate text-sm ${
            isActive ? "font-medium text-zinc-100" : "text-zinc-300"
          }`}
        >
          {item.name}
        </span>
      </button>

      <button
        type="button"
        title={isChecked ? "Desmarcar aula" : "Marcar aula como feita"}
        onClick={(e) => {
          e.stopPropagation();
          toggleChecked(item.id);
        }}
        className="rounded p-1 transition hover:bg-zinc-700/50"
      >
        {isChecked ? (
          <Check className="h-4 w-4 text-emerald-300" />
        ) : isWatched ? (
          <Check className="h-4 w-4 text-sky-300" />
        ) : (
          <Circle className="h-4 w-4 text-zinc-500" />
        )}
      </button>
    </div>
  );
}

export default function Sidebar({
  data,
  activeVideoId,
  onVideoSelect,
}: SidebarProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(true);

  const allFiles = useMemo(() => collectFiles(data), [data]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    window.setTimeout(() => setMobileOpen(!isMobile), 0);

    const c = new Set<string>();
    const w = new Set<string>();

    for (const file of allFiles) {
      if (localStorage.getItem(checkedKey(file.id)) === "true") c.add(file.id);
      if (localStorage.getItem(watchedKey(file.id)) === "true") w.add(file.id);
    }

    setChecked(c);
    setWatched(w);

    const sync = setInterval(() => {
      const cNext = new Set<string>();
      const wNext = new Set<string>();
      for (const file of allFiles) {
        if (localStorage.getItem(checkedKey(file.id)) === "true") {
          cNext.add(file.id);
        }
        if (localStorage.getItem(watchedKey(file.id)) === "true") {
          wNext.add(file.id);
        }
      }
      setChecked(cNext);
      setWatched(wNext);
    }, 1200);

    return () => clearInterval(sync);
  }, [allFiles]);

  const toggleChecked = (fileId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const on = !next.has(fileId);
      if (on) {
        next.add(fileId);
        localStorage.setItem(checkedKey(fileId), "true");
      } else {
        next.delete(fileId);
        localStorage.removeItem(checkedKey(fileId));
      }
      return next;
    });
  };

  const total = allFiles.length;
  const done = allFiles.filter(
    (f) => checked.has(f.id) || watched.has(f.id),
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-800 bg-[#0d0f0f]">
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0d0f0f]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400">
              Jiu • Modules
            </p>
            <h2 className="text-base font-semibold text-zinc-100">
              Biblioteca de Aulas
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800/60 lg:hidden"
            title="Abrir módulos"
          >
            <PanelsTopLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Progresso</span>
            <span>
              {done}/{total} ({pct}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-400/80 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto px-2 py-2 ${
          mobileOpen ? "block" : "hidden"
        } lg:block`}
      >
        {data.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-zinc-500">
            Nenhum módulo encontrado.
          </div>
        ) : (
          data.map((item) => (
            <SidebarNode
              key={item.id}
              item={item}
              level={0}
              activeVideoId={activeVideoId}
              onVideoSelect={onVideoSelect}
              checked={checked}
              watched={watched}
              toggleChecked={toggleChecked}
            />
          ))
        )}
      </div>
    </aside>
  );
}
