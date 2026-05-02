import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { defaultAboutContent } from "../../data/siteContent";
import { requestJson } from "../../utils/api";
import styles from "./AboutSection.module.css";

const categoryLabels = {
  resume: "Resume",
  education: "Education",
  image: "Photo"
};

function AboutSection() {
  const [assets, setAssets] = useState([]);
  const [content, setContent] = useState(defaultAboutContent);
  const [assetStatus, setAssetStatus] = useState("");
  const [contentStatus, setContentStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    requestJson("/api/about-content", { signal: controller.signal })
      .then((data) => {
        setContent(data.data || defaultAboutContent);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setContentStatus("Showing saved About content while live updates reconnect.");
        }
      });

    requestJson("/api/assets", { signal: controller.signal })
      .then((data) => {
        setAssets(data.data || []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setAssetStatus(error.message);
        }
      });

    return () => controller.abort();
  }, []);

  const groupedAssets = useMemo(
    () =>
      assets.reduce(
        (groups, asset) => ({
          ...groups,
          [asset.category]: [...(groups[asset.category] || []), asset]
        }),
        {}
      ),
    [assets]
  );

  return (
    <section className={styles.section} id="about">
      <div className={styles.heading}>
        <p className={styles.kicker}>About</p>
        <h2>{content.headingTitle}</h2>
      </div>

      {contentStatus ? <p className={styles.sectionStatus}>{contentStatus}</p> : null}

      <div className={styles.introPanel}>
        <div className={styles.profileCard}>
          <p className={styles.profileEyebrow}>{content.profileEyebrow}</p>
          <h3>{content.profileTitle}</h3>
          <p>{content.profileBody}</p>
        </div>

        <div className={styles.educationCard}>
          <p className={styles.profileEyebrow}>{content.educationEyebrow}</p>
          <h3>{content.educationTitle}</h3>
          <p>{content.educationBody}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {content.highlights.map((card) => (
          <article className={styles.card} key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.assetSection}>
        <div className={styles.uploadHeader}>
          <p className={styles.uploadKicker}>{content.assetEyebrow}</p>
          <h3>{content.assetTitle}</h3>
          <p>{content.assetBody}</p>
        </div>

        {assetStatus ? <p className={styles.assetStatus}>{assetStatus}</p> : null}

        {assets.length > 0 ? (
          <div className={styles.assetGrid}>
            {["resume", "education", "image"].map((category) =>
              (groupedAssets[category] || []).map((asset) => (
                <article className={styles.assetCard} key={asset._id}>
                  {asset.resourceType === "image" ? (
                    <img src={asset.secureUrl} alt={asset.title} />
                  ) : (
                    <div className={styles.documentBadge}>{asset.format || "file"}</div>
                  )}
                  <div>
                    <p>{categoryLabels[category]}</p>
                    <h4>{asset.title}</h4>
                    <a href={asset.secureUrl} target="_blank" rel="noreferrer">
                      View asset
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : (
          <p className={styles.emptyAssets}>
            No portfolio files are published yet. Admin can add resume, education documents, and
            photos from the private dashboard.
          </p>
        )}

        <Link className={styles.adminLink} to="/admin/login">
          Admin upload login
        </Link>
      </div>
    </section>
  );
}

export default AboutSection;
