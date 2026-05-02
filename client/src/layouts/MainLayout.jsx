import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import styles from "./MainLayout.module.css";

const SkeletonBar = ({ className = "" }) => (
  <span className={`${styles.skeletonBar} ${className}`.trim()} />
);

const SkeletonCard = ({ className = "", children }) => (
  <article className={`${styles.skeletonCard} ${className}`.trim()}>{children}</article>
);

function RouteSkeleton({ pathname }) {
  if (pathname === "/" || pathname === "") {
    return (
      <div className={styles.skeletonHome}>
        <div className={styles.skeletonTwoColumn}>
          <section className={styles.skeletonHeroPanel}>
            <SkeletonBar className={styles.kickerBar} />
            <SkeletonBar className={styles.titleBarWide} />
            <SkeletonBar className={styles.titleBarMedium} />
            <SkeletonBar className={styles.bodyBarWide} />
            <SkeletonBar className={styles.bodyBarMedium} />
            <div className={styles.skeletonActionRow}>
              <SkeletonBar className={styles.buttonBar} />
              <SkeletonBar className={styles.buttonBarMuted} />
            </div>
            <div className={styles.skeletonMetricsRow}>
              {[0, 1, 2].map((item) => (
                <SkeletonCard key={item} className={styles.metricCard}>
                  <SkeletonBar className={styles.metricNumberBar} />
                  <SkeletonBar className={styles.metricTextBar} />
                  <SkeletonBar className={styles.metricTextShortBar} />
                </SkeletonCard>
              ))}
            </div>
          </section>

          <div className={styles.skeletonColumn}>
            <SkeletonCard className={styles.tallCard}>
              <SkeletonBar className={styles.cardKickerBar} />
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyShortBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
            </SkeletonCard>
            <SkeletonCard>
              <SkeletonBar className={styles.cardKickerBar} />
              <div className={styles.skeletonChipRow}>
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <SkeletonBar className={styles.chipBar} key={item} />
                ))}
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    );
  }

  if (pathname === "/about") {
    return (
      <div className={styles.skeletonSection}>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarWide} />
        </section>
        <div className={styles.skeletonTwoColumn}>
          {[0, 1].map((item) => (
            <SkeletonCard key={item} className={styles.mediumCard}>
              <SkeletonBar className={styles.cardKickerBar} />
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
              <SkeletonBar className={styles.cardBodyShortBar} />
            </SkeletonCard>
          ))}
        </div>
        <div className={styles.skeletonGridThree}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item}>
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
            </SkeletonCard>
          ))}
        </div>
        <section className={styles.skeletonAssetBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarMedium} />
          <SkeletonBar className={styles.bodyBarWide} />
          <div className={styles.skeletonGridThree}>
            {[0, 1, 2].map((item) => (
              <SkeletonCard key={item}>
                <SkeletonBar className={styles.mediaBar} />
                <SkeletonBar className={styles.cardTitleBar} />
                <SkeletonBar className={styles.cardBodyShortBar} />
              </SkeletonCard>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (pathname === "/projects" || pathname === "/help") {
    return (
      <div className={styles.skeletonSection}>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarWide} />
          <SkeletonBar className={styles.bodyBarMedium} />
        </section>
        <div className={styles.skeletonGridThree}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item} className={styles.mediumCard}>
              <SkeletonBar className={styles.mediaBar} />
              <SkeletonBar className={styles.cardKickerBar} />
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
            </SkeletonCard>
          ))}
        </div>
      </div>
    );
  }

  if (pathname === "/contact") {
    return (
      <div className={styles.skeletonTwoColumn}>
        <section className={styles.skeletonHeroPanel}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarMedium} />
          <SkeletonBar className={styles.bodyBarWide} />
          <SkeletonBar className={styles.bodyBarMedium} />
          <div className={styles.skeletonContactPoints}>
            <SkeletonBar className={styles.contactLineBar} />
            <SkeletonBar className={styles.contactLineShortBar} />
          </div>
        </section>
        <SkeletonCard className={styles.formCard}>
          {[0, 1, 2].map((item) => (
            <div className={styles.skeletonField} key={item}>
              <SkeletonBar className={styles.fieldLabelBar} />
              <SkeletonBar className={item === 2 ? styles.fieldAreaBar : styles.fieldInputBar} />
            </div>
          ))}
          <SkeletonBar className={styles.buttonBar} />
          <SkeletonBar className={styles.bodyBarMedium} />
        </SkeletonCard>
      </div>
    );
  }

  if (pathname === "/responses") {
    return (
      <div className={styles.skeletonSection}>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarMedium} />
        </section>
        <div className={styles.skeletonList}>
          {[0, 1].map((item) => (
            <SkeletonCard key={item} className={styles.responseCard}>
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
              <SkeletonBar className={styles.replyBoxBar} />
            </SkeletonCard>
          ))}
        </div>
      </div>
    );
  }

  if (pathname === "/this-project") {
    return (
      <div className={styles.skeletonSection}>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarWide} />
        </section>
        <div className={styles.skeletonTwoColumn}>
          {[0, 1].map((item) => (
            <SkeletonCard key={item} className={styles.mediumCard}>
              <SkeletonBar className={styles.cardKickerBar} />
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
              <SkeletonBar className={styles.cardBodyShortBar} />
            </SkeletonCard>
          ))}
        </div>
        <div className={styles.skeletonGridThree}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item} className={styles.mediumCard}>
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyBar} />
              <SkeletonBar className={styles.cardBodyWideBar} />
              <SkeletonBar className={styles.cardBodyShortBar} />
            </SkeletonCard>
          ))}
        </div>
        <div className={styles.skeletonTwoColumn}>
          {[0, 1].map((item) => (
            <SkeletonCard key={item}>
              <SkeletonBar className={styles.cardTitleBar} />
              <div className={styles.skeletonChipRow}>
                {[0, 1, 2, 3, 4].map((chip) => (
                  <SkeletonBar className={styles.chipBar} key={chip} />
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
        <SkeletonCard className={styles.routesSkeleton}>
          <SkeletonBar className={styles.cardTitleBar} />
          <div className={styles.skeletonRouteWrap}>
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <SkeletonBar className={styles.routeBar} key={item} />
            ))}
          </div>
        </SkeletonCard>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return (
      <div className={styles.skeletonAuthWrap}>
        <SkeletonCard className={styles.authCard}>
          <div className={styles.skeletonToggleRow}>
            <SkeletonBar className={styles.toggleBar} />
            <SkeletonBar className={styles.toggleBar} />
          </div>
          <div className={styles.skeletonField}>
            <SkeletonBar className={styles.fieldLabelBar} />
            <SkeletonBar className={styles.fieldInputBar} />
          </div>
          <div className={styles.skeletonField}>
            <SkeletonBar className={styles.fieldLabelBar} />
            <SkeletonBar className={styles.fieldInputBar} />
          </div>
          <SkeletonBar className={styles.buttonBar} />
        </SkeletonCard>
      </div>
    );
  }

  if (pathname === "/admin/panel") {
    return (
      <div className={styles.skeletonSection}>
        <div className={styles.skeletonActionRow}>
          {[0, 1, 2, 3, 4].map((item) => (
            <SkeletonBar className={styles.actionPillBar} key={item} />
          ))}
        </div>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarWide} />
          <SkeletonBar className={styles.bodyBarWide} />
        </section>
        <div className={styles.skeletonGridThree}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item}>
              <SkeletonBar className={styles.metricNumberBar} />
              <SkeletonBar className={styles.cardTitleBar} />
              <SkeletonBar className={styles.cardBodyShortBar} />
            </SkeletonCard>
          ))}
        </div>
        <div className={styles.skeletonTwoColumn}>
          <SkeletonCard className={styles.mediumCard}>
            <SkeletonBar className={styles.cardTitleBar} />
            <div className={styles.skeletonGridTwo}>
              {[0, 1, 2, 3].map((item) => (
                <SkeletonBar className={styles.actionTileBar} key={item} />
              ))}
            </div>
          </SkeletonCard>
          <SkeletonCard className={styles.mediumCard}>
            <SkeletonBar className={styles.cardTitleBar} />
            {[0, 1, 2].map((item) => (
              <SkeletonBar className={styles.listItemBar} key={item} />
            ))}
          </SkeletonCard>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/messages") {
    return (
      <div className={styles.skeletonSection}>
        <div className={styles.skeletonActionRow}>
          {[0, 1, 2, 3, 4].map((item) => (
            <SkeletonBar className={styles.actionPillBar} key={item} />
          ))}
        </div>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarMedium} />
        </section>
        <div className={styles.skeletonAdminSplit}>
          <SkeletonCard className={styles.mediumCard}>
            {[0, 1, 2].map((item) => (
              <div className={styles.skeletonMessageRow} key={item}>
                <SkeletonBar className={styles.cardTitleBar} />
                <SkeletonBar className={styles.cardBodyBar} />
                <SkeletonBar className={styles.cardBodyShortBar} />
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard className={styles.detailCard}>
            <SkeletonBar className={styles.cardTitleBar} />
            <SkeletonBar className={styles.bodyBarWide} />
            <SkeletonBar className={styles.replyBoxBar} />
            <SkeletonBar className={styles.buttonBar} />
          </SkeletonCard>
        </div>
      </div>
    );
  }

  if (
    pathname === "/admin/about" ||
    pathname === "/admin/projects" ||
    pathname === "/admin/assets"
  ) {
    return (
      <div className={styles.skeletonSection}>
        <div className={styles.skeletonActionRow}>
          {[0, 1, 2, 3, 4].map((item) => (
            <SkeletonBar className={styles.actionPillBar} key={item} />
          ))}
        </div>
        <section className={styles.skeletonHeadingBlock}>
          <SkeletonBar className={styles.kickerBar} />
          <SkeletonBar className={styles.titleBarMedium} />
          <SkeletonBar className={styles.bodyBarWide} />
        </section>
        <div className={styles.skeletonAdminSplit}>
          <SkeletonCard className={styles.formCard}>
            {[0, 1, 2, 3].map((item) => (
              <div className={styles.skeletonField} key={item}>
                <SkeletonBar className={styles.fieldLabelBar} />
                <SkeletonBar className={item === 2 ? styles.fieldAreaBar : styles.fieldInputBar} />
              </div>
            ))}
            <SkeletonBar className={styles.buttonBar} />
          </SkeletonCard>
          <div className={styles.skeletonColumn}>
            {[0, 1].map((item) => (
              <SkeletonCard key={item} className={styles.mediumCard}>
                <SkeletonBar className={styles.mediaBar} />
                <SkeletonBar className={styles.cardTitleBar} />
                <SkeletonBar className={styles.cardBodyBar} />
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.skeletonSection}>
      <section className={styles.skeletonHeadingBlock}>
        <SkeletonBar className={styles.kickerBar} />
        <SkeletonBar className={styles.titleBarMedium} />
        <SkeletonBar className={styles.bodyBarMedium} />
      </section>
    </div>
  );
}

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
            <RouteSkeleton pathname={location.pathname} />
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
