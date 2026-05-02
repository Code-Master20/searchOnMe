import { helpCards } from "../../data/siteContent";
import Reveal from "../Reveal/Reveal";
import styles from "./HelpSection.module.css";

function HelpSection() {
  return (
    <section className={styles.section} id="help">
      <Reveal className={styles.heading}>
        <p className={styles.kicker}>Help</p>
        <h2>Everything here is set up to make communication easier and more professional.</h2>
      </Reveal>
      <div className={styles.grid}>
        {helpCards.map((item, index) => (
          <Reveal as="article" className={styles.card} key={item.number} delay={100 + index * 90}>
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default HelpSection;
