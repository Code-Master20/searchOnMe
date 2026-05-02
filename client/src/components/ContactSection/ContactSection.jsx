import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { requestJson } from "../../utils/api";
import Reveal from "../Reveal/Reveal";
import styles from "./ContactSection.module.css";

const initialForm = {
  name: "",
  email: "",
  message: ""
};

const contactDraftStorageKey = "searchonme-contact-draft";

const normalizeStoredForm = (value = {}) => ({
  name: typeof value.name === "string" ? value.name : "",
  email: typeof value.email === "string" ? value.email : "",
  message: typeof value.message === "string" ? value.message : ""
});

const readStoredForm = () => {
  if (typeof window === "undefined") {
    return initialForm;
  }

  try {
    const storedForm = window.sessionStorage.getItem(contactDraftStorageKey);

    if (!storedForm) {
      return initialForm;
    }

    return normalizeStoredForm(JSON.parse(storedForm));
  } catch (error) {
    return initialForm;
  }
};

const isEmptyForm = (value) => !value.name && !value.email && !value.message;

function ContactSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState(readStoredForm);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (isEmptyForm(form)) {
        window.sessionStorage.removeItem(contactDraftStorageKey);
        return;
      }

      window.sessionStorage.setItem(contactDraftStorageKey, JSON.stringify(form));
    } catch (error) {
      return;
    }
  }, [form]);

  useEffect(() => {
    const verification = searchParams.get("verification");

    if (!verification) {
      return undefined;
    }

    if (verification === "success" || verification === "confirmed") {
      setForm(initialForm);
      window.sessionStorage.removeItem(contactDraftStorageKey);
    }

    if (verification === "success") {
      setToast({ type: "success", text: "Message successfully sent." });
      setStatus({ type: "", text: "" });
    } else if (verification === "confirmed") {
      setToast({ type: "success", text: "Message already verified." });
      setStatus({ type: "", text: "" });
    } else if (verification === "invalid") {
      setToast({
        type: "error",
        text: "This verification link is invalid or has already expired."
      });
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("verification");
    setSearchParams(nextSearchParams, { replace: true });

    const timeoutId = window.setTimeout(() => {
      setToast({ type: "", text: "" });
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [searchParams, setSearchParams]);

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
      {toast.text ? (
        <div
          className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}
          aria-live="polite"
        >
          {toast.text}
        </div>
      ) : null}

      <Reveal className={styles.copy}>
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
      </Reveal>

      <Reveal as="form" className={styles.form} onSubmit={handleSubmit} delay={120}>
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
            <Link to={`/responses?email=${encodeURIComponent(form.email)}`}>Check response</Link>
          </div>
        )}
      </Reveal>
    </section>
  );
}

export default ContactSection;
