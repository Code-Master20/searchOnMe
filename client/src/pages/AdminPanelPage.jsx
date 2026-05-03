import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestJson } from "../utils/api";
import { notifyAdminSessionChanged } from "../utils/adminSession";
import styles from "./AdminPanelPage.module.css";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

function AdminPanelPage() {
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadPanel = async () => {
      setIsLoading(true);

      try {
        const [messagesData, projectsData, assetsData] = await Promise.all([
          requestJson("/api/admin/messages", {
            credentials: "include"
          }),
          requestJson("/api/admin/projects", {
            credentials: "include"
          }),
          requestJson("/api/admin/assets", {
            credentials: "include"
          })
        ]);

        setMessages(messagesData.data || []);
        setProjects(projectsData.data || []);
        setAssets(assetsData.data || []);
        setStatus("");
      } catch (error) {
        setStatus(error.message || "Unable to load admin panel.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPanel();
  }, []);

  const pendingMessages = useMemo(
    () => messages.filter((message) => message.status !== "replied").length,
    [messages]
  );
  const repliedMessages = useMemo(
    () => messages.filter((message) => message.status === "replied").length,
    [messages]
  );
  const imageAssets = useMemo(
    () => assets.filter((asset) => asset.category === "image").length,
    [assets]
  );
  const recentMessages = useMemo(() => messages.slice(0, 4), [messages]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setStatus("Closing admin session...");

    try {
      await requestJson("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });

      notifyAdminSessionChanged(false);
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
        <Link className={styles.secondaryLink} to="/admin/messages">
          Open admin inbox
        </Link>
        <Link className={styles.secondaryLink} to="/admin/about">
          Open about editor
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

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      {showLoginLink ? (
        <Link className={styles.loginLink} to="/admin/login">
          Go to admin login
        </Link>
      ) : null}

      <div className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Messages</p>
          <strong>{messages.length}</strong>
          <span>{pendingMessages} waiting / {repliedMessages} replied</span>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Projects</p>
          <strong>{projects.length}</strong>
          <span>Admin-managed public project cards</span>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Assets</p>
          <strong>{assets.length}</strong>
          <span>{imageAssets} image assets available for projects and About</span>
        </article>
      </div>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Quick actions</h2>
          </div>
          <div className={styles.quickActionGrid}>
            <Link className={styles.actionCard} to="/admin/messages">
              <strong>Messages</strong>
              <p>Read incoming messages and reply from the inbox.</p>
            </Link>
            <Link className={styles.actionCard} to="/admin/about">
              <strong>About content</strong>
              <p>Update the About page text and highlighted cards.</p>
            </Link>
            <Link className={styles.actionCard} to="/admin/projects">
              <strong>Projects</strong>
              <p>Edit project details, images, order, and featured status.</p>
            </Link>
            <Link className={styles.actionCard} to="/admin/assets">
              <strong>Assets</strong>
              <p>Upload resume files, documents, and images for the portfolio.</p>
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent messages</h2>
            <Link className={styles.inlineLink} to="/admin/messages">
              Open full inbox
            </Link>
          </div>

          {isLoading ? (
            <p className={styles.emptyState}>Loading admin overview...</p>
          ) : recentMessages.length > 0 ? (
            <div className={styles.messageList}>
              {recentMessages.map((message) => (
                <article className={styles.messageCard} key={message._id}>
                  <div className={styles.messageHeader}>
                    <div>
                      <h3>{message.name}</h3>
                      <p>{message.email}</p>
                    </div>
                    <span className={styles.badge}>{message.status}</span>
                  </div>
                  <p className={styles.messagePreview}>{message.message}</p>
                  <span className={styles.messageDate}>{formatDateTime(message.createdAt)}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>
              No messages have reached the admin inbox yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminPanelPage;
