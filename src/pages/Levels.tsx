import { useState } from "react";

interface LevelsProps {
  go: (page: string) => void;
  pickChallenge: (challenge: any) => void;
  devChallenges: any[];
  user: any;
}

function Levels({
  go,
  pickChallenge,
  devChallenges,
  user,
}: LevelsProps) {
  const [sel, setSel] = useState<any>(null); // selected language
  const [selTopic, setSelTopic] = useState<any>(null); // selected topic
  const [selDiff, setSelDiff] = useState<any>(null); // selected difficulty
  const [completedLevels, setCompletedLevels] = useState<Record<string, number>>({});

  const TOPICS = [
    { id: "Syntax", label: "Syntax Errors", icon: "📝", color: "var(--cyan)" },
    { id: "Logic", label: "Logic Errors", icon: "🧠", color: "var(--purple)" },
    { id: "Runtime", label: "Runtime Errors", icon: "💥", color: "var(--red)" },
    {
      id: "Compile",
      label: "Compile Errors",
      icon: "⚙️",
      color: "var(--orange)",
    },
    { id: "Exception", label: "Exceptions", icon: "🚨", color: "var(--pink)" },
  ];

  const DIFFICULTIES = [
    { id: "easy", label: "Easy", icon: "🟢", color: "var(--green)" },
    { id: "medium", label: "Medium", icon: "🟡", color: "var(--yellow)" },
    { id: "hard", label: "Hard", icon: "🔴", color: "var(--red)" },
  ];

  const levelEmojis = [
    "🐣",
    "🐛",
    "🔍",
    "⚡",
    "🔥",
    "🎯",
    "💡",
    "🚀",
    "⭐",
    "🏆",
  ];

  // Build language list from devChallenges
  const langGroups: Record<string, any[]> = {};
  devChallenges.forEach((c) => {
    if (!langGroups[c.lang]) langGroups[c.lang] = [];
    langGroups[c.lang].push(c);
  });
  const langList = [
    { lang: "Python", icon: "🐍" },
    { lang: "JavaScript", icon: "💛" },
    { lang: "Java", icon: "☕" },
    { lang: "C", icon: "🔵" },
    { lang: "C++", icon: "🟣" },
    { lang: "HTML", icon: "🌐" },
    { lang: "CSS", icon: "🎨" },
  ].filter((l) => langGroups[l.lang]?.length > 0);

  // ── SCREEN 1: Language selection ──
  if (!sel)
    return (
      <div
        className="page"
        style={{
          paddingTop: 90,
          padding: "90px 24px 60px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: 38,
            marginBottom: 8,
          }}
        >
          Choose Your Language 🗺️
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Select a language to start your debugging path.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 20,
          }}
        >
          {langList.map((lp) => {
            const total = langGroups[lp.lang]?.length || 0;
            return (
              <div
                key={lp.lang}
                className="card"
                style={{ cursor: "pointer", textAlign: "center", padding: 32 }}
                onClick={() => {
                  setSel(lp);
                  setSelTopic(null);
                  setSelDiff(null);
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>{lp.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 24,
                    marginBottom: 6,
                  }}
                >
                  {lp.lang}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {total} challenges
                </div>
                <button className="btn-lime btn-sm">Start Path →</button>
              </div>
            );
          })}
        </div>
      </div>
    );

  // ── SCREEN 2: Topic selection ──
  if (!selTopic) {
    const langChallenges = langGroups[sel.lang] || [];
    return (
      <div
        className="page"
        style={{
          paddingTop: 90,
          padding: "90px 24px 60px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <button
          style={{
            background: "var(--card2)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "8px 16px",
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 28,
          }}
          onClick={() => setSel(null)}
        >
          ← Languages
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 40 }}>{sel.icon}</span>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 34 }}>
            {sel.lang}
          </h1>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Choose a topic to practice.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {TOPICS.map((topic) => {
            const count = langChallenges.filter(
              (c) => c.errorType === topic.id
            ).length;
            if (count === 0) return null;
            return (
              <div
                key={topic.id}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 28,
                  textAlign: "center",
                  border: `1px solid ${topic.color}22`,
                }}
                onClick={() => setSelTopic(topic)}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>
                  {topic.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 20,
                    marginBottom: 6,
                  }}
                >
                  {topic.label}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  {count} challenge{count !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "4px 14px",
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${topic.color}18`,
                    color: topic.color,
                  }}
                >
                  Explore →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SCREEN 3: Difficulty selection ──
  if (!selDiff) {
    const topicChallenges = (langGroups[sel.lang] || []).filter(
      (c) => c.errorType === selTopic.id
    );
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
        <button
          style={{
            background: "var(--card2)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "8px 16px",
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 28,
          }}
          onClick={() => setSelTopic(null)}
        >
          ← Topics
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 36 }}>{selTopic.icon}</span>
          <div>
            <div
              style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}
            >
              {sel.icon} {sel.lang}
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 30 }}>
              {selTopic.label}
            </h1>
          </div>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Pick your difficulty level.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
          }}
        >
          {DIFFICULTIES.map((diff) => {
            const count = topicChallenges.filter(
              (c) => c.difficulty === diff.id
            ).length;
            if (count === 0) return null;
            return (
              <div
                key={diff.id}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 32,
                  textAlign: "center",
                  border: `1px solid ${diff.color}33`,
                }}
                onClick={() => setSelDiff(diff)}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {diff.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 24,
                    marginBottom: 6,
                    textTransform: "capitalize",
                  }}
                >
                  {diff.label}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {count} challenge{count !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "5px 16px",
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 800,
                    background: `${diff.color}18`,
                    color: diff.color,
                  }}
                >
                  Start
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SCREEN 4: Level path ──
  const pathKey = `${sel.lang}-${selTopic.id}-${selDiff.id}`;
  const challenges = (langGroups[sel.lang] || []).filter(
    (c) => c.errorType === selTopic.id && c.difficulty === selDiff.id
  );
  
  const solvedIds = user?.solvedChallenges || [];

  let done = 0;

  for (let i = 0; i < challenges.length; i++) {
    if (solvedIds.includes(challenges[i].id)) {
      done++;
    } else {
      break;
    }
  }
  function handleLevelClick(index: number) {
  if (index > done) return;

  const c = challenges[index];
  if (!c) return;

  pickChallenge({
    ...c,
    returnPage: "levels",
  });

  go("challenge");
}

  return (
    <div
      className="page"
      style={{
        paddingTop: 90,
        padding: "90px 24px 60px",
        maxWidth: 480,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <button
        style={{
          background: "var(--card2)",
          border: "1px solid var(--border)",
          borderRadius: 50,
          padding: "8px 16px",
          color: "var(--muted)",
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 24,
        }}
        onClick={() => setSelDiff(null)}
      >
        ← Difficulty
      </button>

      <div style={{ fontSize: 40, marginBottom: 6 }}>{selTopic.icon}</div>
      <div
        style={{
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {sel.icon} {sel.lang} · {selTopic.label}
      </div>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontSize: 30,
          marginBottom: 6,
          textTransform: "capitalize",
        }}
      >
        {selDiff.label} Path
      </h2>
      <p
        style={{
          color: "var(--muted)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {done} / {challenges.length} levels completed 🔥
      </p>

      {/* Progress bar */}
      <div className="xp-bar" style={{ maxWidth: 300, margin: "0 auto 40px" }}>
        <div
          className="xp-fill"
          style={{
            width: `${
              challenges.length > 0 ? (done / challenges.length) * 100 : 0
            }%`,
          }}
        />
      </div>

      {/* Level nodes */}
      {challenges.map((c, i) => {
        const isDone = i < done;
        const isActive = i === done;
        const isLocked = i > done;
        const nodeClass = isDone ? "done" : isActive ? "active" : "locked";
        const emoji = levelEmojis[i % levelEmojis.length];

        return (
          <div key={c.id || i}>
            <div
              className={`level-node ${nodeClass}`}
              onClick={() => handleLevelClick(i)}
              title={
                isLocked
                  ? "Complete previous level first"
                  : isActive
                  ? "Current level — click to play!"
                  : `Completed! ${c.title}`
              }
            >
              <span style={{ fontSize: 22 }}>{emoji}</span>
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "var(--cyan)",
                    color: "#0a0a12",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "2px 6px",
                    borderRadius: 50,
                  }}
                >
                  NOW
                </span>
              )}
              {isDone && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "var(--lime)",
                    color: "#0a0a12",
                    fontSize: 10,
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </span>
              )}
              {isLocked && (
                <span style={{ position: "absolute", fontSize: 16 }}>🔒</span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 4,
                color: isDone
                  ? "var(--lime)"
                  : isActive
                  ? "var(--cyan)"
                  : "var(--muted)",
              }}
            >
              {isDone || isActive ? c.title : "???"}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--muted)",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {isDone || isActive ? `+${c.xp} XP` : ""}
            </div>
            {i < challenges.length - 1 && (
              <div
                className={`level-conn${isDone ? " done" : ""}`}
                style={{ margin: "4px auto" }}
              />
            )}
          </div>
        );
      })}

      {/* Completion message */}
      {done === challenges.length && challenges.length > 0 && (
        <div
          className="card"
          style={{
            marginTop: 32,
            textAlign: "center",
            border: "2px solid var(--lime)",
            background: "rgba(200,241,53,.05)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 22,
              color: "var(--lime)",
              marginBottom: 8,
            }}
          >
            {selDiff.label} {selTopic.label} Mastered!
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            All {challenges.length} levels cleared. Amazing! 🎉
          </div>
        </div>
      )}
    </div>
  );
}
export default Levels;
