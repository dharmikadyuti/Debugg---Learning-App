import CHALLENGES from "../data/challenges";
import DailyChallenge from "../components/DailyChallenge";
import { useEffect, useState } from "react";
import { getFirestoreChallenges } from "../services/challengeService";

interface DashboardProps {
  user: any;
  go: (page: string) => void;
  pickChallenge: (challenge: any) => void;
}
function Dashboard({
  user,
  go,
  pickChallenge,
}: DashboardProps) {
    const [filter, setFilter] = useState("All");
    const [extraChallenges, setExtraChallenges] = useState<any[]>([]);
    const langs = [
    "All",
    "Python",
    "JavaScript",
    "Java",
    "C",
    "C++",
    "HTML",
    "CSS",
    ];
    
      // Load admin-uploaded challenges from Firestore
    useEffect(() => {
  async function loadFirestoreChallenges() {
    try {
      const firestoreChallenges = await getFirestoreChallenges();
      setExtraChallenges(firestoreChallenges);
    } catch (e) {
      console.error("Failed to load Firestore challenges:", e);
    }
  }

  loadFirestoreChallenges();
}, []);
    
    const allChallenges = [...CHALLENGES, ...extraChallenges];
    const shown =
    filter === "All" ? allChallenges : allChallenges.filter((c) => c.lang === filter);
    
    return (
    <div
        className="page"
        style={{
        paddingTop: 90,
        padding: "90px 24px 60px",
        maxWidth: 1100,
        margin: "0 auto",
        }}
        >
        {/* Welcome header */}
        <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
        }}
        >
        <div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 36 }}>
            Hey, {user.name.split(" ")[0]} {user.avatar} 👋
            </h1>
            <p
            style={{
                color: "var(--muted)",
                fontSize: 15,
                fontWeight: 600,
                marginTop: 4,
            }}
            >
            Ready to squash some bugs today?
            </p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
            { v: user.xp.toLocaleString(), l: "XP TOTAL", c: "var(--lime)" },
            { v: "🔥 " + user.streak, l: "STREAK", c: "var(--orange)" },
            { v: user.solved, l: "SOLVED", c: "var(--cyan)" },
            ].map((s) => (
            <div
                key={s.l}
                className="card"
                style={{
                padding: "14px 24px",
                textAlign: "center",
                minWidth: 100,
                }}
            >
            <div
                style={{
                    fontFamily: "var(--display)",
                    fontSize: 26,
                    color: s.c,
                }}
                >
                {s.v}
                </div>
                <div
                style={{
                    color: "var(--muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 4,
                }}
                >
                {s.l}
                </div>
            </div>
            ))}
        </div>
        </div>
    
        {/* ⚡ DAILY CHALLENGE CARD */}
        <DailyChallenge go={go} pickChallenge={pickChallenge} user={user} />
    
        {/* XP Progress */}
        <div className="card" style={{ marginBottom: 28, padding: 20 }}>
        <div
            style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            }}
        >
            <span style={{ fontWeight: 800, fontSize: 14 }}>
            Level 4 Progress
            </span>
            <span
            style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}
            >
            {user.xp} / 2000 XP
            </span>
        </div>
        <div className="xp-bar">
            <div
            className="xp-fill"
            style={{ width: `${(user.xp / 2000) * 100}%` }}
            />
        </div>
        <div
            style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--muted)",
            fontWeight: 600,
            }}
        >
            {2000 - user.xp} XP to Level 5 🎯
        </div>
        </div>
    
        {/* Language filter tabs */}
        <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
        >
        {langs.map((l) => (
            <button
            key={l}
            className={`tab${filter === l ? " active" : ""}`}
            onClick={() => setFilter(l)}
            >
            {l}
            </button>
        ))}
        </div>
    
        {/* Challenge cards */}
        <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
            gap: 18,
        }}
        >
        {shown.map((c) => (
            <div
            key={c.id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => {
                pickChallenge(c);
                go("challenge");
            }}
            >
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
                }}
            >
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className={`tag tag-${c.difficulty}`}>
                    {c.difficulty.toUpperCase()}
                </span>
                <span className="tag tag-lang">{c.lang}</span>
                </div>
                <span
                style={{
                    fontFamily: "var(--display)",
                    color: "var(--lime)",
                    fontSize: 14,
                }}
                >
                +{c.xp} XP
                </span>
            </div>
            <h3
                style={{
                fontFamily: "var(--display)",
                fontSize: 18,
                marginBottom: 6,
                }}
            >
                {c.title}
            </h3>
            <p
                style={{
                color: "var(--muted)",
                fontSize: 13,
                marginBottom: 14,
                lineHeight: 1.6,
                }}
            >
                {c.description}
            </p>
            <div
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                }}
            >
                <span className="chip">🐛 {c.errorType}</span>
                <button
                className="btn-lime btn-sm"
                style={{ padding: "8px 16px", fontSize: 12 }}
                >
                Debug →
                </button>
            </div>
            </div>
        ))}
        </div>
    </div>
    );
}
export default Dashboard;
