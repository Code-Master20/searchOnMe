import { helpCards } from "../../data/siteContent";
import styles from "./HelpSection.module.css";

function HelpSection() {
  return (
    <section className={styles.section} id="help">
      <div className={styles.heading}>
        <p className={styles.kicker}>Help</p>
        <h2>Everything here is set up to make communication easier and more professional.</h2>
      </div>
      <div className={styles.grid}>
        {helpCards.map((item) => (
          <article className={styles.card} key={item.number}>
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HelpSection;
