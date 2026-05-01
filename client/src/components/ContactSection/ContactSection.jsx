import { useState } from "react";
import { requestJson } from "../../utils/api";
import styles from "./ContactSection.module.css";

const initialForm = {
  name: "",
  email: "",
  message: ""
};

function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({
      type: "",
      text: "Submitting your message and preparing verification email..."
    });

    try {
      const data = await requestJson("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      setStatus({
        type: "success",
        text:
          data.message ||
          "Verification email accepted. Please check your inbox or spam folder for the link."
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Unable to send your message right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section} id="contact">
      <div className={styles.copy}>
        <p className={styles.kicker}>Contact</p>
        <h2>Let&apos;s build something dependable and memorable.</h2>
        <p>
          Use the form to reach Sahidur Miah. Your message will only be delivered after email
          verification, which keeps communication clean and secure.
        </p>
        <div className={styles.contactPoints}>
          <a href="mailto:sahidurmiah201920@gmail.com">sahidurmiah201920@gmail.com</a>
          <span>searchOnMe / Sahidur Miah</span>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            maxLength="100"
            placeholder="Your name"
            required
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Message</span>
          <textarea
            name="message"
            rows="6"
            maxLength="5000"
            placeholder="Tell me about your idea, collaboration, or project."
            required
            value={form.message}
            onChange={handleChange}
          />
        </label>
        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send verified message"}
        </button>
        <p className={styles.note}>
          You&apos;ll receive an email verification link before your message is delivered.
        </p>
        <p
          className={`${styles.status} ${status.type === "success" ? styles.success : ""} ${
            status.type === "error" ? styles.error : ""
          }`}
          aria-live="polite"
        >
          {status.text}
        </p>
        {status.type === "success" && (
          <div className={styles.verificationActions}>
            <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noreferrer">
              Open Gmail
            </a>
            <a href="#contact">Back to searchOnMe</a>
          </div>
        )}
      </form>
    </section>
  );
}

export default ContactSection;
