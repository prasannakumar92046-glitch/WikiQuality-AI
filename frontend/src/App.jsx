import { useState } from "react";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import UserFeaturePage from "./UserFeaturePage";
import ComparePage from "./ComparePage";
import KnowledgeGraphPage from "./KnowledgeGraphPage";
import ReportsPage from "./ReportsPage";

import {
  ShieldCheck,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Brain,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function readStoredUser() {
  const storedUser = localStorage.getItem(
    "wikiquality_user"
  );

  try {
    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("wikiquality_token");
  localStorage.removeItem("wikiquality_user");
}

function requireRole(user, role) {
  if (!user || user.role !== role) {
    window.location.href = "/";
    return false;
  }

  return true;
}

function Router() {
  const path = window.location.pathname;
  const user = readStoredUser();

  if (path === "/register") {
    return <RegistrationPage />;
  }

  if (path === "/dashboard") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return <Dashboard />;
  }

  if (path === "/analyze") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return (
      <UserFeaturePage type="analyze" />
    );
  }

  if (path === "/history") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return (
      <UserFeaturePage type="history" />
    );
  }

  if (path === "/compare") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return <ComparePage />;
  }

  if (path === "/knowledge-graph") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return <KnowledgeGraphPage />;
  }

  if (path === "/reports") {
    if (!requireRole(user, "user")) {
      return null;
    }

    return <ReportsPage />;
  }

  if (path === "/admin") {
    if (!requireRole(user, "admin")) {
      return null;
    }

    return <AdminDashboard />;
  }

  return <LoginPage />;
}

function BrandSection() {
  return (
    <section className="brand-section">
      <div className="brand-icon">
        <Brain
          size={34}
          strokeWidth={2.2}
        />
      </div>

      <h1>
        WikiQuality <span>AI</span>
      </h1>

      <p className="tagline">
        AI-Powered Wikipedia Knowledge Quality &
        Completeness Platform
      </p>

      <div className="feature-list">
        <div className="feature-item">
          <div className="feature-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>
              Intelligent Analysis
            </strong>

            <p>
              Analyze content quality using NLP
              and AI techniques.
            </p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">
            <Brain size={18} />
          </div>

          <div>
            <strong>
              Knowledge Insights
            </strong>

            <p>
              Explore topics, entities, evidence
              and information diversity.
            </p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <strong>
              Evidence-Based Results
            </strong>

            <p>
              Understand the analysis signals
              behind each result.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
}

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

function LoginPage() {
  const [role, setRole] =
    useState("user");

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const openRegistration = () => {
    if (loading) {
      return;
    }

    setError("");
    window.location.href =
      "/register";
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),
                password,
                role,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Login failed. Please check your credentials."
            )
          );
        }

        if (
          !data.token ||
          !data.user
        ) {
          throw new Error(
            "Login response was incomplete."
          );
        }

        localStorage.setItem(
          "wikiquality_token",
          data.token
        );

        localStorage.setItem(
          "wikiquality_user",
          JSON.stringify(
            data.user
          )
        );

        window.location.href =
          data.user.role ===
          "admin"
            ? "/admin"
            : "/dashboard";
      } catch (loginError) {
        console.error(
          "Login error:",
          loginError
        );

        setError(
          loginError.message ||
            "Unable to login."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="app">
      <div className="background-shape background-shape-one" />
      <div className="background-shape background-shape-two" />

      <main className="login-container">
        <BrandSection />

        <section className="login-card">
          <div className="login-header">
            <div className="small-brand">
              <Brain size={20} />
              <span>
                WikiQuality AI
              </span>
            </div>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to your{" "}
              {role === "user"
                ? "analysis dashboard"
                : "administration panel"}.
            </p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-button ${
                role === "user"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setRole("user");
                setError("");
              }}
              disabled={loading}
            >
              <UserRound size={18} />
              <span>User</span>
            </button>

            <button
              type="button"
              className={`role-button ${
                role === "admin"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setRole("admin");
                setError("");
              }}
              disabled={loading}
            >
              <ShieldCheck size={18} />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">
                Email address
              </label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Password recovery will be implemented later."
                    )
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="auth-spinner"
                  />
                  <span>
                    Signing in...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {role === "user"
                      ? "Login as User"
                      : "Login as Admin"}
                  </span>

                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="register-prompt">
            <span>
              New to WikiQuality AI?
            </span>

            <button
              type="button"
              onClick={openRegistration}
              disabled={loading}
            >
              <UserPlus size={16} />
              Create User Account
            </button>
          </div>

          <div className="login-footer">
            <p>
              {role === "user"
                ? "Analyze articles and explore knowledge insights."
                : "Manage users, analyses and system information."}
            </p>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <span>WikiQuality AI</span>
        <span>•</span>
        <span>
          AI-Powered Knowledge Quality Analysis
        </span>
      </footer>
    </div>
  );
}

// --------------------------------------------------
// REGISTRATION
// --------------------------------------------------

function RegistrationPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const goToLogin = () => {
    if (loading) {
      return;
    }

    window.location.href = "/";
  };

  const handleRegister =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const cleanName =
        name.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (cleanName.length < 2) {
        setError(
          "Name must contain at least 2 characters."
        );
        return;
      }

      if (!cleanEmail.includes("@")) {
        setError(
          "Please provide a valid email address."
        );
        return;
      }

      if (password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: cleanName,
                email: cleanEmail,
                password,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Registration failed."
            )
          );
        }

        setSuccess(
          "Account created successfully. Redirecting to login..."
        );

        setName("");
        setPassword("");
        setConfirmPassword("");

        /*
         * Do not auto-login here. A newly registered
         * account returns to the existing login flow,
         * which keeps authentication behavior consistent.
         */
        window.setTimeout(() => {
          window.location.href = "/";
        }, 900);
      } catch (registerError) {
        console.error(
          "Registration error:",
          registerError
        );

        setError(
          registerError.message ||
            "Unable to create your account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="app">
      <div className="background-shape background-shape-one" />
      <div className="background-shape background-shape-two" />

      <main className="login-container">
        <BrandSection />

        <section className="login-card registration-card">
          <div className="login-header">
            <div className="small-brand">
              <UserPlus size={20} />
              <span>
                WikiQuality AI
              </span>
            </div>

            <h2>
              Create your account
            </h2>

            <p>
              Create a User account to
              analyze articles and explore
              knowledge-quality insights.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-message auth-message-success">
              <CheckCircle2 size={17} />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleRegister}
          >
            <div className="form-group">
              <label htmlFor="register-name">
                Full name
              </label>

              <div className="input-wrapper">
                <UserRound size={19} />

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Re-enter your password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={
                loading ||
                Boolean(success)
              }
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="auth-spinner"
                  />
                  <span>
                    Creating account...
                  </span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={19} />
                  <span>
                    Account created
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create User Account
                  </span>
                  <UserPlus size={19} />
                </>
              )}
            </button>
          </form>

          <div className="register-back">
            <button
              type="button"
              onClick={goToLogin}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Back to login
            </button>
          </div>

          <div className="registration-note">
            <ShieldCheck size={16} />

            <p>
              Public registration creates a
              standard User account. Admin
              access remains separate.
            </p>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <span>WikiQuality AI</span>
        <span>•</span>
        <span>
          AI-Powered Knowledge Quality Analysis
        </span>
      </footer>
    </div>
  );
}

export default Router;
