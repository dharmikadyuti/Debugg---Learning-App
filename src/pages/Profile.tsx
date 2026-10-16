import { useState } from "react";
import { submitChallengeUpload } from "../services/profileService";
import { db } from "../firebase";

interface ProfileProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  onUpload: (upload: any) => void;
}

const BADGES = [
  {
    id: "streak_3",
    icon: "🔥",
    label: "On Fire",
    desc: "Maintain a 3-day streak",
    check: (u: any) => (u.streak || 0) >= 3,
  },
  {
    id: "streak_7",
    icon: "🌋",
    label: "7-Day Streak",
    desc: "Maintain a 7-day streak",
    check: (u: any) => (u.streak || 0) >= 7,
  },
  {
    id: "streak_30",
    icon: "💎",
    label: "Unstoppable",
    desc: "Maintain a 30-day streak",
    check: (u: any) => (u.streak || 0) >= 30,
  },
  {
    id: "first_solve",
    icon: "🐣",
    label: "First Bug Fixed",
    desc: "Solve your first challenge",
    check: (u: any) => (u.solved || 0) >= 1,
  },
  {
    id: "solve_10",
    icon: "🌟",
    label: "Bug Hunter",
    desc: "Solve 10 challenges",
    check: (u: any) => (u.solved || 0) >= 10,
  },
  {
    id: "solve_25",
    icon: "🏅",
    label: "Debugger",
    desc: "Solve 25 challenges",
    check: (u: any) => (u.solved || 0) >= 25,
  },
  {
    id: "solve_50",
    icon: "🏆",
    label: "Elite Debugger",
    desc: "Solve 50 challenges",
    check: (u: any) => (u.solved || 0) >= 50,
  },
  {
    id: "python_3",
    icon: "🐍",
    label: "Python Rookie",
    desc: "Solve 3 Python challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["Python"] || 0) >= 3,
  },
  {
    id: "python_pro",
    icon: "🐍",
    label: "Python Pro",
    desc: "Solve all 10 Python challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["Python"] || 0) >= 10,
  },
  {
    id: "js_3",
    icon: "💛",
    label: "JS Rookie",
    desc: "Solve 3 JavaScript challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["JavaScript"] || 0) >= 3,
  },
  {
    id: "js_pro",
    icon: "💛",
    label: "JS Pro",
    desc: "Solve all 10 JavaScript challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["JavaScript"] || 0) >= 10,
  },
  {
    id: "java_3",
    icon: "☕",
    label: "Java Rookie",
    desc: "Solve 3 Java challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["Java"] || 0) >= 3,
  },
  {
    id: "java_pro",
    icon: "☕",
    label: "Java Pro",
    desc: "Solve all 10 Java challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["Java"] || 0) >= 10,
  },
  {
    id: "c_pro",
    icon: "⚙️",
    label: "C Master",
    desc: "Solve all 10 C challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["C"] || 0) >= 10,
  },
  {
    id: "cpp_pro",
    icon: "🔷",
    label: "C++ Master",
    desc: "Solve all 10 C++ challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["C++"] || 0) >= 10,
  },
  {
    id: "html_pro",
    icon: "🌐",
    label: "HTML Master",
    desc: "Solve all 10 HTML challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["HTML"] || 0) >= 10,
  },
  {
    id: "css_pro",
    icon: "🎨",
    label: "CSS Master",
    desc: "Solve all 10 CSS challenges",
    check: (u: any, langCounts: Record<string, number>) => (langCounts["CSS"] || 0) >= 10,
  },
  {
    id: "polyglot",
    icon: "🌍",
    label: "Polyglot",
    desc: "Solve at least 1 challenge in every language",
    check: (u: any, langCounts: Record<string, number>) =>
      ["Python","JavaScript","Java","C","C++","HTML","CSS"].every(
        (l) => (langCounts[l] || 0) >= 1
      ),
  },
  {
    id: "xp_500",
    icon: "⚡",
    label: "XP Grinder",
    desc: "Earn 500 XP",
    check: (u: any) => (u.xp || 0) >= 500,
  },
  {
    id: "xp_2000",
    icon: "🚀",
    label: "XP Legend",
    desc: "Earn 2000 XP",
    check: (u: any) => (u.xp || 0) >= 2000,
  },
  {
    id: "daily_1",
    icon: "📅",
    label: "Daily Debugger",
    desc: "Complete your first daily challenge",
    check: (u: any) => !!u.lastDailyDate,
  },
  {
    id: "hintless",
    icon: "💡",
    label: "Hint-less",
    desc: "Solve 5 challenges without using a hint",
    check: (u: any) => (u.hintlessSolves || 0) >= 5,
  },
];

