import { GamepadIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return <header className="bg-background border-b px-4 lg:px-6 h-14 flex items-center justify-between">
    <Link to="#" className="flex items-center gap-2"
    // prefetch={false}
    >
      <GamepadIcon className="h-6 w-6" />
      <span className="text-lg font-semibold hidden sm:block">Memorize Quran Helper</span>
    </Link>
    <nav className="flex items-center gap-4">
      <Link to="/game" className="text-sm font-medium hover:underline underline-offset-4"
      // prefetch={false}
      >
        Play Game
      </Link>
      <Link to="/prefrence" className="text-sm font-medium hover:underline underline-offset-4"
      // prefetch={false}
      >
        Customize
      </Link>
    </nav>
  </header>
}
