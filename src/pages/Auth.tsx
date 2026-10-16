import { FirebaseError } from "firebase/app";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

interface AuthProps {
  mode: "login" | "signup" | "devlogin";
  go: (page: string) => void;
  setUser: (user: any) => void;
}
function Auth({ mode, go, setUser }: AuthProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const isDev = mode === "devlogin";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    if (isDev) {
      if (email === "admin@debugg.com" && pass === "admin123") {
        setUser({
          name: "Dev Admin",
          email,
          avatar: "🛠️",
          role: "dev",
          xp: 0,
          streak: 0,
          solved: 0,
        });
        go("devdash");
      } else {
        setErr("Invalid dev credentials. Use admin@debugg.com / admin123");
      }
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        if (!name) {
          setErr("Please enter your name.");
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
        const newUserData = {
          name,
          email: cred.user.email,
          uid: cred.user.uid,
          avatar: "🚀",
          role: "user",
          xp: 0,
          streak: 0,
          solved: 0,
          lastSolvedDate: null,
          solvedChallenges: [],
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", cred.user.uid), newUserData);
        setUser(newUserData);
        go("dashboard");
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: cred.user.uid });
        } else {
          const fallbackData = {
            name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
            email: cred.user.email,
            uid: cred.user.uid,
            avatar: "🚀",
            role: "user",
            xp: 0,
            streak: 0,
            solved: 0,
            lastSolvedDate: null,
            solvedChallenges: [],
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "users", cred.user.uid), fallbackData);
          setUser(fallbackData);
        }
        go("dashboard");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use")
        setErr("Email already registered. Try logging in.");
      else if (error.code === "auth/weak-password")
        setErr("Password must be at least 6 characters.");
      else if (error.code === "auth/user-not-found")
        setErr("No account found. Sign up first.");
      else if (error.code === "auth/wrong-password")
        setErr("Wrong password. Try again.");
      else if (error.code === "auth/invalid-email")
        setErr("Invalid email address.");
      else if (error.code === "auth/too-many-requests")
        setErr("Too many attempts. Try again later.");
      else if (error.code === "auth/invalid-credential")
        setErr("Invalid email or password.");
      else setErr(error.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setErr("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // Ensure the user doc exists in Firestore; onAuthStateChanged will
      // pick up the signed-in user and navigate to dashboard automatically.
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) {
        const newUserData = {
          name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
          email: cred.user.email,
          uid: cred.user.uid,
          avatar: "🚀",
          role: "user",
          xp: 0,
          streak: 0,
          solved: 0,
          lastSolvedDate: null,
          solvedChallenges: [],
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", cred.user.uid), newUserData);
      }
      // Do NOT call go("dashboard") here — user state is async.
      // onAuthStateChanged below will set user + navigate once state is ready.
    } catch (error: any) {
      // ALWAYS log the real error to the console — the message shown in the
      // UI was hiding it before, which is why you couldn't tell what broke.
      console.error("Google sign-in error:", error.code, error.message);

      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/operation-not-supported-in-this-environment"
      ) {
        // Popups are commonly blocked inside sandboxed previews
        // (CodeSandbox / StackBlitz / embedded iframes). Fall back to a
        // full-page redirect flow instead.
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          return; // page will navigate away; result is handled on return
        } catch (redirectErr: any) {
          console.error("Google redirect sign-in error:", redirectErr);
          setErr(
            "Google sign-in popup was blocked and redirect sign-in also failed: " +
              redirectErr.message
          );
        }
      } else if (error.code === "auth/unauthorized-domain") {
        setErr(
          "This domain isn't authorized for Google sign-in. Add it under Firebase Console → Authentication → Settings → Authorized domains."
        );
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setErr(
          "An account already exists with this email using a different sign-in method."
        );
      } else {
        setErr("Google sign-in failed: " + (error.message || error.code));
      }
    }
    setLoading(false);
  }

  return (
    <div
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="glow"
        style={{
          width: 500,
          height: 500,
          background: "var(--lime)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="card"
        style={{
          maxWidth: 440,
          width: "100%",
          position: "relative",
          zIndex: 1,
          padding: 40,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 28,
              background: "linear-gradient(90deg,var(--lime),var(--cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 8,
            }}
          >
            {isDev
              ? "🛠️ Developer Login"
              : isSignup
              ? "Join Debugg 🚀"
              : "Welcome Back 👋"}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            {isDev
              ? "Admin access only"
              : isSignup
              ? "Start your debugging journey"
              : "Continue debugging"}
          </p>
        </div>

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {isSignup && (
            <input
              className="input-field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="input-field"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Password (min 6 chars)"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          {err && (
            <div
              style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "var(--red)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ⚠️ {err}
            </div>
          )}

          <button
            type="submit"
            className="btn-lime"
            style={{
              marginTop: 8,
              width: "100%",
              padding: 15,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isDev
              ? "Access Dev Panel"
              : isSignup
              ? "Create Account 🚀"
              : "Login →"}
          </button>
        </form>

        {/* Firebase badge */}
        {/* Google Sign-In — only show for login/signup, not devlogin */}
        {!isDev && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "20px 0 4px",
              }}
            >
              <div
                style={{ flex: 1, height: 1, background: "var(--border)" }}
              />
              <span
                style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}
              >
                OR
              </span>
              <div
                style={{ flex: 1, height: 1, background: "var(--border)" }}
              />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 50,
                background: "#fff",
                color: "#1a1a1a",
                fontWeight: 800,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                border: "1.5px solid #e0e0e0",
                marginTop: 8,
                opacity: loading ? 0.6 : 1,
                transition: "box-shadow .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 16px rgba(0,0,0,0.18)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Google SVG icon */}
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.39 29.5 1.5 24 1.5 14.82 1.5 7.03 6.98 3.69 14.72l7.1 5.52C12.43 14.1 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.92-2.18 5.4-4.65 7.06l7.1 5.52C43.37 37.12 46.1 31.3 46.1 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.79 28.24A14.5 14.5 0 0 1 9.5 24c0-1.47.25-2.89.69-4.24l-7.1-5.52A22.45 22.45 0 0 0 1.5 24c0 3.57.85 6.94 2.36 9.94l6.93-5.7z"
                />
                <path
                  fill="#34A853"
                  d="M24 46.5c5.5 0 10.12-1.82 13.49-4.94l-7.1-5.52C28.6 37.6 26.42 38.5 24 38.5c-6.26 0-11.57-4.6-13.21-10.76l-6.93 5.7C7.03 41.02 14.82 46.5 24 46.5z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {/* Firebase badge */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span
            style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}
          >
            🔒 Secured by Firebase Auth
          </span>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          {isSignup ? (
            <>
              <span>Already have an account? </span>
              <button
                style={{
                  background: "none",
                  color: "var(--lime)",
                  fontWeight: 700,
                }}
                onClick={() => go("login")}
              >
                Login
              </button>
            </>
          ) : (
            !isDev && (
              <>
                <span>No account? </span>
                <button
                  style={{
                    background: "none",
                    color: "var(--lime)",
                    fontWeight: 700,
                  }}
                  onClick={() => go("signup")}
                >
                  Sign Up
                </button>
              </>
            )
          )}
        </div>
        {!isDev && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              style={{
                background: "none",
                color: "var(--muted)",
                fontSize: 12,
                fontWeight: 700,
              }}
              onClick={() => go("devlogin")}
            >
              Developer / Admin Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Auth;