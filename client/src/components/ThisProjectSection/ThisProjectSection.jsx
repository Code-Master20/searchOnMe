import {
  thisProjectApiRoutes,
  thisProjectBackendDependencies,
  thisProjectDeployment,
  thisProjectFeatureGroups,
  thisProjectFrontendDependencies,
  thisProjectOverview
} from "../../data/siteContent";
import Reveal from "../Reveal/Reveal";
import styles from "./ThisProjectSection.module.css";

function ThisProjectSection() {
  return (
    <section className={styles.section} id="this-project">
      <Reveal className={styles.heading}>
        <p className={styles.kicker}>This Project</p>
        <h2>searchOnMe is the portfolio system I built to present work with structure and trust.</h2>
      </Reveal>

      <div className={styles.layout}>
        <Reveal as="article" className={styles.storyCard} delay={80}>
          <p className={styles.eyebrow}>Project overview</p>
          <h3>{thisProjectOverview.title}</h3>
          <p>{thisProjectOverview.body}</p>
        </Reveal>

        <Reveal as="article" className={styles.detailsCard} delay={160}>
          <p className={styles.eyebrow}>Deployment model</p>
          <ul className={styles.list}>
            {thisProjectDeployment.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className={styles.featureGrid}>
        {thisProjectFeatureGroups.map((group, index) => (
          <Reveal
            as="article"
            className={styles.featureCard}
            key={group.title}
            delay={120 + index * 90}
          >
            <p className={styles.eyebrow}>{group.title}</p>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <div className={styles.techGrid}>
        <Reveal as="article" className={styles.stackCard} delay={140}>
          <p className={styles.eyebrow}>Frontend dependencies</p>
          <div className={styles.chips}>
            {thisProjectFrontendDependencies.map((item, index) => (
              <Reveal as="span" key={item} delay={200 + index * 50} distance="12px">
                {item}
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal as="article" className={styles.stackCard} delay={220}>
          <p className={styles.eyebrow}>Backend dependencies</p>
          <div className={styles.chips}>
            {thisProjectBackendDependencies.map((item, index) => (
              <Reveal as="span" key={item} delay={260 + index * 40} distance="12px">
                {item}
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal as="article" className={styles.routesCard} delay={180}>
        <p className={styles.eyebrow}>Backend API routes</p>
        <div className={styles.routes}>
          {thisProjectApiRoutes.map((route, index) => (
            <Reveal
              as="code"
              className={styles.route}
              key={route}
              delay={220 + index * 28}
              distance="10px"
            >
              {route}
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default ThisProjectSection;
