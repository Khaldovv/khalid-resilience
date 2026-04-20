import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import AutoResilienceEN from "./AutoResilienceEN";
import AutoResilienceAR from "./AutoResilienceAR";

export default function ERMPlatform() {
  const { language } = useApp();
  const [transitioning, setTransitioning] = useState(false);
  const [displayLang, setDisplayLang] = useState(language);

  useEffect(() => {
    if (language !== displayLang) {
      setTransitioning(true);
      const t = setTimeout(() => {
        setDisplayLang(language);
        setTransitioning(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [language, displayLang]);

  return (
    <div
      style={{
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "scale(0.99)" : "scale(1)",
        minHeight: "100vh",
      }}
    >
      {displayLang === "ar" ? <AutoResilienceAR /> : <AutoResilienceEN />}
    </div>
  );
}
