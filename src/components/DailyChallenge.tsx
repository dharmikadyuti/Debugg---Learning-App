import { useEffect, useState } from "react";
import { DAILY_CHALLENGE } from "../data/dailyChallenge";
//import { DAILY_CHALLENGE } from "../data/dailyChallenge";
interface DailyVariant {
  lines: string[];
  bugLine: number;
  fixed: string;
  expectedOutput: string;
  hint: string;
}
interface DailyProblem {
  concept: string;
  description: string;
  errorType: string;
  difficulty: string;
  xp: number;
  variants: Record<string, DailyVariant>;
}

interface DailyChallengeProps {
  go: (page: string) => void;
  pickChallenge: (challenge: any) => void;
  user: any;
}
function DailyChallenge({
  go,
  pickChallenge,
  user,
}: DailyChallengeProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [step, setStep] = useState("card"); // "card" | "langpick" | "done"
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const today = new Date().toDateString();

  const d: DailyProblem = DAILY_CHALLENGE; // today's problem (same concept for all langs)

  const LANGS = [
    { name: "Python",     icon: "🐍" },
    { name: "JavaScript", icon: "💛" },
    { name: "Java",       icon: "☕" },
    { name: "C",          icon: "⚙️" },
    { name: "C++",        icon: "🔷" },
    { name: "HTML",       icon: "🌐" },
    { name: "CSS",        icon: "🎨" },
  ];

  // Countdown timer
  useEffect(() => {
    function calcTime() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      //setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      const hh = String(h).length === 1 ? "0" + h : String(h);
      const mm = String(m).length === 1 ? "0" + m : String(m);
      const ss = String(s).length === 1 ? "0" + s : String(s);
      setTimeLeft(`${hh}:${mm}:${ss}`);
    }

    calcTime();
    const t = setInterval(calcTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Check if user already solved today's daily
  useEffect(() => {
    if (user?.lastDailyDate === today) setStep("done");
  }, [user]);

  function startChallenge() {
    if (!selectedLang) return;
    const variant = d.variants[selectedLang];
    if (!variant) return;
    // Build a full challenge object from the concept + selected language variant
    pickChallenge({
      id: "daily_" + today + "_" + selectedLang,
      title: d.concept,
      lang: selectedLang,
      difficulty: d.difficulty,
      errorType: d.errorType,
      description: d.description,
      xp: d.xp * 2, // 2x bonus
      isDailyChallenge: true,
      ...variant,
    });
    go("challenge");
  }

  // ── DONE STATE ──────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="card" style={{
        marginBottom: 28,
        background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(0,229,255,0.06))",
        border: "1.5px solid rgba(34,197,94,0.3)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--green)", marginBottom: 6 }}>
            Daily Challenge Complete!
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            You already solved today's challenge. Come back in{" "}
            <span style={{ color: "var(--cyan)", fontFamily: "var(--mono)" }}>{timeLeft}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--lime)", fontWeight: 700 }}>
            🔥 Keep your streak going tomorrow!
          </div>
        </div>
      </div>
    );
  }

  // ── LANG PICKER STATE ───────────────────────────────────────
  if (step === "langpick") {
    const variant = selectedLang ? d.variants[selectedLang] : null;
    return (
      <div className="card" style={{
        marginBottom: 28,
        background: "linear-gradient(135deg, rgba(200,241,53,0.08), rgba(0,229,255,0.06))",
        border: "1.5px solid rgba(200,241,53,0.3)",
        position: "relative", overflow: "hidden",
      }}>
        <div className="glow" style={{ width: 300, height: 200, background: "var(--lime)", top: "-50%", right: "-5%" }} />
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={() => { setStep("card"); setSelectedLang(null); }}
              style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 8,
                padding: "5px 14px", color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
              ← Back
            </button>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--lime)" }}>
                ⚡ {d.concept}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                {d.description}
              </div>
            </div>
          </div>

          {/* Language grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, marginBottom: 18 }}>
            {LANGS.map(({ name, icon }) => (
              <button key={name} onClick={() => setSelectedLang(name)}
                style={{
                  background: selectedLang === name ? "rgba(200,241,53,0.2)" : "var(--card2)",
                  border: selectedLang === name ? "2px solid var(--lime)" : "1.5px solid var(--border)",
                  borderRadius: 14, padding: "14px 8px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all .2s",
                }}>
                <span style={{ fontSize: 26 }}>{icon}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: "var(--text)" }}>{name}</span>
              </button>
            ))}
          </div>

          {/* Preview of selected language's code */}
          {variant && (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "14px 16px", marginBottom: 16, fontFamily: "var(--mono)", fontSize: 12,
              lineHeight: 1.8, whiteSpace: "pre" }}>
              {variant.lines.map((ln, i) => (
                <div key={i} style={{
                  color: i === variant.bugLine ? "var(--red)" : "var(--muted)",
                  fontWeight: i === variant.bugLine ? 700 : 400,
                }}>
                  <span style={{ color: "var(--border)", marginRight: 12, userSelect: "none" }}>{i + 1}</span>
                  {ln || " "}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
              {selectedLang
                ? `Solving in ${selectedLang} · +${d.xp * 2} XP bonus 🔥`
                : "Select a language to preview the code →"}
            </div>
            <button className="btn-lime" style={{ padding: "12px 28px", fontSize: 14,
              opacity: selectedLang ? 1 : 0.4, cursor: selectedLang ? "pointer" : "not-allowed" }}
              onClick={startChallenge} disabled={!selectedLang}>
              Start Challenge →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DEFAULT CARD STATE ──────────────────────────────────────
  return (
    <div className="card" style={{
      marginBottom: 28,
      background: "linear-gradient(135deg, rgba(200,241,53,0.08), rgba(0,229,255,0.06))",
      border: "1.5px solid rgba(200,241,53,0.3)",
      position: "relative", overflow: "hidden",
    }}>
      <div className="glow" style={{ width: 300, height: 200, background: "var(--lime)", top: "-50%", right: "-5%" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--lime)" }}>
                Daily Challenge
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                Resets in{" "}
                <span style={{ color: "var(--cyan)", fontFamily: "var(--mono)" }}>{timeLeft}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(200,241,53,0.15)", border: "1px solid rgba(200,241,53,0.4)",
            borderRadius: 50, padding: "6px 16px", fontFamily: "var(--display)", fontSize: 16, color: "var(--lime)" }}>
            +{d.xp * 2} XP BONUS 🔥
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span className={`tag tag-${d.difficulty}`}>{d.difficulty.toUpperCase()}</span>
              <span className="chip">🐛 {d.errorType}</span>
              <span className="chip">🌐 All Languages</span>
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, marginBottom: 4 }}>{d.concept}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>
              {d.description}
            </div>
          </div>
          <button className="btn-lime" style={{ padding: "12px 28px", fontSize: 14, flexShrink: 0 }}
            onClick={() => setStep("langpick")}>
            Choose Language →
          </button>
        </div>
      </div>
    </div>
  );
}
export default DailyChallenge;