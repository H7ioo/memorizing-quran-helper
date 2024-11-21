import { GamepadIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <Link
        to="#"
        className="flex items-center gap-2"
        // prefetch={false}
      >
        <GamepadIcon className="h-6 w-6" />
        <span className="hidden text-lg font-semibold sm:block">
          Memorize Quran Helper
        </span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          to="/game"
          className="text-sm font-medium underline-offset-4 hover:underline"
          // prefetch={false}
        >
          Play Game
        </Link>
        <Link
          to="/audio-player"
          className="text-sm font-medium underline-offset-4 hover:underline"
          // prefetch={false}
        >
          Audio Player
        </Link>
        <Link
          to="/fahras"
          className="text-sm font-medium underline-offset-4 hover:underline"
          // prefetch={false}
        >
          Fahras
        </Link>
      </nav>
    </header>
  );
}
