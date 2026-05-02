import { chips, metrics } from "../../data/siteContent";
import Reveal from "../Reveal/Reveal";
import styles from "./HomeSection.module.css";

function HomeSection() {
  return (
    <section className={styles.section} id="home">
      <Reveal className={styles.copy} delay={40}>
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
          {metrics.map((item, index) => (
            <Reveal as="li" key={item.value} delay={140 + index * 90} distance="20px">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </Reveal>
          ))}
        </ul>
      </Reveal>

      <div className={styles.panel}>
        <Reveal className={styles.signalCard} delay={180}>
          <p className={styles.signalTitle}>Current Focus</p>
          <h2>globMe</h2>
          <p>
            My ongoing project, <strong>globMe</strong>, is where I&apos;m shaping a more
            connected, globally-minded product experience. It is actively evolving, and it anchors
            the next chapter of my portfolio.
          </p>
        </Reveal>
        <Reveal className={styles.stackCard} delay={260}>
          <span className={styles.stackLabel}>Preferred Stack</span>
          <div className={styles.chipRow}>
            {chips.map((chip, index) => (
              <Reveal as="span" key={chip} delay={320 + index * 55} distance="14px">
                {chip}
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default HomeSection;
