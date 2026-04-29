import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aboutHighlights } from "../../data/siteContent";
import { requestJson } from "../../utils/api";
import styles from "./AboutSection.module.css";

const categoryLabels = {
  resume: "Resume",
  education: "Education",
  image: "Photo"
};

function AboutSection() {
  const [assets, setAssets] = useState([]);
  const [assetStatus, setAssetStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();

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
        <h2>MERN stack development, academic growth, and a personal portfolio you can keep evolving.</h2>
      </div>

      <div className={styles.introPanel}>
        <div className={styles.profileCard}>
          <p className={styles.profileEyebrow}>Sahidur Miah</p>
          <h3>MERN Stack Developer</h3>
          <p>
            I focus on building full-stack web products with React, Node.js, Express, and MongoDB.
            I care about clean code, useful interfaces, and backend systems that feel dependable in
            real use.
          </p>
        </div>

        <div className={styles.educationCard}>
          <p className={styles.profileEyebrow}>Current education</p>
          <h3>BCA at Amity University Online</h3>
          <p>
            I am currently doing BCA in Amity University Online while continuing to grow as a MERN
            stack developer through practical portfolio work and ongoing product building.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {aboutHighlights.map((card) => (
          <article className={styles.card} key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.assetSection}>
        <div className={styles.uploadHeader}>
          <p className={styles.uploadKicker}>Admin-managed portfolio assets</p>
          <h3>Resume, education documents, and photos are managed privately by admin.</h3>
          <p>
            Public visitors can view approved portfolio assets, but only Sahidur Miah can upload
            them through the private Cloudinary asset manager.
          </p>
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
