import { useEffect, useState } from "react";
import { saveUserProgress } from "../services/solutionService";

interface ChallengeProps {
  challenge: any;
  go: (page: string) => void;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: any;
}

function EmojiRain({ onDone }: { onDone: () => void }) {
  const emojis = ["🎉", "✨", "🔥", "💥", "🐛", "⚡", "🏆", "🎊", "💡", "🚀"];

  const p = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    e: emojis[i % emojis.length],
    l: Math.random() * 100,
    d: Math.random() * 1.4,
    dur: 1.8 + Math.random() * 1.2,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      {p.map((x) => (
        <span
          key={x.id}
          className="emoji-particle"
          style={{
            left: `${x.l}%`,
            top: 0,
            animationDelay: `${x.d}s`,
            animationDuration: `${x.dur}s`,
          }}
        >
          {x.e}
        </span>
      ))}
    </>
  );
}

function Challenge({
  challenge,
  go,
  setUser,
  user,
}: ChallengeProps) {
      const [selLine, setSelLine] = useState<number | null>(null);
      const [lines, setLines] = useState([...challenge.lines]);
      const [editing, setEditing] = useState(false);
      const [editVal, setEditVal] = useState("");
      const [output, setOutput] = useState<string | null>(null);
      const [hintOn, setHintOn] = useState(false);
      const [submitted, setSubmitted] = useState(false);
      const [celebration, setCelebration] = useState(false);
      const [status, setStatus] = useState<
        "idle" | "running" | "success" | "fail"
      >("idle");
      const [seconds, setSeconds] = useState(0);
      const [timerActive, setTimerActive] = useState(true); // ← MOVED UP
    
      useEffect(() => {
        if (!timerActive) return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
      }, [timerActive]);
    
      function selectLine(i: number) {
        if (submitted) return;
        setSelLine(i);
        setEditVal(lines[i]);
        setEditing(true);
        setOutput(null);
      }
    
      function applyFix() {
        if (selLine === null) return;
        const u = [...lines];
        // Support multi-line fixes: split on newline and splice in
        const fixLines = editVal.split("\n");
        u.splice(selLine, 1, ...fixLines);
        setLines(u);
        setEditing(false);
        setOutput(null);
      }
    
      async function runCode() {
        setStatus("running");
        setOutput(null);
    
        const langIds: Record<string, number | null> = {
          Python: 71,
          JavaScript: 63,
          Java: 62,
          C: 50,
          "C++": 54,
          HTML: null,
          CSS: null,
        };
        const langId = langIds[challenge.lang];
        if (!langId) {
          const isFixed = lines[challenge.bugLine] === challenge.fixed;
          setTimeout(() => {
            if (isFixed) {
              setOutput("✅ " + challenge.expectedOutput);
              setStatus("success");
            } else {
              setOutput("❌ Not fixed yet. Check line " + (challenge.bugLine + 1));
              setStatus("fail");
            }
          }, 600);
          return;
        }
    
        const sourceCode = lines.join("\n");
    
        try {
          const submitRes = await fetch(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source_code: sourceCode,
                language_id: langId,
                stdin: "",
              }),
            }
          );
    
          const result = await submitRes.json();
          const stdout = result.stdout?.trim();
          const stderr = result.stderr?.trim();
          const compileErr = result.compile_output?.trim();
          const statusDesc = result.status?.description;
    
          if (stdout) {
            const isCorrect = stdout === challenge.expectedOutput.trim();
            if (isCorrect) {
              setOutput(stdout);
              setStatus("success");
            } else {
              setOutput(stdout + "\n\n⚠️ Expected:\n" + challenge.expectedOutput);
              setStatus("fail");
            }
          } else if (stderr) {
            setOutput("❌ Runtime Error:\n" + stderr);
            setStatus("fail");
          } else if (compileErr) {
            setOutput("❌ Compile Error:\n" + compileErr);
            setStatus("fail");
          } else {
            setOutput("⚠️ Status: " + statusDesc);
            setStatus("fail");
          }
        } catch (err) {
          const isFixed = lines[challenge.bugLine] === challenge.fixed;
          if (isFixed) {
            setOutput(challenge.expectedOutput);
            setStatus("success");
          } else {
            setOutput(
              "❌ Bug not fixed yet. Check line " + (challenge.bugLine + 1)
            );
            setStatus("fail");
          }
        }
      }
    
      async function submit() {
        setTimerActive(false);
        if (status !== "success") return;
        setSubmitted(true);
        setCelebration(true);
    
        // Calculate streak
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = 1;
        if (user.lastSolvedDate === today) {
          newStreak = user.streak; // already solved today, keep streak
        } else if (user.lastSolvedDate === yesterday) {
          newStreak = user.streak + 1; // consecutive day
        } else {
          newStreak = 1; // streak broken
        }
    
        const alreadySolved = (user.solvedChallenges || []).includes(challenge.id);
        const xpGained = alreadySolved ? 0 : challenge.xp;
        const solvedInc = alreadySolved ? 0 : 1;
    
        // If this is a daily challenge, mark lastDailyDate so they can't redo it today
        const isDailyDone = challenge.isDailyChallenge ? { lastDailyDate: today } : {};
    
        const updates = {
          xp: user.xp + xpGained,
          solved: user.solved + solvedInc,
          streak: newStreak,
          lastSolvedDate: today,
          solvedChallenges: alreadySolved
            ? user.solvedChallenges
            : [...(user.solvedChallenges || []), challenge.id],
          ...isDailyDone,
        };
    
        // Persist to Firestore
        try {
  await saveUserProgress(user.uid, updates);
} catch (e) {
  console.error("Failed to save progress:", e);
}
    
        setUser((u: any) => ({ ...u, ...updates }));
      }
    
      // Timer color: green → orange → red
      const timerColor =
        seconds > 120
          ? "var(--red)"
          : seconds > 60
          ? "var(--orange)"
          : "var(--green)";
      const minutes = Math.floor(seconds / 60);
