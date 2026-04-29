import styles from "./Footer.module.css";

function Footer({ year }) {
  return (
    <footer className={styles.footer}>
      <p>searchOnMe by Sahidur Miah</p>
      <p>Built with React, a secure contact workflow, and room to grow.</p>
      <p>{year}</p>
    </footer>
  );
}

export default Footer;
