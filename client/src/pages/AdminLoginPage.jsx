import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestJson } from "../utils/api";
import { notifyAdminSessionChanged } from "../utils/adminSession";
import styles from "./AdminLoginPage.module.css";

const allowedAdminEmails = ["sahidurmiah201920@gmail.com", "quranhadish700@gmail.com"];

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: "", password: "", otp: "" });
  const [passwordResetForm, setPasswordResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loginStep, setLoginStep] = useState("credentials");
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        await requestJson("/api/admin/session", {
          credentials: "include"
        });

        if (!isMounted) {
          return;
        }

        setStatus("Active admin session found. Opening admin panel...");
        navigate("/admin/panel", { replace: true });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatus("");
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (mode === "login") {
      setLoginForm((current) => ({ ...current, [name]: value }));
      return;
    }

    setPasswordResetForm((current) => ({ ...current, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(
      loginStep === "credentials"
        ? "Checking admin credentials..."
        : "Verifying OTP and opening admin panel..."
    );

    try {
      if (loginStep === "credentials") {
        await requestJson("/api/admin/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: loginForm.email,
            password: loginForm.password
          })
        });

        setLoginStep("otp");
        setLoginForm((current) => ({ ...current, otp: "" }));
        setStatus("OTP sent to the admin email. Enter the 6-digit code to continue.");
      } else {
        await requestJson("/api/admin/login/verify-otp", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: loginForm.email,
            otp: loginForm.otp
          })
        });

        await requestJson("/api/admin/session", {
          credentials: "include"
        });

        notifyAdminSessionChanged(true);
        setStatus("Login successful. Opening admin panel...");
        navigate("/admin/panel", { replace: true });
      }
    } catch (error) {
      if (
        error.message?.includes("Reset the password") ||
        error.message?.includes("Password reset required")
      ) {
        setMode("password-reset");
        setPasswordResetForm((current) => ({
          ...current,
          email: loginForm.email,
          otp: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }

      setStatus(error.message || "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setIsSubmitting(true);
    setStatus("Sending password reset OTP...");

    try {
      await requestJson("/api/admin/password-reset/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: passwordResetForm.email
        })
      });

      setStatus("Password reset OTP sent. Enter the code and your new password below.");
    } catch (error) {
      setStatus(error.message || "Unable to send password reset OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (event) => {
    event.preventDefault();

    if (passwordResetForm.newPassword !== passwordResetForm.confirmPassword) {
      setStatus("New password and confirm password must match.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Verifying OTP and changing password...");

    try {
      await requestJson("/api/admin/password-reset/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: passwordResetForm.email,
          otp: passwordResetForm.otp,
          newPassword: passwordResetForm.newPassword
        })
      });

      setPasswordResetForm((current) => ({
        ...current,
        otp: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setMode("login");
      setLoginStep("credentials");
      setLoginForm((current) => ({
        ...current,
        email: passwordResetForm.email,
        password: "",
        otp: ""
      }));
      setStatus("Password changed successfully. Log in again with the new password.");
    } catch (error) {
      setStatus(error.message || "Unable to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStatus("");
    setIsSubmitting(false);
    if (nextMode === "login") {
      setLoginStep("credentials");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field]
    }));
  };

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <p className={styles.kicker}>Admin only</p>
        <h1>Upload access is private to Sahidur Miah.</h1>
        <p>
          Only these admin emails are allowed: {allowedAdminEmails.join(" or ")}.
        </p>

        <div className={styles.modeRow}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "login" ? styles.modeButtonActive : ""}`}
            onClick={() => switchMode("login")}
            disabled={isCheckingSession}
          >
            Admin login
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "password-reset" ? styles.modeButtonActive : ""}`}
            onClick={() => switchMode("password-reset")}
            disabled={isCheckingSession}
          >
            Change password
          </button>
        </div>

        {mode === "login" ? (
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="sahidurmiah201920@gmail.com"
                value={loginForm.email}
                onChange={handleChange}
                disabled={isCheckingSession || loginStep === "otp"}
                required
              />
            </label>
            {loginStep === "credentials" ? (
              <label>
                <span>Password</span>
                <div className={styles.passwordField}>
                  <input
                    type={showPasswords.login ? "text" : "password"}
                    name="password"
                    placeholder="Your admin password"
                    value={loginForm.password}
                    onChange={handleChange}
                    disabled={isCheckingSession}
                    required
                  />
                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => togglePasswordVisibility("login")}
                    disabled={isCheckingSession}
                    aria-label={showPasswords.login ? "Hide password" : "Show password"}
                  >
                    {showPasswords.login ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
            ) : (
              <label>
                <span>OTP</span>
                <input
                  type="text"
                  name="otp"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={loginForm.otp}
                  onChange={handleChange}
                  disabled={isCheckingSession}
                  required
                />
              </label>
            )}
            <button type="submit" disabled={isSubmitting || isCheckingSession}>
              {isCheckingSession
                ? "Checking session..."
                : isSubmitting
                  ? loginStep === "credentials"
                    ? "Sending OTP..."
                    : "Verifying OTP..."
                  : loginStep === "credentials"
                    ? "Continue to OTP"
                    : "Verify OTP and login"}
            </button>
            {loginStep === "otp" ? (
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => {
                  setLoginStep("credentials");
                  setLoginForm((current) => ({ ...current, otp: "" }));
                  setStatus("You can update your password and request a fresh OTP again.");
                }}
                disabled={isSubmitting || isCheckingSession}
              >
                Go back
              </button>
            ) : null}
          </form>
        ) : (
          <form className={styles.form} onSubmit={handlePasswordResetSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="quranhadish700@gmail.com"
                value={passwordResetForm.email}
                onChange={handleChange}
                disabled={isCheckingSession}
                required
              />
            </label>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handlePasswordResetRequest}
              disabled={isSubmitting || isCheckingSession || !passwordResetForm.email}
            >
              {isSubmitting ? "Please wait..." : "Send OTP to email"}
            </button>
            <label>
              <span>OTP</span>
              <input
                type="text"
                name="otp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={passwordResetForm.otp}
                onChange={handleChange}
                disabled={isCheckingSession}
                required
              />
            </label>
            <label>
              <span>New password</span>
              <div className={styles.passwordField}>
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="At least 8 characters"
                  value={passwordResetForm.newPassword}
                  onChange={handleChange}
                  disabled={isCheckingSession}
                  required
                />
                <button
                  type="button"
                  className={styles.visibilityButton}
                  onClick={() => togglePasswordVisibility("newPassword")}
                  disabled={isCheckingSession}
                  aria-label={showPasswords.newPassword ? "Hide new password" : "Show new password"}
                >
                  {showPasswords.newPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>
            <label>
              <span>Confirm new password</span>
              <div className={styles.passwordField}>
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat the new password"
                  value={passwordResetForm.confirmPassword}
                  onChange={handleChange}
                  disabled={isCheckingSession}
                  required
                />
                <button
                  type="button"
                  className={styles.visibilityButton}
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  disabled={isCheckingSession}
                  aria-label={
                    showPasswords.confirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showPasswords.confirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>
            <button type="submit" disabled={isSubmitting || isCheckingSession}>
              {isCheckingSession
                ? "Checking session..."
                : isSubmitting
                  ? "Changing password..."
                  : "Verify OTP and change password"}
            </button>
          </form>
        )}

        <p className={styles.status} aria-live="polite">
          {status}
        </p>
      </div>
    </section>
  );
}

export default AdminLoginPage;
