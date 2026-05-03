import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAdminSession from "../../hooks/useAdminSession";
import { requestJson } from "../../utils/api";
import { defaultProjects, projectsSectionNote } from "../../data/siteContent";
import Reveal from "../Reveal/Reveal";
import styles from "./ProjectsSection.module.css";

const getProjectImages = (project) => {
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images.filter((image) => image?.imageUrl);
  }

  return project.imageUrl
    ? [
        {
          imageUrl: project.imageUrl,
          imageAlt: project.imageAlt || ""
        }
      ]
    : [];
};

function ProjectsSection() {
  const [projects, setProjects] = useState(defaultProjects);
  const [status, setStatus] = useState("");
  const { isAdmin } = useAdminSession();

  useEffect(() => {
    let isActive = true;

    const loadProjects = async () => {
      try {
        const data = await requestJson("/api/projects");

        if (!isActive) {
          return;
        }

        setProjects(data.data || []);
        setStatus("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setProjects(defaultProjects);
        setStatus("Showing saved portfolio projects while live updates reconnect.");
      }
    };

    loadProjects();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className={styles.section} id="projects">
      <Reveal className={styles.heading}>
        <div>
          <p className={styles.kicker}>Selected Work</p>
          <h2>Projects that combine implementation discipline with product thinking.</h2>
        </div>
        {isAdmin ? (
          <Link className={styles.adminControl} to="/admin/projects">
            Open project manager
          </Link>
        ) : null}
      </Reveal>
      <Reveal as="p" className={styles.note} delay={70}>
        {projectsSectionNote}
      </Reveal>
      {status ? (
        <Reveal as="p" className={styles.status} delay={110}>
          {status}
        </Reveal>
      ) : null}
      <div className={styles.grid}>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <Reveal
              as="article"
              className={`${styles.card} ${project.featured ? styles.featured : ""}`}
              key={project._id || project.title}
              delay={130 + index * 90}
              distance="22px"
            >
              {getProjectImages(project).length > 0 ? (
                <div className={styles.projectGallery}>
                  {getProjectImages(project).map((image, imageIndex) => (
                    <Reveal
                      as="img"
                      className={styles.projectImage}
                      key={`${project._id || project.title}-${image.imageUrl}-${imageIndex}`}
                      src={image.imageUrl}
                      alt={image.imageAlt || `${project.title} project image`}
                      delay={180 + imageIndex * 60}
                      distance="14px"
                    />
                  ))}
                </div>
              ) : null}
              <div className={styles.meta}>
                <span>{project.eyebrow}</span>
                <div className={styles.metaActions}>
                  <span>{project.tag}</span>
                  {isAdmin && project._id ? (
                    <Link className={styles.editButton} to={`/admin/projects?edit=${project._id}`}>
                      Edit
                    </Link>
                  ) : null}
                </div>
              </div>
              {project._id ? (
                <h3>
                  <Link className={styles.projectLink} to={`/projects/${project._id}`}>
                    {project.title}
                  </Link>
                </h3>
              ) : (
                <h3>{project.title}</h3>
              )}
              <p>{project.body}</p>
              {project.points?.length ? (
                <ul>
                  {project.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
              {project._id ? (
                <Link className={styles.readMoreLink} to={`/projects/${project._id}`}>
                  Read more about this project
                </Link>
              ) : null}
            </Reveal>
          ))
        ) : (
          <Reveal className={styles.emptyState} delay={140}>
            Sahidur has not published any projects here yet. New work will appear once it is added
            from the admin area.
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
