import { useEffect, useRef, useState } from "react";
import { CircuitBoard, LayoutGrid, Menu, Palette, RotateCcw } from "lucide-react";
import { board, type BoardDescriptor } from "../lib/board";
import {
  TRNIconButton,
  TRNMenuItemButton,
  TRNMenuPanel,
  TRNMenuSectionTitle,
  TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS,
} from "@ternion/trn-ui";

interface StatusBarProps {
  connected: boolean;
  board: BoardDescriptor | null;
  onOpenTheme: () => void;
}

export function StatusBar({ connected, board: desc, onOpenTheme }: StatusBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const down = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, [menuOpen]);

  return (
    <header className="relative z-30 flex items-center gap-4 border-b border-white/5 bg-bt-canvas/95 px-5 py-2.5">
      {/* wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-bt-accent/25 bg-bt-accent/10 text-bt-accent-soft">
          <CircuitBoard size={16} />
        </div>
        <div>
          <div className="text-[13px] font-semibold tracking-wide text-bt-text">
            board-twin
          </div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-bt-faint">
            virtual bench
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* broker link pill */}
      <span
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-silk text-[10px] tracking-widest ${
          connected
            ? "border-bt-accent/25 bg-bt-accent/10 text-bt-accent-soft"
            : "border-bt-danger/25 bg-bt-danger/10 text-bt-err"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? "bg-bt-accent" : "bg-bt-danger bt-link-blink"
          }`}
        />
        {connected ? "LINK :7392" : "OFFLINE"}
      </span>

      {/* app menu */}
      <div ref={menuRef} className="relative">
        <TRNIconButton
          variant="ghost"
          icon={<Menu size={14} />}
          label="Menu"
          hintTitle="Menu"
          hintDescription="Board actions, theme, layout"
          nativeTitle={false}
          onClick={() => setMenuOpen((o) => !o)}
        />
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44">
            <TRNMenuPanel tone="subtle" className={`${TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS} flex flex-col gap-1 bg-zinc-950`}>
              <TRNMenuSectionTitle spacing="menuFirst">board</TRNMenuSectionTitle>
              <TRNMenuItemButton
                icon={<RotateCcw className="size-3.5 shrink-0 text-zinc-400" aria-hidden />}
                label="Reset board"
                className="gap-1.5 rounded-md border-zinc-700/60 bg-zinc-900/80 px-2.5 py-1.5 text-[12px] leading-tight text-zinc-200 hover:border-zinc-600/80 hover:bg-zinc-800/80"
                disabled={!connected}
                onClick={() => {
                  board.reset();
                  setMenuOpen(false);
                }}
              />
              <TRNMenuSectionTitle spacing="menuNext">bench</TRNMenuSectionTitle>
              <TRNMenuItemButton
                icon={<Palette className="size-3.5 shrink-0 text-zinc-400" aria-hidden />}
                label="Theme tokens…"
                className="gap-1.5 rounded-md border-zinc-700/60 bg-zinc-900/80 px-2.5 py-1.5 text-[12px] leading-tight text-zinc-200 hover:border-zinc-600/80 hover:bg-zinc-800/80"
                onClick={() => {
                  onOpenTheme();
                  setMenuOpen(false);
                }}
              />
              <TRNMenuItemButton
                icon={<LayoutGrid className="size-3.5 shrink-0 text-zinc-400" aria-hidden />}
                label="Reset layout"
                className="gap-1.5 rounded-md border-zinc-700/60 bg-zinc-900/80 px-2.5 py-1.5 text-[12px] leading-tight text-zinc-200 hover:border-zinc-600/80 hover:bg-zinc-800/80"
                onClick={() => {
                  window.btLayout?.reset();
                  setMenuOpen(false);
                }}
              />
            </TRNMenuPanel>
          </div>
        )}
      </div>
    </header>
  );
}
