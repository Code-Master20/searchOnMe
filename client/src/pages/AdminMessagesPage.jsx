import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestJson } from "../utils/api";
import styles from "./AdminMessagesPage.module.css";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const selectedSummary = useMemo(
    () => messages.find((message) => message._id === selectedId) || null,
    [messages, selectedId]
  );

  const loadMessageDetail = async (messageId) => {
    const data = await requestJson(`/api/admin/messages/${messageId}`, {
      credentials: "include"
    });

    setSelectedId(messageId);
    setSelectedMessage(data.data);
    setReply(data.data.reply || "");
  };

  const loadMessages = async () => {
    setIsLoading(true);

    try {
      const data = await requestJson("/api/admin/messages", {
        credentials: "include"
      });
      const nextMessages = data.data || [];
      setMessages(nextMessages);

      if (nextMessages.length === 0) {
        setSelectedId("");
        setSelectedMessage(null);
        setReply("");
        setStatus("No messages yet.");
        return;
      }

      const nextSelectedId =
        nextMessages.find((message) => message._id === selectedId)?._id || nextMessages[0]._id;

      await loadMessageDetail(nextSelectedId);
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Unable to load admin messages.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!selectedMessage) {
      return;
    }

    setIsSendingReply(true);
    setStatus("Sending reply...");

    try {
      const data = await requestJson(`/api/admin/reply/${selectedMessage._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reply })
      });

      const updatedMessage = data.data;
      setSelectedMessage(updatedMessage);
      setReply(updatedMessage.reply || "");
      setMessages((current) =>
        current.map((message) => (message._id === updatedMessage._id ? updatedMessage : message))
      );
      setStatus("Reply sent successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to send reply.");
    } finally {
      setIsSendingReply(false);
    }
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
  const canReply = Boolean(selectedMessage?.isVerified);

  return (
    <section className={styles.section}>
      <div className={styles.actionRow}>
        <Link className={styles.secondaryLink} to="/admin/panel">
          Open admin panel
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

      <div className={styles.heading}>
        <p className={styles.kicker}>Admin inbox</p>
        <h1>Review verified contact messages and reply from one place.</h1>
        <p>
          Verified portfolio messages land here for review. Open a message to read the full text
          and send a reply directly from the admin area.
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

      <div className={styles.layout}>
        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <h2>Messages</h2>
            <span>{messages.length}</span>
          </div>

          {isLoading ? (
            <p className={styles.emptyState}>Loading admin messages...</p>
          ) : messages.length > 0 ? (
            <div className={styles.messageList}>
              {messages.map((message) => (
                <button
                  type="button"
                  key={message._id}
                  className={`${styles.messageButton} ${
                    message._id === selectedId ? styles.messageButtonActive : ""
                  }`.trim()}
                  onClick={() => loadMessageDetail(message._id).catch((error) => setStatus(error.message))}
                >
                  <div className={styles.messageMeta}>
                    <span className={styles.messageName}>{message.name}</span>
                    <span className={styles.messageDate}>{formatDateTime(message.createdAt)}</span>
                  </div>
                  <p className={styles.messageEmail}>{message.email}</p>
                  <p className={styles.messagePreview}>{message.message}</p>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>{message.status}</span>
                    <span className={styles.badgeMuted}>
                      {message.isVerified ? "verified" : "pending verification"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>
              Verified and pending contact messages will appear here once someone uses the contact
              form.
            </p>
          )}
        </div>

        <div className={styles.detailPanel}>
          {selectedMessage || selectedSummary ? (
            <>
              <div className={styles.messageHeader}>
                <div>
                  <p className={styles.kicker}>Selected message</p>
                  <h2>{selectedMessage?.name || selectedSummary?.name}</h2>
                </div>
                <div className={styles.badgeRow}>
                  <span className={styles.badge}>
                    {selectedMessage?.status || selectedSummary?.status}
                  </span>
                  <span className={styles.badgeMuted}>
                    {selectedMessage?.isVerified || selectedSummary?.isVerified
                      ? "verified"
                      : "pending verification"}
                  </span>
                </div>
              </div>

              <div className={styles.detailMeta}>
                <p>
                  <strong>Email:</strong> {selectedMessage?.email || selectedSummary?.email}
                </p>
                <p>
                  <strong>Received:</strong>{" "}
                  {formatDateTime(selectedMessage?.createdAt || selectedSummary?.createdAt)}
                </p>
              </div>

              <article className={styles.messageBody}>
                {selectedMessage?.message || selectedSummary?.message}
              </article>

              <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                <label>
                  <span>Reply</span>
                  <textarea
                    rows="8"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write your reply here..."
                    disabled={!canReply || isSendingReply}
                    required
                  />
                </label>
                {!canReply ? (
                  <p className={styles.helperText}>
                    This message must be verified before a reply can be sent.
                  </p>
                ) : null}
                <button type="submit" disabled={!canReply || isSendingReply}>
                  {isSendingReply ? "Sending..." : "Send reply"}
                </button>
              </form>
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a message from the inbox to read it and send a reply.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminMessagesPage;
