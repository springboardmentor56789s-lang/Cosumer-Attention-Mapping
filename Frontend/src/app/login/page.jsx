"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";



/**

 * Login.jsx — Consumer Attention Mapping System

 *

 * Drop this into your Next.js/React project at e.g. src/pages/Login.jsx

 * (or app/login/page.jsx if using the app router — rename the export accordingly).

 *

 * Wiring to your FastAPI backend (Module 1):

 *   1. Replace the `fakeLogin` call in handleSubmit with a real request:

 *

 *      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {

 *        method: "POST",

 *        headers: { "Content-Type": "application/json" },

 *        body: JSON.stringify({ email, password }),

 *      });

 *      if (!res.ok) throw new Error("Invalid email or password");

 *      const data = await res.json(); // { access_token, token_type }

 *

 *   2. Store data.access_token in your AuthContext (not localStorage if you can

 *      avoid it — but localStorage is fine for a first working version).

 *   3. Fetch GET /auth/me with that token to get { email, role }.

 *   4. Redirect to the dashboard that matches role (store_manager / retail_analyst /

 *      marketing_manager / administrator).

 */



const TOKENS = {

  bg: "#0B0F17",

  surface: "#131A27",

  surface2: "#1B2333",

  border: "#232C40",

  accent: "#E8A33D",

  accentDim: "rgba(232,163,61,0.14)",

  text: "#EDEFF3",

  muted: "#8A93A6",

  danger: "#E8654F",

};



// A shelf/attention grid: rows x cols of points, each pulsing on its own

// randomized timer to feel like a live attention heatmap rather than a loop.

//

// Note: cells are generated in useEffect (client-only), not during render.

// Next.js renders this page once on the server and once on the client during

// hydration — if we called Math.random() directly in the render body, the two

// passes would produce different values and React would throw a hydration

// mismatch warning. Generating them post-mount avoids that entirely.

function AttentionGrid() {

  const rows = 8;

  const cols = 10;

  const [cells, setCells] = useState([]);



  useEffect(() => {

    setCells(

      Array.from({ length: rows * cols }, (_, i) => ({

        id: i,

        delay: Math.random() * 6,

        duration: 3 + Math.random() * 3,

        peak: 0.25 + Math.random() * 0.75,

      }))

    );

  }, []);



  return (

    <div

      style={{

        display: "grid",

        gridTemplateColumns: `repeat(${cols}, 1fr)`,

        gap: "18px",

        width: "100%",

        maxWidth: "420px",

      }}

    >

      {cells.map((c) => (

        <div

          key={c.id}

          style={{

            width: "6px",

            height: "6px",

            borderRadius: "9999px",

            background: TOKENS.accent,

            opacity: 0.15,

            animation: `pulseDot ${c.duration}s ease-in-out ${c.delay}s infinite`,

            "--peak": c.peak,

          }}

        />

      ))}

    </div>

  );

}



export default function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();



