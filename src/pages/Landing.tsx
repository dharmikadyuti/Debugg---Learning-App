import Counter from "../components/Counter";

interface LandingProps {
  go: (page: string) => void;
}

function Landing({ go }: LandingProps) {
  const feats = [
    {
      i: "🐛",
      t: "Debug Real Code",
      d: "Fix actual buggy code in Python, JavaScript, Java and more languages.",
    },
    {
      i: "🎮",
      t: "Level Up",
      d: "Unlock challenges as you progress. Every fix earns XP and badges.",
    },
    {
      i: "🏆",
      t: "Compete",
      d: "Climb global leaderboards. Beat friends on local group rankings.",
    },
    {
      i: "💬",
      t: "Community",
      d: "Discuss bugs, share tips, and connect with fellow debuggers worldwide.",
    },
  ];
  return (
    <div className="page">
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          overflow: "hidden",
        }}
      >
        <div className="grid-bg" />
        <div
          className="glow"
          style={{
            width: 600,
            height: 500,
            background: "var(--lime)",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="glow"
          style={{
            width: 400,
            height: 400,
            background: "var(--cyan)",
            top: "30%",
            right: "-8%",
          }}
        />
        <div
          className="glow"
          style={{
            width: 350,
            height: 350,
            background: "var(--pink)",
            top: "15%",
            left: "-5%",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="chip" style={{ marginBottom: 24 }}>
            🔥 The addictive way to learn coding
          </div>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(46px,9vw,92px)",
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            Learn to Code
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,var(--lime),var(--cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              by Debugging
            </span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--muted)",
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.75,
              fontWeight: 600,
            }}
          >
            Fix buggy code, earn XP, unlock levels, and compete with friends.
            The Duolingo of programming — but for real developers. 🚀
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn-lime"
              style={{ fontSize: 16, padding: "15px 38px" }}
              onClick={() => go("signup")}
            >
              Start Debugging Free →
            </button>
            <button className="btn-ghost" onClick={() => go("login")}>
              I have an account
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
              marginTop: 64,
              flexWrap: "wrap",
            }}
          >
            {[
              { n: 24800, l: "Debuggers", s: "+" },
              { n: 1250, l: "Challenges", s: "+" },
              { n: 98, l: "Satisfaction", s: "%" },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 38,
                    color: "var(--lime)",
                  }}
                >
                  <Counter target={s.n} suffix={s.s} />
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
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
      </section>
      {/* Features */}
      <section
        style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <h2
          style={{
            fontFamily: "var(--display)",
            fontSize: 42,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Why Debugg<span style={{ color: "var(--lime)" }}>?</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 20,
          }}
        >
          {feats.map((f) => (
            <div key={f.t} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{f.i}</div>
              <h3
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                {f.t}
              </h3>
              <p
                style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}
              >
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section
        style={{
          padding: "80px 24px 120px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="glow"
          style={{
            width: 500,
            height: 300,
            background: "var(--purple)",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(30px,6vw,54px)",
              marginBottom: 20,
            }}
          >
            Ready to squash some{" "}
            <span style={{ color: "var(--lime)" }}>bugs?</span> 🐛
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 16,
              marginBottom: 32,
              fontWeight: 600,
            }}
          >
            Join 24,000+ developers learning through debugging.
          </p>
          <button
            className="btn-lime"
            style={{ fontSize: 17, padding: "16px 44px" }}
            onClick={() => go("signup")}
          >
            Get Started — It's Free
          </button>
        </div>
      </section>
    </div>
  );
}
export default Landing;
  