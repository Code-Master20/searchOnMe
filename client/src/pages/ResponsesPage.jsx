import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { requestJson } from "../utils/api";
import styles from "./ResponsesPage.module.css";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "replied", label: "Replied" }
];

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

function ResponsesPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [responses, setResponses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredResponses = useMemo(
    () =>
      filter === "all"
        ? responses
        : responses.filter((response) => response.status === filter),
    [filter, responses]
  );

  const loadResponses = async (nextEmail = email) => {
    setIsLoading(true);
    setStatus("Checking response status...");

    try {
      const data = await requestJson("/api/messages/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: nextEmail })
      });

      const nextResponses = data.data || [];
      setResponses(nextResponses);
      setStatus(
        nextResponses.length > 0
          ? "Response status loaded."
          : "No verified messages found for this email yet."
      );
    } catch (error) {
      setResponses([]);
      setStatus(error.message || "Unable to load response status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) {
      loadResponses(emailFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadResponses();
  };

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <p className={styles.kicker}>Responses</p>
        <h1>Check whether your verified message is pending or replied.</h1>
        <p>
          Enter the same email address you used in the contact form. Only verified messages appear
          here.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Checking..." : "Check responses"}
        </button>
      </form>

      <div className={styles.filterRow} aria-label="Filter responses">
        {filters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={filter === item.value ? styles.filterActive : ""}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      <div className={styles.responseList}>
        {filteredResponses.map((response) => (
          <article className={styles.responseCard} key={response.id}>
            <div>
              <span className={`${styles.badge} ${styles[response.status]}`}>
                {response.status}
              </span>
              <h2>{response.status === "replied" ? "Reply sent" : "Waiting for reply"}</h2>
            </div>
            <p>Submitted: {formatDateTime(response.submittedAt)}</p>
            {response.repliedAt ? <p>Replied: {formatDateTime(response.repliedAt)}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResponsesPage;
