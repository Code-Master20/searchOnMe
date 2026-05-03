import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { requestJson } from "../utils/api";
import Reveal from "../components/Reveal/Reveal";
import styles from "./ProjectDetailPage.module.css";

const getProjectImages = (project) => {
  if (Array.isArray(project?.images) && project.images.length > 0) {
    return project.images.filter((image) => image?.imageUrl);
  }

  return project?.imageUrl
    ? [
        {
          imageUrl: project.imageUrl,
          imageAlt: project.imageAlt || ""
        }
      ]
    : [];
};

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("Loading project...");

  useEffect(() => {
    let isActive = true;

    const loadProject = async () => {
      try {
        const data = await requestJson(`/api/projects/${id}`);

        if (!isActive) {
          return;
        }

        setProject(data.data || null);
        setStatus("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setProject(null);
        setStatus(error.message || "Unable to load project details.");
      }
    };

    loadProject();

    return () => {
      isActive = false;
    };
  }, [id]);

  const images = useMemo(() => getProjectImages(project), [project]);

  if (!project) {
    return (
      <section className={styles.section}>
        <p className={styles.status}>{status}</p>
        <Link className={styles.backLink} to="/projects">
          Back to projects
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Reveal className={styles.heading}>
        <div>
          <p className={styles.kicker}>{project.eyebrow}</p>
          <h1>{project.title}</h1>
          <p className={styles.tag}>{project.tag}</p>
        </div>
        <Link className={styles.backLink} to="/projects">
          Back to projects
        </Link>
      </Reveal>

      <div className={styles.layout}>
        <Reveal className={styles.storyCard} delay={80}>
          <h2>Overview</h2>
          <p>{project.body}</p>
          {project.points?.length ? (
            <ul className={styles.pointsList}>
              {project.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
        </Reveal>

        <Reveal className={styles.galleryCard} delay={140}>
          <div className={styles.galleryHeader}>
            <h2>Project Images</h2>
            <span>{images.length}</span>
          </div>
          {images.length > 0 ? (
            <div className={styles.galleryGrid}>
              {images.map((image, index) => (
                <Reveal
                  as="figure"
                  className={styles.galleryItem}
                  key={`${image.imageUrl}-${index}`}
                  delay={190 + index * 70}
                  distance="14px"
                >
                  <img src={image.imageUrl} alt={image.imageAlt || `${project.title} image`} />
                  {image.imageAlt ? <figcaption>{image.imageAlt}</figcaption> : null}
                </Reveal>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No project images have been added yet.</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default ProjectDetailPage;
