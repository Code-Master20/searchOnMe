import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestJson } from "../utils/api";
import styles from "./AdminLoginPage.module.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Checking admin credentials...");

    try {
      await requestJson("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      setStatus("Login successful. Opening admin inbox...");
      navigate("/admin/messages");
    } catch (error) {
      setStatus(error.message || "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <p className={styles.kicker}>Admin only</p>
        <h1>Upload access is private to Sahidur Miah.</h1>
        <p>
          Use one of your admin emails to manage resume, educational documents, and image uploads
          through Cloudinary.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Your admin password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login as admin"}
          </button>
        </form>

        <p className={styles.status} aria-live="polite">
          {status}
        </p>
      </div>
    </section>
  );
}

export default AdminLoginPage;
