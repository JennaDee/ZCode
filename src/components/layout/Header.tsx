import { ZCodeLogo } from "../branding/ZCodeLogo";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  return (
    <header className="site-header shell">
      <ZCodeLogo />
      <div className="header-actions">
        <span className="header-tagline">
          A little curiosity. Infinite possibilities.
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
