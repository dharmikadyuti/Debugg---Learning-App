import { useEffect, useState } from "react";
import { getLeaderboardUsers } from "../services/leaderboardService";

const USERS_LB = [
  {
    id: 1,
    name: "Aarav Shah",
    avatar: "🦊",
    xp: 4820,
    streak: 14,
    solved: 62,
    lang: "Python",
  },
  {
    id: 2,
    name: "Priya Nair",
    avatar: "🐼",
    xp: 4210,
    streak: 9,
    solved: 55,
    lang: "JavaScript",
  },
  {
    id: 3,
    name: "You",
    avatar: "🚀",
    xp: 1340,
    streak: 5,
    solved: 18,
    lang: "Python",
  },
  {
    id: 4,
    name: "Rahul K",
    avatar: "🐉",
    xp: 3900,
    streak: 21,
    solved: 48,
    lang: "Java",
  },
  {
    id: 5,
    name: "Sneha M",
    avatar: "🦋",
    xp: 2750,
    streak: 7,
    solved: 34,
    lang: "Python",
  },
  {
    id: 6,
    name: "Dev R",
    avatar: "🐺",
    xp: 2100,
    streak: 3,
    solved: 27,
    lang: "JavaScript",
  },
];

function Av({
  emoji,
  size = 42,
}: {
  emoji: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--card2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}

function Leaderboard() {
  const [tab, setTab] = useState("global");
  const [lbUsers, setLbUsers] = useState<any[]>(USERS_LB);
  const medals = ["🥇", "🥈", "🥉"];

  // Load real users from Firestore
  useEffect(() => {
  async function loadUsers() {
    try {
      const realUsers = await getLeaderboardUsers();

      if (realUsers.length > 0) {
        setLbUsers(realUsers);
      }
    } catch (e) {
      console.error("Leaderboard load error:", e);
    }
  }

  loadUsers();
}, []);

  const sorted = [...lbUsers].sort((a, b) => b.xp - a.xp);
  return (
    <div
      className="page"
      style={{
        paddingTop: 90,
        padding: "90px 24px 60px",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontFamily: "var(--display)", fontSize: 38, marginBottom: 6 }}
      >
        Leaderboard 🏆
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 28,
        }}
      >
        Top debuggers this week. Keep grinding! 💪
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <button
          className={`tab${tab === "global" ? " active" : ""}`}
          onClick={() => setTab("global")}
        >
          🌍 Global
        </button>
        <button
          className={`tab${tab === "local" ? " active" : ""}`}
          onClick={() => setTab("local")}
        >
          👥 My Group
        </button>
      </div>
      {(tab === "global" ? sorted : sorted.slice(0, 3)).map((u, i) => (
        <div
          key={u.id}
          className="lb-row"
          style={{
            background: u.name === "You" ? "rgba(200,241,53,.04)" : "",
            border: u.name === "You" ? "1px solid rgba(200,241,53,.2)" : "",
          }}
        >
          <span
            style={{
              fontFamily: "var(--display)",
              fontSize: 18,
              minWidth: 32,
              color: i < 3 ? "var(--yellow)" : "var(--muted)",
            }}
          >
            {i < 3 ? medals[i] : i + 1}
          </span>
          <Av emoji={u.avatar} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {u.name}
              {u.name === "You" && (
                <span
                  style={{ color: "var(--lime)", fontSize: 12, marginLeft: 8 }}
                >
                  ← you
                </span>
              )}
            </div>
            <div
              style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}
            >
              🐛 {u.solved} solved · 🔥 {u.streak} streak · {u.lang}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--display)",
                color: "var(--lime)",
                fontSize: 20,
              }}
            >
              {u.xp.toLocaleString()}
            </div>
            <div
              style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700 }}
            >
              XP
            </div>
          </div>
        </div>
      ))}
      {tab === "local" && (
        <p
          style={{
            color: "var(--muted)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Showing your group · Create one from Discuss → connect with users
        </p>
      )}
    </div>
  );
}
export default Leaderboard;