import { useEffect, useState } from "react";
import { requestJson } from "../utils/api";
import {
  adminSessionChangedEvent,
  persistAdminAuthToken,
  persistAdminSessionFlag,
  readAdminSessionFlag
} from "../utils/adminSession";

const wait = (durationMs) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(() => readAdminSessionFlag());
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const shouldRetryStoredSession = () => readAdminSessionFlag();

    const checkAdminSession = async () => {
      setIsCheckingAdmin(true);

      try {
        await requestJson("/api/admin/session", {
          credentials: "include",
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          setIsAdmin(true);
          persistAdminSessionFlag(true);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        const isUnauthorizedError =
          error.message?.toLowerCase().includes("not authorized") ||
          error.message?.toLowerCase().includes("invalid or expired session");

        if (shouldRetryStoredSession()) {
          if (!controller.signal.aborted) {
            setIsAdmin(true);
          }

          try {
            await wait(700);

            if (controller.signal.aborted) {
              return;
            }

            await requestJson("/api/admin/session", {
              credentials: "include",
              signal: controller.signal
            });

            if (!controller.signal.aborted) {
              setIsAdmin(true);
              persistAdminSessionFlag(true);
            }
          } catch (retryError) {
            if (
              retryError.name !== "AbortError" &&
              (retryError.message?.toLowerCase().includes("not authorized") ||
                retryError.message?.toLowerCase().includes("invalid or expired session") ||
                isUnauthorizedError)
            ) {
              setIsAdmin(false);
              persistAdminAuthToken("");
              persistAdminSessionFlag(false);
            }
          }
        } else if (isUnauthorizedError) {
          if (!controller.signal.aborted) {
            setIsAdmin(false);
            persistAdminAuthToken("");
            persistAdminSessionFlag(false);
          }
        } else if (!controller.signal.aborted) {
          setIsAdmin(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingAdmin(false);
        }
      }
    };

    const handleSessionChange = (event) => {
      if (typeof event.detail?.isAdmin === "boolean") {
        persistAdminAuthToken(event.detail.isAdmin ? event.detail.token || "" : "");
        persistAdminSessionFlag(event.detail.isAdmin);
        setIsAdmin(event.detail.isAdmin);
        setIsCheckingAdmin(false);
        return;
      }

      checkAdminSession().catch(() => {
        if (!controller.signal.aborted) {
          setIsCheckingAdmin(false);
        }
      });
    };

    checkAdminSession().catch(() => {
      if (!controller.signal.aborted) {
        setIsAdmin(readAdminSessionFlag());
        setIsCheckingAdmin(false);
      }
    });
    window.addEventListener(adminSessionChangedEvent, handleSessionChange);

    return () => {
      controller.abort();
      window.removeEventListener(adminSessionChangedEvent, handleSessionChange);
    };
  }, []);

  return { isAdmin, isCheckingAdmin };
}

export default useAdminSession;
