import Reveal from "../Reveal/Reveal";
import styles from "./Footer.module.css";

function Footer({ year }) {
  return (
    <Reveal as="footer" className={styles.footer} delay={80} distance="18px">
      <p>searchOnMe by Sahidur Miah</p>
      <p>Built with React, a secure contact workflow, and room to grow.</p>
      <p>{year}</p>
    </Reveal>
  );
}

export default Footer;
