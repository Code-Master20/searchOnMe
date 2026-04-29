import { chips, metrics } from "../../data/siteContent";
import styles from "./HomeSection.module.css";

function HomeSection() {
  return (
    <section className={styles.section} id="home">
      <div className={styles.copy}>
        <p className={styles.kicker}>MERN stack developer / portfolio home</p>
        <h1 className={styles.title}>
          I build modern MERN experiences with
          <span> clean systems</span>, thoughtful UI, and secure backend logic.
        </h1>
        <p className={styles.text}>
          I&apos;m Sahidur Miah, currently working as a MERN stack developer and currently doing
          BCA at Amity University Online. searchOnMe is where I present my work, my growth, and
          the systems I&apos;m building now.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="#contact">
            Start a conversation
          </a>
          <a className={styles.secondaryButton} href="#this-project">
            Explore this project
          </a>
        </div>
        <ul className={styles.metrics}>
          {metrics.map((item) => (
            <li key={item.value}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.panel}>
        <div className={styles.signalCard}>
          <p className={styles.signalTitle}>Current Focus</p>
          <h2>globMe</h2>
          <p>
            My ongoing project, <strong>globMe</strong>, is where I&apos;m shaping a more
            connected, globally-minded product experience. It is actively evolving, and it anchors
            the next chapter of my portfolio.
          </p>
        </div>
        <div className={styles.stackCard}>
          <span className={styles.stackLabel}>Preferred Stack</span>
          <div className={styles.chipRow}>
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSection;
