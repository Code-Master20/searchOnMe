import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { defaultAboutContent } from "../data/siteContent";
import { requestJson } from "../utils/api";
import styles from "./AdminAboutPage.module.css";

const createInitialForm = () => ({
  headingTitle: defaultAboutContent.headingTitle,
  profileEyebrow: defaultAboutContent.profileEyebrow,
  profileTitle: defaultAboutContent.profileTitle,
  profileBody: defaultAboutContent.profileBody,
  educationEyebrow: defaultAboutContent.educationEyebrow,
  educationTitle: defaultAboutContent.educationTitle,
  educationBody: defaultAboutContent.educationBody,
  highlight1Title: defaultAboutContent.highlights[0]?.title || "",
  highlight1Body: defaultAboutContent.highlights[0]?.body || "",
  highlight2Title: defaultAboutContent.highlights[1]?.title || "",
  highlight2Body: defaultAboutContent.highlights[1]?.body || "",
  highlight3Title: defaultAboutContent.highlights[2]?.title || "",
  highlight3Body: defaultAboutContent.highlights[2]?.body || "",
  assetEyebrow: defaultAboutContent.assetEyebrow,
  assetTitle: defaultAboutContent.assetTitle,
  assetBody: defaultAboutContent.assetBody
});

const mapContentToForm = (content) => ({
  headingTitle: content.headingTitle || "",
  profileEyebrow: content.profileEyebrow || "",
  profileTitle: content.profileTitle || "",
  profileBody: content.profileBody || "",
  educationEyebrow: content.educationEyebrow || "",
  educationTitle: content.educationTitle || "",
  educationBody: content.educationBody || "",
  highlight1Title: content.highlights?.[0]?.title || "",
  highlight1Body: content.highlights?.[0]?.body || "",
  highlight2Title: content.highlights?.[1]?.title || "",
  highlight2Body: content.highlights?.[1]?.body || "",
  highlight3Title: content.highlights?.[2]?.title || "",
  highlight3Body: content.highlights?.[2]?.body || "",
  assetEyebrow: content.assetEyebrow || "",
  assetTitle: content.assetTitle || "",
  assetBody: content.assetBody || ""
});

const formatPayload = (form) => ({
  headingTitle: form.headingTitle.trim(),
  profileEyebrow: form.profileEyebrow.trim(),
  profileTitle: form.profileTitle.trim(),
  profileBody: form.profileBody.trim(),
  educationEyebrow: form.educationEyebrow.trim(),
  educationTitle: form.educationTitle.trim(),
  educationBody: form.educationBody.trim(),
  highlights: [
    {
      title: form.highlight1Title.trim(),
      body: form.highlight1Body.trim()
    },
    {
      title: form.highlight2Title.trim(),
      body: form.highlight2Body.trim()
    },
    {
      title: form.highlight3Title.trim(),
      body: form.highlight3Body.trim()
    }
  ],
  assetEyebrow: form.assetEyebrow.trim(),
  assetTitle: form.assetTitle.trim(),
  assetBody: form.assetBody.trim()
});

function AdminAboutPage() {
  const [form, setForm] = useState(createInitialForm);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);

      try {
        const data = await requestJson("/api/admin/about-content", {
          credentials: "include"
        });
        setForm(mapContentToForm(data.data || defaultAboutContent));
        setStatus("");
      } catch (error) {
        setStatus(error.message || "Unable to load About content.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus("Updating About section...");

    try {
      await requestJson("/api/admin/about-content", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formatPayload(form))
      });

      setStatus("About section updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update About content.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(createInitialForm());
    setStatus("Editor reset to the starter About content.");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setStatus("Closing admin session...");

    try {
      await requestJson("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });

      setStatus("Logged out successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showLoginLink =
    status.toLowerCase().includes("authorized") || status.toLowerCase().includes("login");

  return (
    <section className={styles.section}>
      <div className={styles.actionRow}>
        <Link className={styles.secondaryLink} to="/admin/panel">
          Open admin panel
        </Link>
        <Link className={styles.secondaryLink} to="/admin/messages">
          Open admin inbox
        </Link>
        <Link className={styles.secondaryLink} to="/admin/projects">
          Open project manager
        </Link>
        <Link className={styles.secondaryLink} to="/admin/assets">
          Open asset manager
        </Link>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <div className={styles.heading}>
        <p className={styles.kicker}>Admin about</p>
        <h1>Edit the About page content without changing code.</h1>
        <p>
          Sahidur can manage the About page heading, intro cards, highlight cards, and asset
          section copy from this protected editor.
        </p>
      </div>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      {showLoginLink ? (
        <Link className={styles.loginLink} to="/admin/login">
          Go to admin login
        </Link>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2>About content editor</h2>
          <button type="button" className={styles.ghostButton} onClick={handleReset}>
            Reset editor
          </button>
        </div>

        {isLoading ? <p className={styles.helperText}>Loading About content...</p> : null}

        <label>
          <span>Section heading</span>
          <textarea
            name="headingTitle"
            rows="3"
            maxLength="240"
            value={form.headingTitle}
            onChange={handleChange}
            required
          />
        </label>

        <div className={styles.panelGrid}>
          <div className={styles.panel} id="profile-card-editor">
            <p className={styles.panelLabel}>Profile card</p>
            <label>
              <span>Eyebrow</span>
              <input
                type="text"
                name="profileEyebrow"
                maxLength="120"
                value={form.profileEyebrow}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Title</span>
              <input
                type="text"
                name="profileTitle"
                maxLength="140"
                value={form.profileTitle}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Body</span>
              <textarea
                name="profileBody"
                rows="6"
                maxLength="3000"
                value={form.profileBody}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className={styles.panel} id="education-card-editor">
            <p className={styles.panelLabel}>Education card</p>
            <label>
              <span>Eyebrow</span>
              <input
                type="text"
                name="educationEyebrow"
                maxLength="120"
                value={form.educationEyebrow}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Title</span>
              <input
                type="text"
                name="educationTitle"
                maxLength="160"
                value={form.educationTitle}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Body</span>
              <textarea
                name="educationBody"
                rows="6"
                maxLength="3000"
                value={form.educationBody}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        <div className={styles.panel}>
          <p className={styles.panelLabel}>Highlight cards</p>
          <div className={styles.highlightsGrid}>
            {[1, 2, 3].map((index) => (
              <div className={styles.highlightCard} key={index} id={`highlight-card-${index}`}>
                <label>
                  <span>{`Card ${index} title`}</span>
                  <input
                    type="text"
                    name={`highlight${index}Title`}
                    maxLength="120"
                    value={form[`highlight${index}Title`]}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  <span>{`Card ${index} body`}</span>
                  <textarea
                    name={`highlight${index}Body`}
                    rows="5"
                    maxLength="2000"
                    value={form[`highlight${index}Body`]}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel} id="asset-section-editor">
          <p className={styles.panelLabel}>Asset section</p>
          <label>
            <span>Eyebrow</span>
            <input
              type="text"
              name="assetEyebrow"
              maxLength="120"
              value={form.assetEyebrow}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Title</span>
            <input
              type="text"
              name="assetTitle"
              maxLength="220"
              value={form.assetTitle}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Body</span>
            <textarea
              name="assetBody"
              rows="4"
              maxLength="3000"
              value={form.assetBody}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button type="submit" disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save About content"}
        </button>
      </form>
    </section>
  );
}

export default AdminAboutPage;
