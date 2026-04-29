import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <section className={styles.section}>
      <p className={styles.kicker}>Not Found</p>
      <h1>That page does not exist in searchOnMe.</h1>
      <p>
        The page you tried to open is missing or the route is incorrect. You can head back to the
        main portfolio and continue browsing from there.
      </p>
      <Link className={styles.link} to="/">
        Return home
      </Link>
    </section>
  );
}

export default NotFoundPage;
