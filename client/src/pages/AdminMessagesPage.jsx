import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestJson } from "../utils/api";
import { notifyAdminSessionChanged } from "../utils/adminSession";
import styles from "./AdminMessagesPage.module.css";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

const sortMessages = (messages, sortDirection) =>
  [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();

    return sortDirection === "oldest" ? leftTime - rightTime : rightTime - leftTime;
  });

const getAdjacentMessageId = (messages, currentId) => {
  const currentIndex = messages.findIndex((message) => message._id === currentId);

  if (currentIndex === -1) {
    return messages[0]?._id || "";
  }

  return messages[currentIndex + 1]?._id || messages[currentIndex - 1]?._id || currentId;
};

function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sortDirection, setSortDirection] = useState("newest");

  const sortedMessages = useMemo(
    () => sortMessages(messages, sortDirection),
    [messages, sortDirection]
  );

  const selectedSummary = useMemo(
    () => sortedMessages.find((message) => message._id === selectedId) || null,
    [sortedMessages, selectedId]
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

      const sortedNextMessages = sortMessages(nextMessages, sortDirection);
      const nextSelectedId =
        sortedNextMessages.find((message) => message._id === selectedId)?._id ||
        sortedNextMessages[0]._id;

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
      const nextMessageId = getAdjacentMessageId(sortedMessages, selectedMessage._id);
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

      if (nextMessageId && nextMessageId !== updatedMessage._id) {
        await loadMessageDetail(nextMessageId);
      }

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
  const canReply = Boolean(selectedMessage?.isVerified);
  const hasExistingReply = (selectedMessage?.status || selectedSummary?.status) === "replied";
  const canEditReply = canReply && !hasExistingReply;
  const canDeleteSelectedMessage = Boolean(selectedMessage?._id || selectedSummary?._id);

  const handleDeleteMessage = async () => {
    const messageToDelete = selectedMessage || selectedSummary;

    if (!messageToDelete) {
      return;
    }

    setIsDeletingMessage(true);
    setStatus("Deleting message...");

    try {
      const nextSelectedId = getAdjacentMessageId(sortedMessages, messageToDelete._id);

      await requestJson(`/api/admin/messages/${messageToDelete._id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const remainingMessages = sortedMessages.filter((message) => message._id !== messageToDelete._id);
      setMessages((current) => current.filter((message) => message._id !== messageToDelete._id));

      if (remainingMessages.length === 0) {
        setSelectedId("");
        setSelectedMessage(null);
        setReply("");
      } else {
        const fallbackMessageId = remainingMessages.find((message) => message._id === nextSelectedId)?._id;
        const nextMessageId = fallbackMessageId || remainingMessages[0]._id;
        await loadMessageDetail(nextMessageId);
      }

      setStatus("Message deleted successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to delete message.");
    } finally {
      setIsDeletingMessage(false);
    }
  };

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
            <div>
              <h2>Messages</h2>
              <span>{messages.length}</span>
            </div>

            <label className={styles.sortControl}>
              <span>Order</span>
              <select
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <p className={styles.emptyState}>Loading admin messages...</p>
          ) : messages.length > 0 ? (
            <div className={styles.messageList}>
              {sortedMessages.map((message) => (
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
                    disabled={!canEditReply || isSendingReply}
                    required
                  />
                </label>
                {!canReply ? (
                  <p className={styles.helperText}>
                    This message must be verified before a reply can be sent.
                  </p>
                ) : hasExistingReply ? (
                  <p className={styles.helperText}>
                    This message has already been replied to, so the reply is now read-only.
                  </p>
                ) : null}
                <button type="submit" disabled={!canEditReply || isSendingReply}>
                  {isSendingReply ? "Sending..." : hasExistingReply ? "Reply sent" : "Send reply"}
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleDeleteMessage}
                  disabled={!canDeleteSelectedMessage || isDeletingMessage || isSendingReply}
                >
                  {isDeletingMessage ? "Deleting..." : "Delete query"}
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
