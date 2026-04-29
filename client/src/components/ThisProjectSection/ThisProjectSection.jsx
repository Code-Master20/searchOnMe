import {
  thisProjectApiRoutes,
  thisProjectBackendDependencies,
  thisProjectDeployment,
  thisProjectFeatureGroups,
  thisProjectFrontendDependencies,
  thisProjectOverview
} from "../../data/siteContent";
import styles from "./ThisProjectSection.module.css";

function ThisProjectSection() {
  return (
    <section className={styles.section} id="this-project">
      <div className={styles.heading}>
        <p className={styles.kicker}>This Project</p>
        <h2>searchOnMe is the portfolio system I built to present work with structure and trust.</h2>
      </div>

      <div className={styles.layout}>
        <article className={styles.storyCard}>
          <p className={styles.eyebrow}>Project overview</p>
          <h3>{thisProjectOverview.title}</h3>
          <p>{thisProjectOverview.body}</p>
        </article>

        <article className={styles.detailsCard}>
          <p className={styles.eyebrow}>Deployment model</p>
          <ul className={styles.list}>
            {thisProjectDeployment.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className={styles.featureGrid}>
        {thisProjectFeatureGroups.map((group) => (
          <article className={styles.featureCard} key={group.title}>
            <p className={styles.eyebrow}>{group.title}</p>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className={styles.techGrid}>
        <article className={styles.stackCard}>
          <p className={styles.eyebrow}>Frontend dependencies</p>
          <div className={styles.chips}>
            {thisProjectFrontendDependencies.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>

        <article className={styles.stackCard}>
          <p className={styles.eyebrow}>Backend dependencies</p>
          <div className={styles.chips}>
            {thisProjectBackendDependencies.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </div>

      <article className={styles.routesCard}>
        <p className={styles.eyebrow}>Backend API routes</p>
        <div className={styles.routes}>
          {thisProjectApiRoutes.map((route) => (
            <code className={styles.route} key={route}>
              {route}
            </code>
          ))}
        </div>
      </article>
    </section>
  );
}

export default ThisProjectSection;