const secondsValue = seconds % 60;
const secondsText =
  String(secondsValue).length === 1
    ? "0" + secondsValue
    : String(secondsValue);

const timerDisplay = `${minutes}:${secondsText}`;
    
      return (
        <div
          className="page"
          style={{
            paddingTop: 90,
            padding: "90px 24px 60px",
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          {celebration && <EmojiRain onDone={() => setCelebration(false)} />}
    
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 22,
              flexWrap: "wrap",
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
              }}
              onClick={() => go("dashboard")}
            >
              ← Back
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <span className={`tag tag-${challenge.difficulty}`}>
                  {challenge.difficulty.toUpperCase()}
                </span>
                <span className="tag tag-lang">{challenge.lang}</span>
                <span className="chip">🐛 {challenge.errorType}</span>
              </div>
              <h1 style={{ fontFamily: "var(--display)", fontSize: 28 }}>
                {challenge.title}
              </h1>
            </div>
    
            {/* XP + Timer side by side */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 22,
                  color: "var(--lime)",
                }}
              >
                +{challenge.xp} XP
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: timerColor,
                  background: "var(--card2)",
                  border: `1.5px solid ${timerColor}`,
                  padding: "4px 14px",
                  borderRadius: 50,
                  transition: "color .5s, border-color .5s",
                }}
              >
                ⏱️ {timerDisplay}
              </div>
            </div>
          </div>
    
          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              marginBottom: 22,
              fontWeight: 600,
              lineHeight: 1.7,
            }}
          >
            👆{" "}
            <strong style={{ color: "var(--text)" }}>Click the buggy line</strong>{" "}
            to select and edit it inline. Run to verify, then Submit.
          </p>
    
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* Code panel */}
            <div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    background: "var(--card2)",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "var(--red)",
                    }}
                  />
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                    }}
                  />
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "var(--green)",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: 8,
                      color: "var(--muted)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    bug_challenge.
                    {challenge.lang === "JavaScript"
                      ? "js"
                      : challenge.lang === "Java"
                      ? "java"
                      : challenge.lang === "C"
                      ? "c"
                      : challenge.lang === "C++"
                      ? "cpp"
                      : challenge.lang === "HTML"
                      ? "html"
                      : challenge.lang === "CSS"
                      ? "css"
                      : "py"}
                  </span>
                </div>
                <div style={{ padding: "16px 8px" }}>
                  {lines.map((ln, i) => (
                    <span
                      key={i}
                      className={`code-line${selLine === i ? " selected" : ""}${
                        submitted && i === challenge.bugLine ? " correct" : ""
                      }`}
                      onClick={() => selectLine(i)}
                    >
                      <span
                        style={{
                          color: "var(--muted)",
                          marginRight: 16,
                          fontSize: 11,
                          userSelect: "none",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          color:
                            i === challenge.bugLine && !submitted
                              ? "var(--red)"
                              : "var(--text)",
                        }}
                      >
                        {ln || " "}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
    
              {editing && !submitted && (
                <div className="card" style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                    ✏️ Edit Line {selLine! + 1}
                  </div>
                  <textarea
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    rows={Math.max(2, editVal.split("\n").length + 1)}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1.5px solid var(--lime)",
                      borderRadius: 10,
                      padding: 12,
                      color: "var(--text)",
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      resize: "vertical",
                      whiteSpace: "pre",
                      overflowWrap: "normal",
                      overflowX: "auto",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn-lime btn-sm" onClick={applyFix}>
                      Apply Fix ✓
                    </button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
    
            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card">
                <button
                  style={{
                    width: "100%",
                    background: "rgba(255,235,0,.07)",
                    border: "1.5px solid rgba(255,235,0,.2)",
                    borderRadius: 12,
                    padding: "12px 18px",
                    color: "var(--yellow)",
                    fontWeight: 800,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => setHintOn((v) => !v)}
                >
                  💡 {hintOn ? "Hide Hint" : "Show Hint"}
                </button>
                {hintOn && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 14,
                      background: "rgba(255,235,0,.05)",
                      border: "1px dashed rgba(255,235,0,.2)",
                      borderRadius: 10,
                      color: "var(--yellow)",
                      fontSize: 14,
                      lineHeight: 1.75,
                      fontWeight: 600,
                    }}
                  >
                    {challenge.hint}
                  </div>
                )}
              </div>
    
              <div className="card">
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                  ⚡ Run & Test
                </div>
                <button
                  className="btn-lime"
                  style={{
                    width: "100%",
                    padding: 12,
                    fontSize: 14,
                    opacity: status === "running" ? 0.6 : 1,
                  }}
                  onClick={runCode}
                  disabled={status === "running"}
                >
                  {status === "running" ? "Running..." : "▶ Run Code"}
                </button>
                {output && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 14,
                      background: "var(--bg)",
                      borderRadius: 10,
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      lineHeight: 1.8,
                      border: `1px solid ${
                        status === "success" ? "var(--green)" : "var(--red)"
                      }`,
                      color: status === "success" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 11,
                        color: "var(--muted)",
                        fontWeight: 700,
                      }}
                    >
                      OUTPUT:
                    </div>
                    {output}
                  </div>
                )}
              </div>
    
              {!submitted && (
                <button
                  className="btn-lime"
                  style={{
                    padding: 14,
                    fontSize: 15,
                    opacity: status === "success" ? 1 : 0.35,
                  }}
                  disabled={status !== "success"}
                  onClick={submit}
                >
                  🚀 Submit Solution
                </button>
              )}
    
              {submitted && (
                <div
                  className="card"
                  style={{
                    textAlign: "center",
                    border: "2px solid var(--lime)",
                    background: "rgba(200,241,53,.05)",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 26,
                      color: "var(--lime)",
                      marginBottom: 4,
                    }}
                  >
                    Bug Squashed!
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    +{challenge.xp} XP earned 🏆
                  </div>
                  {/* Show final time */}
                  <div
                    style={{
                      color: timerColor,
                      fontFamily: "var(--mono)",
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 16,
                    }}
                  >
                    ⏱️ Solved in {timerDisplay}
                  </div>
                  <button
                      className="btn-lime"
                      onClick={() => go(challenge.returnPage || "dashboard")}
                  >
                     Next Challenge →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    export default Challenge;