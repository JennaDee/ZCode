import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Header } from "./components/layout/Header";
import { ButtonLink } from "./components/ui/Button";
import { CosmicBackground } from "./components/landing/CosmicBackground";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      "/": "A little curiosity. Infinite possibilities.",
      "/login": "Log in",
      "/register": "Create an account",
      "/forgot-password": "Reset password",
    };
    document.title = `ZCode — ${names[pathname] ?? "Page not found"}`;
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    else {
      window.scrollTo(0, 0);
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return null;
}
export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <CosmicBackground />
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route
          path="/register"
          element={<AuthPage key="register" mode="register" />}
        />
        <Route
          path="/forgot-password"
          element={<AuthPage key="reset" mode="reset" />}
        />
        <Route
          path="*"
          element={
            <main id="main-content" tabIndex={-1} className="not-found shell">
              <span className="eyebrow">404 · A LITTLE OFF COURSE</span>
              <h1>Let’s find your way back.</h1>
              <p>This corner of the universe doesn’t have a page yet.</p>
              <ButtonLink to="/">Back to ZCode</ButtonLink>
            </main>
          }
        />
      </Routes>
      <Footer />
      <RouteEffects />
    </>
  );
}
