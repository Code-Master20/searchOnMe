import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAdminSession from "../../hooks/useAdminSession";
import { defaultAboutContent } from "../../data/siteContent";
import { requestJson } from "../../utils/api";
import Reveal from "../Reveal/Reveal";
import styles from "./AboutSection.module.css";

const getAssetPreviewUrl = (asset) => {
  if (asset.category === "image") {
    return asset.secureUrl;
  }

  if (String(asset.format || "").toLowerCase() === "pdf" && asset.resourceType === "image") {
    return asset.secureUrl.replace(/\.pdf(?=$|[?#])/i, ".jpg");
  }

  return "";
};

function AboutSection() {
  const [assets, setAssets] = useState([]);
  const [content, setContent] = useState(defaultAboutContent);
  const [assetStatus, setAssetStatus] = useState("");
  const [contentStatus, setContentStatus] = useState("");
  const { isAdmin } = useAdminSession();

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

  const resumeAssets = useMemo(
    () => assets.filter((asset) => asset.category === "resume"),
    [assets]
  );

  return (
    <section className={styles.section} id="about">
      <Reveal className={styles.heading}>
        <div>
          <p className={styles.kicker}>About</p>
          <h2>{content.headingTitle}</h2>
        </div>
        {isAdmin ? (
          <Link className={styles.adminControl} to="/admin/about">
            Open about editor
          </Link>
        ) : null}
      </Reveal>

      {contentStatus ? (
        <Reveal as="p" className={styles.sectionStatus} delay={70}>
          {contentStatus}
        </Reveal>
      ) : null}

      <div className={styles.introPanel}>
        <Reveal className={styles.profileCard} delay={110}>
          <div className={styles.cardHeader}>
            <p className={styles.profileEyebrow}>{content.profileEyebrow}</p>
            {isAdmin ? (
              <Link className={styles.editButton} to="/admin/about#profile-card-editor">
                Edit
              </Link>
            ) : null}
          </div>
          <h3>{content.profileTitle}</h3>
          <p>{content.profileBody}</p>
        </Reveal>

        <Reveal className={styles.educationCard} delay={190}>
          <div className={styles.cardHeader}>
            <p className={styles.profileEyebrow}>{content.educationEyebrow}</p>
            {isAdmin ? (
              <Link className={styles.editButton} to="/admin/about#education-card-editor">
                Edit
              </Link>
            ) : null}
          </div>
          <h3>{content.educationTitle}</h3>
          <p>{content.educationBody}</p>
        </Reveal>
      </div>

      <div className={styles.grid}>
        {content.highlights.map((card, index) => (
          <Reveal as="article" className={styles.card} key={card.title} delay={100 + index * 90}>
            <div className={styles.cardHeader}>
              <h3>{card.title}</h3>
              {isAdmin ? (
                <Link className={styles.editButton} to={`/admin/about#highlight-card-${index + 1}`}>
                  Edit
                </Link>
                ) : null}
            </div>
            <p>{card.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className={styles.assetSection} delay={120}>
        <div className={styles.uploadHeader}>
          <div className={styles.cardHeader}>
            <p className={styles.uploadKicker}>{content.assetEyebrow}</p>
            {isAdmin ? (
              <Link className={styles.editButton} to="/admin/about#asset-section-editor">
                Edit
              </Link>
            ) : null}
          </div>
          <h3>{content.assetTitle}</h3>
          <p>{content.assetBody}</p>
        </div>

        {assetStatus ? <p className={styles.assetStatus}>{assetStatus}</p> : null}

        {resumeAssets.length > 0 ? (
          <div className={styles.assetGrid}>
            {resumeAssets.map((asset, index) => (
              <Reveal
                as="article"
                className={styles.assetCard}
                key={asset._id}
                delay={180 + index * 70}
                distance="18px"
              >
                {getAssetPreviewUrl(asset) ? (
                  <img src={getAssetPreviewUrl(asset)} alt={asset.title} />
                ) : (
                  <div className={styles.documentBadge}>{asset.format || "file"}</div>
                )}
                <div>
                  <p>Resume</p>
                  <h4>{asset.title}</h4>
                  <div className={styles.assetActions}>
                    <a
                      href={asset.secureUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={asset.originalName || asset.title}
                    >
                      Download resume
                    </a>
                    <Link to="/contact?intent=interview#contact">Invite for interview</Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className={styles.emptyAssets}>
            No public resume is published yet. Admin can add it from the private dashboard.
          </p>
        )}

        <Link className={styles.adminLink} to="/admin/login">
          Admin upload login
        </Link>
      </Reveal>
    </section>
  );
}

export default AboutSection;