function Profile({
  user,
  setUser,
  onUpload,
}: ProfileProps) {
  const [tab, setTab] = useState("stats");
  const [uploads, setUploads] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    lang: "Python",
    difficulty: "easy",
    errorType: "Syntax",
    code: "",
    bugLine: "",
    fixed: "",
    hint: "",
    expectedOutput: "",
  });
  const canUpload = true;

  // Compute per-language solve counts from user's solvedChallenges array
  const langCounts: Record<string, number> = {};
  (user.solvedChallenges || []).forEach((id: any) => {
    const ch = ((window as any).__ALL_CHALLENGES__ || []).find((c: any) => c.id === id);
    if (ch) langCounts[ch.lang] = (langCounts[ch.lang] || 0) + 1;
  });

  // Compute badge progress values for rendering
  function getBadgeProgress(b: any) {
    if (b.id.startsWith("streak_")) {
      const target = parseInt(b.id.split("_")[1]);
      return { current: Math.min(user.streak || 0, target), target, type: "streak" };
    }
    if (b.id === "first_solve") return { current: Math.min(user.solved || 0, 1), target: 1, type: "solve" };
    if (b.id === "solve_10") return { current: Math.min(user.solved || 0, 10), target: 10, type: "solve" };
    if (b.id === "solve_25") return { current: Math.min(user.solved || 0, 25), target: 25, type: "solve" };
    if (b.id === "solve_50") return { current: Math.min(user.solved || 0, 50), target: 50, type: "solve" };
    if (b.id === "xp_500") return { current: Math.min(user.xp || 0, 500), target: 500, type: "xp" };
    if (b.id === "xp_2000") return { current: Math.min(user.xp || 0, 2000), target: 2000, type: "xp" };
    if (b.id === "hintless") return { current: Math.min(user.hintlessSolves || 0, 5), target: 5, type: "solve" };
    if (b.id === "daily_1") return { current: user.lastDailyDate ? 1 : 0, target: 1, type: "daily" };
    if (b.id === "polyglot") {
      const langs = ["Python","JavaScript","Java","C","C++","HTML","CSS"];
      const done = langs.filter(l => (langCounts[l] || 0) >= 1).length;
      return { current: done, target: langs.length, type: "lang" };
    }
    // Language-specific badges
    const langMap: Record<string, [string, number]> = {
      python_3: ["Python", 3], python_pro: ["Python", 10],
      js_3: ["JavaScript", 3], js_pro: ["JavaScript", 10],
      java_3: ["Java", 3], java_pro: ["Java", 10],
      c_pro: ["C", 10], cpp_pro: ["C++", 10],
      html_pro: ["HTML", 10], css_pro: ["CSS", 10],
    };
    if (langMap[b.id]) {
      const [lang, target] = langMap[b.id];
      return { current: Math.min(langCounts[lang] || 0, target), target, type: "lang" };
    }
    return { current: 0, target: 1, type: "other" };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.code || !form.fixed || !form.hint) return;
    const newUpload = {
      id: Date.now(),
      title: form.title,
      lang: form.lang,
      difficulty: form.difficulty,
      errorType: form.errorType,
      code: form.code,
      bugLine: Number(form.bugLine),
      fixed: form.fixed,
      hint: form.hint,
      expectedOutput: form.expectedOutput,
      status: "pending",
      submittedAt: new Date().toLocaleDateString(),
      authorId: user.uid,
      author: user.name,
      avatar: user.avatar,
    };
    setUploads((prev: any[]) => [newUpload, ...prev]);
    try {
  await submitChallengeUpload(newUpload);
} catch (err) {
  console.error("Submission failed:", err);
}
    if (onUpload)
      onUpload({
        ...newUpload,
        lines: newUpload.code.split("\n"),
        description: newUpload.hint,
        xp: newUpload.difficulty === "easy" ? 50 : newUpload.difficulty === "medium" ? 80 : 120,
      });
    setForm({ title: "", lang: "Python", difficulty: "easy", errorType: "Syntax", code: "", bugLine: "", fixed: "", hint: "", expectedOutput: "" });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  // Compute level from XP
  const xpPerLevel = 500;
  const currentLevel = Math.floor((user.xp || 0) / xpPerLevel) + 1;
  const xpIntoLevel = (user.xp || 0) % xpPerLevel;
  const earnedBadges = BADGES.filter(b => b.check(user, langCounts));
  const allLangs = ["Python","JavaScript","Java","C","C++","HTML","CSS"];
 const langIcons: Record<string, string>= { Python:"🐍", JavaScript:"💛", Java:"☕", C:"⚙️", "C++":"🔷", HTML:"🌐", CSS:"🎨" };

  const badgeCategories = [
    { key: "all", label: "All" },
    { key: "streak", label: "🔥 Streaks" },
    { key: "solve", label: "🐛 Solving" },
    { key: "lang", label: "🌐 Languages" },
    { key: "xp", label: "⚡ XP" },
    { key: "special", label: "⭐ Special" },
  ];

  function getBadgeCategory(b: any) {
  const id = String(b?.id ?? "");

  if (id.startsWith("streak_")) return "streak";

  if (
    ["first_solve", "solve_10", "solve_25", "solve_50", "hintless"].indexOf(id) !== -1
  ) {
    return "solve";
  }

  if (
    [
      "python_3",
      "python_pro",
      "js_3",
      "js_pro",
      "java_3",
      "java_pro",
      "c_pro",
      "cpp_pro",
      "html_pro",
      "css_pro",
      "polyglot",
    ].indexOf(id) !== -1
  ) {
    return "lang";
  }

  if (id.startsWith("xp_")) return "xp";

  return "special";
}

  const filteredBadges = badgeFilter === "all" ? BADGES : BADGES.filter(b => getBadgeCategory(b) === badgeFilter);

  return (
    <div className="page" style={{ paddingTop: 90, padding: "90px 24px 60px", maxWidth: 860, margin: "0 auto" }}>

      {/* ── HERO CARD ── */}
      <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: 0 }}>
        {/* Banner gradient */}
        <div style={{ height: 80, background: "linear-gradient(135deg,rgba(200,241,53,0.3),rgba(0,229,255,0.2),rgba(168,85,247,0.2))", position: "relative" }}>
          <div className="glow" style={{ width: 300, height: 200, background: "var(--lime)", top: "-80%", right: "5%" }} />
        </div>
        {/* Avatar + info */}
        <div style={{ padding: "0 28px 24px", position: "relative" }}>
          {/* Avatar overlapping banner */}
          <div style={{ marginTop: -36, marginBottom: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--card2)", border: "3px solid var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
              {user.avatar}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(200,241,53,0.15)", border: "1px solid rgba(200,241,53,0.3)", borderRadius: 50, padding: "4px 14px", fontSize: 12, fontWeight: 800, color: "var(--lime)" }}>
                ⚡ Level {currentLevel}
              </span>
              <span style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 50, padding: "4px 14px", fontSize: 12, fontWeight: 800, color: "var(--cyan)" }}>
                🏅 {earnedBadges.length}/{BADGES.length} Badges
              </span>
            </div>
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, marginBottom: 2 }}>{user.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>{user.email}</div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 12 }}>
            {[
              { icon: "⚡", value: (user.xp || 0).toLocaleString(), label: "Total XP", color: "var(--lime)" },
              { icon: "🔥", value: user.streak || 0, label: "Day Streak", color: "var(--orange)" },
              { icon: "✅", value: user.solved || 0, label: "Solved", color: "var(--cyan)" },
              { icon: "🏅", value: earnedBadges.length, label: "Badges", color: "var(--purple)" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg2)", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 22, color: s.color }}>{s.value}</div>
                <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP progress bar */}
          <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--bg2)", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Level {currentLevel} → Level {currentLevel + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--lime)" }}>{xpIntoLevel} / {xpPerLevel} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${(xpIntoLevel / xpPerLevel) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["stats", "badges", "uploads"].map((t) => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>
            {t === "badges" ? `Badges (${earnedBadges.length}/${BADGES.length})` : t === "stats" ? "Stats" : "Uploads"}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ── */}
      {tab === "stats" && (
        <div>
          {/* Language breakdown */}
          <div style={{ fontWeight: 800, marginBottom: 14, color: "var(--muted)", letterSpacing: 0.5, textTransform: "uppercase", fontSize: 12 }}>
            🌐 Language Breakdown
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
            {allLangs.map(lang => {
              const count = langCounts[lang] || 0;
              const max = 10;
              return (
                <div key={lang} className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{langIcons[lang]}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{lang}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>{count} / {max} solved</div>
                    </div>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-fill" style={{ width: `${(count / max) * 100}%`, background: count === 0 ? "rgba(255,255,255,0.1)" : "linear-gradient(90deg,var(--lime),var(--cyan))" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent achievements */}
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 14, color: "var(--muted)", letterSpacing: 0.5, textTransform: "uppercase" }}>
            🏅 Earned Badges
          </div>
          {earnedBadges.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>
              No badges yet — start solving challenges to earn your first one! 🐛
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {earnedBadges.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(200,241,53,0.1)", border: "1px solid rgba(200,241,53,0.25)", borderRadius: 50, padding: "6px 14px 6px 10px" }}>
                  <span style={{ fontSize: 18 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--lime)" }}>{b.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BADGES TAB ── */}
      {tab === "badges" && (
        <div>
          {/* Category filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {badgeCategories.map(cat => (
              <button key={cat.key}
                onClick={() => setBadgeFilter(cat.key)}
                style={{
                  padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 800, cursor: "pointer",
                  background: badgeFilter === cat.key ? "var(--lime)" : "var(--card2)",
                  color: badgeFilter === cat.key ? "#0a0a12" : "var(--muted)",
                  border: badgeFilter === cat.key ? "none" : "1px solid var(--border)",
                  transition: "all .2s",
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Summary line */}
          <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
            <span style={{ color: "var(--lime)", fontWeight: 800 }}>{earnedBadges.length}</span> earned · <span style={{ color: "var(--muted)" }}>{BADGES.length - earnedBadges.length} remaining</span>
          </div>

          {/* Badge cards with task progress */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredBadges.map((b, i) => {
              const earned = b.check(user, langCounts);
              const prog = getBadgeProgress(b);
              const pct = Math.min((prog.current / prog.target) * 100, 100);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: earned ? "rgba(200,241,53,0.06)" : "var(--card)",
                  border: `1px solid ${earned ? "rgba(200,241,53,0.3)" : "var(--border)"}`,
                  borderRadius: 16, padding: "16px 20px",
                  opacity: earned ? 1 : 0.85,
                  transition: "all .2s",
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                    background: earned ? "rgba(200,241,53,0.15)" : "var(--bg2)",
                    border: `2px solid ${earned ? "var(--lime)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, filter: earned ? "none" : "grayscale(1) opacity(0.5)",
                  }}>
                    {b.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{b.label}</span>
                      {earned && (
                        <span style={{ background: "rgba(200,241,53,0.2)", color: "var(--lime)", borderRadius: 50, padding: "1px 10px", fontSize: 11, fontWeight: 800 }}>
                          ✓ EARNED
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: earned ? 0 : 8 }}>
                      {b.desc}
                    </div>
                    {!earned && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Progress</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: pct >= 60 ? "var(--lime)" : "var(--muted)" }}>
                            {prog.current} / {prog.target}
                          </span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 50, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--lime)" : pct >= 50 ? "linear-gradient(90deg,var(--cyan),var(--lime))" : "var(--cyan)", borderRadius: 50, transition: "width .6s ease" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: lock or checkmark */}
                  <div style={{ flexShrink: 0, fontSize: 20 }}>
                    {earned ? "✅" : "🔒"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === "uploads" && (
        <div>
          <div
            className="card"
            style={{
              marginBottom: 20,
              background: canUpload
                ? "rgba(200,241,53,.05)"
                : "rgba(239,68,68,.05)",
              border: `1.5px solid ${
                canUpload ? "rgba(200,241,53,.3)" : "rgba(239,68,68,.2)"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                  {canUpload ? "✅ Upload Unlocked!" : "🔒 Upload Locked"}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.7,
                  }}
                >
                  {canUpload
                    ? `You've solved ${user.solved} challenges! Contribute your own buggy code.`
                    : `Solve ${
                        10 - user.solved
                      } more challenges to unlock uploads.`}
                </div>
              </div>
              {canUpload && (
                <button
                  className="btn-lime btn-sm"
                  style={{ padding: "10px 22px", flexShrink: 0 }}
                  onClick={() => setShowForm((v) => !v)}
                >
                  {showForm ? "✕ Cancel" : "+ Upload Buggy Code"}
                </button>
              )}
            </div>
            {!canUpload && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    Progress to unlock
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {user.solved} / 10
                  </span>
                </div>
                <div className="xp-bar">
                  <div
                    className="xp-fill"
                    style={{ width: `${(user.solved / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {submitted && (
            <div
              style={{
                background: "rgba(34,197,94,.1)",
                border: "1px solid rgba(34,197,94,.3)",
                borderRadius: 14,
                padding: "14px 20px",
                color: "var(--green)",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              🎉 Your buggy code has been submitted for review! It will appear
              in the community once approved.
            </div>
          )}

          {showForm && canUpload && (
            <div
              className="card"
              style={{
                marginBottom: 24,
                border: "1.5px solid rgba(200,241,53,.2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 20,
                  marginBottom: 20,
                  color: "var(--lime)",
                }}
              >
                🐛 Submit Buggy Code
              </div>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      TITLE *
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Broken Loop Counter"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      LANGUAGE *
                    </label>
                    <select
                      className="input-field"
                      value={form.lang}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lang: e.target.value }))
                      }
                      style={{ width: "100%" }}
                    >
                      {[
                        "Python",
                        "JavaScript",
                        "Java",
                        "C",
                        "C++",
                        "HTML",
                        "CSS",
                      ].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      DIFFICULTY *
                    </label>
                    <select
                      className="input-field"
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, difficulty: e.target.value }))
                      }
                      style={{ width: "100%" }}
                    >
                      {["easy", "medium", "hard"].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      ERROR TYPE *
                    </label>
                    <select
                      className="input-field"
                      value={form.errorType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, errorType: e.target.value }))
                      }
                      style={{ width: "100%" }}
                    >
                      {[
                        "Syntax",
                        "Logic",
                        "Runtime",
                        "Compile",
                        "Exception",
                      ].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    BUGGY CODE *
                  </label>
                  <textarea
                    className="input-field"
                    rows={7}
                    placeholder={
                      "def calculate(x):\n    return x * 2\n    print('done')  # bug here"
                    }
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      resize: "vertical",
                    }}
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      BUG LINE #{" "}
                      <span style={{ fontWeight: 600 }}>(0-indexed)</span>
                    </label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      placeholder="e.g. 2"
                      value={form.bugLine}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bugLine: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      FIXED LINE *
                    </label>
                    <input
                      className="input-field"
                      placeholder="Correct version of that line"
                      value={form.fixed}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fixed: e.target.value }))
                      }
                      style={{ fontFamily: "var(--mono)", fontSize: 13 }}
                      required
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      HINT FOR USERS *
                    </label>
                    <input
                      className="input-field"
                      placeholder="Guide without giving away the answer"
                      value={form.hint}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, hint: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      EXPECTED OUTPUT
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. 10"
                      value={form.expectedOutput}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          expectedOutput: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(0,229,255,.06)",
                    border: "1px solid rgba(0,229,255,.15)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 20,
                    fontSize: 12,
                    color: "var(--cyan)",
                    fontWeight: 600,
                  }}
                >
                  ℹ️ Your submission will be reviewed by a developer before
                  going live.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    className="btn-lime"
                    style={{ padding: "12px 28px" }}
                  >
                    Submit for Review 🚀
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {uploads.length > 0 ? (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
                📋 My Submissions ({uploads.length})
              </div>
              {uploads.map((u: any) => (
                <div key={u.id} className="card" style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {u.title}
                      </div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <span className={`tag tag-${u.difficulty}`}>
                          {u.difficulty.toUpperCase()}
                        </span>
                        <span className="tag tag-lang">{u.lang}</span>
                        <span className="chip">🐛 {u.errorType}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 50,
                        fontSize: 11,
                        fontWeight: 800,
                        background:
                          u.status === "approved"
                            ? "rgba(34,197,94,.15)"
                            : u.status === "rejected"
                            ? "rgba(239,68,68,.15)"
                            : "rgba(255,235,0,.1)",
                        color:
                          u.status === "approved"
                            ? "var(--green)"
                            : u.status === "rejected"
                            ? "var(--red)"
                            : "var(--yellow)",
                      }}
                    >
                      {u.status === "approved"
                        ? "✅ Approved"
                        : u.status === "rejected"
                        ? "❌ Rejected"
                        : "⏳ Pending Review"}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 10,
                      padding: 12,
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      maxHeight: 120,
                      overflow: "hidden",
                    }}
                  >
                    {u.code}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showForm && (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "var(--muted)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {canUpload
                  ? "No uploads yet. Share your first buggy challenge! 🐛"
                  : "Keep debugging to unlock this feature 💪"}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
export default Profile;