import { Link } from "react-router";
import { CodeXml } from "lucide-react";

export function ZCodeLogo() {
  return (
    <Link to="/" className="logo" aria-label="ZCode home">
      <span className="logo-mark">
        <CodeXml aria-hidden="true" size={23} />
      </span>
      <span>
        ZCode<span className="logo-dot">.</span>
      </span>
    </Link>
  );
}
