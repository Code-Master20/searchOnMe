import { projects, projectsSectionNote } from "../../data/siteContent";
import styles from "./ProjectsSection.module.css";

function ProjectsSection() {
  return (
    <section className={styles.section} id="projects">
      <div className={styles.heading}>
        <p className={styles.kicker}>Selected Work</p>
        <h2>Projects that combine implementation discipline with product thinking.</h2>
      </div>
      <p className={styles.note}>{projectsSectionNote}</p>
      <div className={styles.grid}>
        {projects.map((project) => (
          <article
            className={`${styles.card} ${project.featured ? styles.featured : ""}`}
            key={project.title}
          >
            <div className={styles.meta}>
              <span>{project.eyebrow}</span>
              <span>{project.tag}</span>
            </div>
            <h3>{project.title}</h3>
            <p>{project.body}</p>
            {project.points ? (
              <ul>
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
