import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const DEV_QUEUE = [
  {
    id: 1,
    author: "Rahul K",
    avatar: "🐉",
    lang: "Python",
    title: "Wrong sort order",
    code: "arr.sort()\nprint(arr[::-1])",
    status: "pending",
  },
  {
    id: 2,
    author: "Sneha M",
    avatar: "🦋",
    lang: "JavaScript",
    title: "Promise chain bug",
    code: "fetch(url)\n  .then(r => r.text)\n  .then(console.log)",
    status: "pending",
  },
];

interface DevDashboardProps {
  onPublish: (upload: any) => void;
}

function Av({
  emoji,
  size = 42,
}: {
  emoji: string;
  size?: number;
}){
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

function DevDash({ onPublish }: DevDashboardProps) {
  const [queue, setQueue] = useState<any[]>(DEV_QUEUE);
  const [tab, setTab] = useState("upload");
  const [form, setForm] = useState({
    title: "",
    lang: "Python",
    difficulty: "easy",
    errorType: "Syntax",
    description: "",
    code: "",
    bugLine: "",
    fixed: "",
    hint: "",
    expectedOutput: "",
    xp: "80",
  });
  const [uploaded, setUploaded] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  // Load pending user submissions from Firestore
  useEffect(() => {
    /*const q = query(
      collection(db, "submissions"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setQueue([...DEV_QUEUE, ...items]);
    });
    return () => unsub();*/
  }, []);

  async function approve(id: string) {
    try {
      const item = queue.find((c) => c.id === id || c.firestoreId === id);
      if (item && item.id && typeof item.id === "string") {
        await updateDoc(doc(db, "submissions", item.id), {
          status: "approved",
        });
        // Promote to challenges so it appears in Dashboard/Levels
        const {
          id: _id,
          status: _s,
          firestoreId: _fid,
          submittedAt: _sa,
          ...challengeData
        } = item;
        await addDoc(collection(db, "challenges"), {
          ...challengeData,
          lines: challengeData.code
            ? challengeData.code.split("\n")
            : challengeData.lines || [],
          approved: true,
          approvedAt: serverTimestamp(),
        });
        if (onPublish)
          onPublish({
            ...challengeData,
            lines: challengeData.code?.split("\n") || challengeData.lines || [],
          });
      }
      setQueue((q) =>
        q.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
      );
    } catch (e) {
      console.error("Approve error:", e);
    }
  }

  async function reject(id: string) {
    try {
      if (typeof id === "string" && id.length > 5) {
        await updateDoc(doc(db, "submissions", id), { status: "rejected" });
      }
      setQueue((q) => q.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Reject error:", e);
    }
  }

  async function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadErr("");
    if (!form.title || !form.code || form.bugLine === "" || !form.fixed) {
      setUploadErr("Please fill in all required fields.");
      return;
    }
    try {
      const lines = form.code.split("\n");
      const newChallenge = {
        title: form.title,
        lang: form.lang,
        difficulty: form.difficulty,
        errorType: form.errorType,
        description: form.description || form.hint,
        lines,
        bugLine: parseInt(form.bugLine) || 0,
        fixed: form.fixed,
        hint: form.hint,
        expectedOutput: form.expectedOutput,
        xp: parseInt(form.xp) || 80,
        approved: true,
        source: "dev",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "challenges"), newChallenge);
      if (onPublish) onPublish({ ...newChallenge, id: Date.now() });
      setUploaded(true);
      setForm({
        title: "",
        lang: "Python",
        difficulty: "easy",
        errorType: "Syntax",
        description: "",
        code: "",
        bugLine: "",
        fixed: "",
        hint: "",
        expectedOutput: "",
        xp: "80",
      });
      setTimeout(() => setUploaded(false), 3000);
    } catch (e) {
      console.error("Upload error:", e);
      setUploadErr("Failed to upload. Check Firestore rules.");
    }
  }

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <span style={{ fontSize: 28 }}>🛠️</span>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 34 }}>
          Developer Panel
        </h1>
        <span
          className="tag"
          style={{ background: "rgba(168,85,247,.15)", color: "var(--purple)" }}
        >
          ADMIN
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          className={`tab${tab === "upload" ? " active" : ""}`}
          onClick={() => setTab("upload")}
        >
          📤 Upload Challenge
        </button>
        <button
          className={`tab${tab === "review" ? " active" : ""}`}
          onClick={() => setTab("review")}
        >
          👁️ Review Queue ({queue.filter((c) => c.status === "pending").length})
        </button>
      </div>

      {tab === "upload" && (
        <div className="card">
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 22,
              marginBottom: 20,
            }}
          >
            Upload New Buggy Challenge
          </div>
          {uploaded && (
            <div
              style={{
                background: "rgba(34,197,94,.1)",
                border: "1px solid rgba(34,197,94,.3)",
                borderRadius: 12,
                padding: "12px 18px",
                color: "var(--green)",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              ✅ Challenge published successfully! It will appear in Levels and
              Dashboard.
            </div>
          )}
          {uploadErr && (
            <div
              style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 12,
                padding: "12px 18px",
                color: "var(--red)",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              ⚠️ {uploadErr}
            </div>
          )}
          <form onSubmit={publish}>
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
                  placeholder="e.g. Off-by-one Loop"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
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
                  LANGUAGE
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
                  DIFFICULTY
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
                  ERROR TYPE
                </label>
                <select
                  className="input-field"
                  value={form.errorType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, errorType: e.target.value }))
                  }
                  style={{ width: "100%" }}
                >
                  {["Syntax", "Logic", "Runtime", "Compile", "Exception"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    )
                  )}
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
                DESCRIPTION (shown to users)
              </label>
              <input
                className="input-field"
                placeholder="e.g. This function should print 1–5 but the output is wrong."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
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
                rows={6}
                placeholder="Paste the buggy code here (one line per line)..."
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />
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
                  BUG LINE # * (0-indexed)
                </label>
                <input
                  className="input-field"
                  type="number"
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
                  placeholder="Correct version of the bug line"
                  value={form.fixed}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fixed: e.target.value }))
                  }
                  style={{ fontFamily: "var(--mono)", fontSize: 13 }}
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
                  HINT FOR USERS
                </label>
                <input
                  className="input-field"
                  placeholder="Give a helpful hint without revealing the answer"
                  value={form.hint}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hint: e.target.value }))
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
                  EXPECTED OUTPUT
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. 1\n2\n3"
                  value={form.expectedOutput}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expectedOutput: e.target.value }))
                  }
                  style={{ fontFamily: "var(--mono)", fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 20, maxWidth: 200 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                XP REWARD
              </label>
              <input
                className="input-field"
                type="number"
                placeholder="e.g. 80"
                value={form.xp}
                onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              className="btn-lime"
              style={{ padding: "13px 32px" }}
            >
              Publish Challenge 🚀
            </button>
          </form>
        </div>
      )}

      {tab === "review" && (
        <div>
          {queue.filter((c) => c.status === "pending").length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: "var(--muted)",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              ✅ All caught up! No pending submissions.
            </div>
          )}
          {queue.map((sub) => (
            <div key={sub.id} className="card" style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Av emoji={sub.avatar || "🚀"} size={38} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{sub.title}</div>
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      by {sub.author} · {sub.lang}
                    </div>
                  </div>
                </div>
                {sub.status === "approved" ? (
                  <span className="tag tag-easy">✓ Approved</span>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-lime btn-sm"
                      onClick={() => approve(sub.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      style={{
                        background: "rgba(239,68,68,.15)",
                        color: "var(--red)",
                        border: "1px solid rgba(239,68,68,.3)",
                        borderRadius: 50,
                        padding: "8px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                      onClick={() => reject(sub.id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 14,
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {sub.code}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default DevDash;