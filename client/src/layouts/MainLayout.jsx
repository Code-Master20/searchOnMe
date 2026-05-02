import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import styles from "./MainLayout.module.css";

function MainLayout({ year }) {
  const location = useLocation();
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    setShowSkeleton(true);

    const timer = window.setTimeout(() => {
      setShowSkeleton(false);
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        {showSkeleton ? (
          <div className={styles.skeletonScreen} aria-hidden="true">
            <div className={styles.skeletonHero}>
              <span className={styles.skeletonKicker} />
              <span className={styles.skeletonTitle} />
              <span className={styles.skeletonTitleShort} />
              <span className={styles.skeletonBody} />
              <span className={styles.skeletonBodyWide} />
            </div>
            <div className={styles.skeletonGrid}>
              <article className={styles.skeletonCard}>
                <span className={styles.skeletonCardMedia} />
                <span className={styles.skeletonCardTitle} />
                <span className={styles.skeletonCardBody} />
                <span className={styles.skeletonCardBodyShort} />
              </article>
              <article className={styles.skeletonCard}>
                <span className={styles.skeletonCardMedia} />
                <span className={styles.skeletonCardTitle} />
                <span className={styles.skeletonCardBody} />
                <span className={styles.skeletonCardBodyShort} />
              </article>
              <article className={styles.skeletonCard}>
                <span className={styles.skeletonCardMedia} />
                <span className={styles.skeletonCardTitle} />
                <span className={styles.skeletonCardBody} />
                <span className={styles.skeletonCardBodyShort} />
              </article>
            </div>
          </div>
        ) : (
          <div key={location.pathname} className={styles.pageFrame}>
            <Outlet />
          </div>
        )}
      </main>
      <Footer year={year} />
    </div>
  );
}

export default MainLayout;
