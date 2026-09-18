import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa";

import { loginUser, getApiErrorMessage } from "../services/api";

import "../styles/Login.css";


function Login() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    // ---------------------------------------------------
    // Validation
    // ---------------------------------------------------

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login:", email);

      // -------------------------------------------------
      // Call backend
      // -------------------------------------------------

      const response = await loginUser(
        email.trim(),
        password
      );

      console.log("Login response:", response);

      // -------------------------------------------------
      // Get token
      // -------------------------------------------------

      const token =
        response?.data?.access_token ||
        response?.access_token;

      if (!token) {
        throw new Error(
          "Login successful, but no access token was received."
        );
      }

      // -------------------------------------------------
      // Save authentication information
      // -------------------------------------------------

      localStorage.setItem(
        "access_token",
        token
      );

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user_email",
        email.trim()
      );

      const loggedInUser = response?.data?.user || response?.user || {};

      if (loggedInUser.role) {
        localStorage.setItem("user_role", loggedInUser.role);
      }

      if (loggedInUser.name) {
        localStorage.setItem("user_name", loggedInUser.name);
      }

      // -------------------------------------------------
      // Navigate
      // -------------------------------------------------

      navigate("/dashboard");

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Unable to login. Please check your email and password."
        )
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="login-page">

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="login-background">

        <div className="login-glow login-glow-one"></div>

        <div className="login-glow login-glow-two"></div>

        <div className="login-grid"></div>

      </div>


      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <header className="login-navbar">

        <Link
          to="/"
          className="login-brand"
        >

          <div className="login-brand-icon">
            <FaChartLine />
          </div>

          <div className="login-brand-text">

            <strong>
              Consumer
            </strong>

            <span>
              Attention Mapping
            </span>

          </div>

        </Link>


        {/* LOGIN / SIGNUP SWITCH */}
        <div className="auth-switch">

          <Link
            to="/register"
            className="auth-switch-item"
          >
            Sign up
          </Link>

          <div className="auth-switch-item active">
            Login
          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="login-main">

        <section className="login-card">


          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="login-card-header">

            <div className="login-mini-icon">
              <FaChartLine />
            </div>

            <h1>
              Welcome back
            </h1>

            <p>
              Log in to your Consumer Attention Mapping
              dashboard
            </p>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="login-error">

              <span className="login-error-dot"></span>

              <span>
                {error}
              </span>

            </div>

          )}


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >


            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <FaEnvelope className="login-input-icon" />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <div className="login-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    alert(
                      "Password reset will be available soon."
                    );
                  }}
                >
                  Forgot password?
                </button>

              </div>


              <div className="login-input-wrapper">

                <FaLock className="login-input-icon" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}

                </button>

              </div>

            </div>


            {/* REMEMBER */}

            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (

                <>

                  <span className="login-spinner"></span>

                  Signing in...

                </>

              ) : (

                <>

                  <span>
                    Login
                  </span>

                  <FaArrowRight />

                </>

              )}

            </button>

          </form>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="login-divider">

            <span></span>

            <p>
              Secure access
            </p>

            <span></span>

          </div>


          {/* =================================================
              SECURITY MESSAGE
          ================================================= */}

          <div className="login-security">

            <div className="security-dot"></div>

            <span>
              Your session is protected with
              secure authentication.
            </span>

          </div>


          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="login-footer">

        <span>
          © 2026 Consumer Attention Mapping System
        </span>

        <span>
          Retail Intelligence Platform
        </span>

      </footer>

    </div>
  );
}


export default Login;