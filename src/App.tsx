import { useEffect, useState } from "react";
import { useBoard } from "./hooks/useBoard";
import { StatusBar } from "./components/StatusBar";
import { BoardView } from "./components/BoardView";
import { EventLogPanel } from "./components/EventLogPanel";
import { ThemeOverlay } from "./components/ThemeOverlay";

export default function App() {
  const snap = useBoard();
  const [logOpen, setLogOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F1") {
        e.preventDefault();
        setThemeOpen((o) => !o);
      } else if (e.key === "Escape") {
        setThemeOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="bt-bench flex h-screen flex-col overflow-hidden text-bt-text">
      <StatusBar
        connected={snap.connected}
        board={snap.board}
        onOpenTheme={() => setThemeOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* bench area — board is centred, scrolls when the window shrinks */}
        <main className="bt-scroll min-w-0 flex-1 overflow-auto">
          <div className="grid min-h-full place-items-center p-8">
            <BoardView
              descriptor={snap.board}
              state={snap.state}
              connected={snap.connected}
              serial={snap.serial}
              stats={snap.stats}
            />
          </div>
        </main>

        <EventLogPanel
          lines={snap.log}
          open={logOpen}
          onToggle={() => setLogOpen((o) => !o)}
        />
      </div>

      {themeOpen && <ThemeOverlay onClose={() => setThemeOpen(false)} />}
    </div>
  );
}