async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await axios.post("http://localhost:8000/login", { email, password });
    const token = response.data.access_token;
    localStorage.setItem("token", token);

    const decoded = JSON.parse(atob(token.split(".")[1]));

    const roleRoutes = {
      admin: "/dashboard/admin",
      store_manager: "/dashboard/store-manager",
      retail_analyst: "/dashboard/retail-analyst",
      marketing_manager: "/dashboard/marketing-manager",
    };

    router.push(roleRoutes[decoded.role] || "/unauthorized");
  } catch (err) {
    setError(err.response?.data?.detail || "Invalid email or password");
  } finally {
    setLoading(false);
  }
}



  return (

    <div

      style={{

        minHeight: "100vh",

        background: TOKENS.bg,

        color: TOKENS.text,

        fontFamily: "'Inter', system-ui, sans-serif",

        display: "flex",

      }}

    >

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');



        @keyframes pulseDot {

          0%, 100% { opacity: 0.12; transform: scale(1); }

          50% { opacity: var(--peak); transform: scale(2.4); box-shadow: 0 0 12px ${TOKENS.accent}; }

        }

        .cam-input:focus {

          outline: none;

          border-color: ${TOKENS.accent} !important;

          box-shadow: 0 0 0 3px ${TOKENS.accentDim};

        }

        .cam-btn:focus-visible {

          outline: 2px solid ${TOKENS.accent};

          outline-offset: 2px;

        }

        @media (max-width: 860px) {

          .cam-left { display: none !important; }

        }

      `}</style>



      {/* LEFT — brand / signature panel */}

      <div

        className="cam-left"

        style={{

          flex: "1 1 50%",

          background: `radial-gradient(circle at 30% 20%, ${TOKENS.surface2} 0%, ${TOKENS.bg} 65%)`,

          borderRight: `1px solid ${TOKENS.border}`,

          padding: "56px",

          display: "flex",

          flexDirection: "column",

          justifyContent: "space-between",

        }}

      >

        <div>

          <div

            style={{

              display: "inline-flex",

              alignItems: "center",

              gap: "8px",

              fontFamily: "'JetBrains Mono', monospace",

              fontSize: "12px",

              letterSpacing: "0.08em",

              color: TOKENS.accent,

              border: `1px solid ${TOKENS.border}`,

              borderRadius: "9999px",

              padding: "6px 14px",

              marginBottom: "40px",

            }}

          >

            <span

              style={{

                width: "6px",

                height: "6px",

                borderRadius: "9999px",

                background: TOKENS.accent,

              }}

            />

            SYSTEM_ONLINE

          </div>



          <h1

            style={{

              fontFamily: "'Space Grotesk', sans-serif",

              fontSize: "40px",

              lineHeight: 1.15,

              fontWeight: 700,

              maxWidth: "480px",

              margin: 0,

            }}

          >

            Consumer Attention

            <br />

            Mapping System

          </h1>

          <p

            style={{

              color: TOKENS.muted,

              fontSize: "15px",

              lineHeight: 1.6,

              maxWidth: "420px",

              marginTop: "18px",

            }}

          >

            Gaze, dwell time, and shelf engagement — turned into decisions

            your merchandising team can act on.

          </p>

        </div>



        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          <AttentionGrid />

          <div

            style={{

              fontFamily: "'JetBrains Mono', monospace",

              fontSize: "12px",

              color: TOKENS.muted,

              letterSpacing: "0.04em",

            }}

          >

            LIVE SHELF ATTENTION — DEMO FEED

          </div>

        </div>

      </div>



      {/* RIGHT — sign-in form */}

      <div

        style={{

          flex: "1 1 50%",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          padding: "24px",

        }}

      >

        <form

          onSubmit={handleSubmit}

          style={{

            width: "100%",

            maxWidth: "380px",

            background: TOKENS.surface,

            border: `1px solid ${TOKENS.border}`,

            borderRadius: "16px",

            padding: "40px 36px",

          }}

        >

          <h2

            style={{

              fontFamily: "'Space Grotesk', sans-serif",

              fontSize: "22px",

              fontWeight: 600,

              margin: 0,

            }}

          >

            Sign in

          </h2>

          <p style={{ color: TOKENS.muted, fontSize: "14px", marginTop: "6px", marginBottom: "32px" }}>

            Store Manager · Retail Analyst · Marketing Manager · Admin

          </p>



          <label style={{ display: "block", fontSize: "13px", color: TOKENS.muted, marginBottom: "6px" }}>

            Email

          </label>

          <input

            className="cam-input"

            type="email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            placeholder="you@yourstore.com"

            required

            style={{

              width: "100%",

              boxSizing: "border-box",

              background: TOKENS.surface2,

              border: `1px solid ${TOKENS.border}`,

              borderRadius: "8px",

              padding: "11px 14px",

              color: TOKENS.text,

              fontSize: "14px",

              marginBottom: "18px",

              transition: "box-shadow 0.15s, border-color 0.15s",

            }}

          />



          <label style={{ display: "block", fontSize: "13px", color: TOKENS.muted, marginBottom: "6px" }}>

            Password

          </label>

          <div style={{ position: "relative", marginBottom: "8px" }}>

            <input

              className="cam-input"

              type={showPassword ? "text" : "password"}

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              placeholder="••••••••"

              required

              style={{

                width: "100%",

                boxSizing: "border-box",

                background: TOKENS.surface2,

                border: `1px solid ${TOKENS.border}`,

                borderRadius: "8px",

                padding: "11px 44px 11px 14px",

                color: TOKENS.text,

                fontSize: "14px",

                transition: "box-shadow 0.15s, border-color 0.15s",

              }}

            />

            <button

              type="button"

              onClick={() => setShowPassword((s) => !s)}

              style={{

                position: "absolute",

                right: "10px",

                top: "50%",

                transform: "translateY(-50%)",

                background: "none",

                border: "none",

                color: TOKENS.muted,

                fontSize: "12px",

                fontFamily: "'JetBrains Mono', monospace",

                cursor: "pointer",

              }}

            >

              {showPassword ? "HIDE" : "SHOW"}

            </button>

          </div>



          <div style={{ textAlign: "right", marginBottom: "22px" }}>

            <a href="#" style={{ fontSize: "13px", color: TOKENS.accent, textDecoration: "none" }}>

              Forgot password?

            </a>

          </div>



          {error && (

            <div

              style={{

                background: "rgba(232,101,79,0.1)",

                border: `1px solid ${TOKENS.danger}`,

                color: TOKENS.danger,

                fontSize: "13px",

                borderRadius: "8px",

                padding: "10px 12px",

                marginBottom: "18px",

              }}

            >

              {error}

            </div>

          )}



          <button

            className="cam-btn"

            type="submit"

            disabled={loading}

            style={{

              width: "100%",

              background: loading ? TOKENS.surface2 : TOKENS.accent,

              color: loading ? TOKENS.muted : "#1A1200",

              border: "none",

              borderRadius: "8px",

              padding: "12px",

              fontSize: "14px",

              fontWeight: 600,

              cursor: loading ? "default" : "pointer",

              transition: "background 0.15s",

            }}

          >

            {loading ? "Signing in…" : "Sign in"}

          </button>



          <p style={{ textAlign: "center", fontSize: "13px", color: TOKENS.muted, marginTop: "24px" }}>

            New here?{" "}

            <a href="#" style={{ color: TOKENS.accent, textDecoration: "none" }}>

              Create an account

            </a>

          </p>

        </form>

      </div>

    </div>

  );

}