import { useEffect, useState } from "react";
import { requestJson } from "../utils/api";
import { adminSessionChangedEvent } from "../utils/adminSession";

function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const checkAdminSession = () => {
      setIsCheckingAdmin(true);

      requestJson("/api/admin/session", {
        credentials: "include",
        signal: controller.signal
      })
        .then(() => {
          setIsAdmin(true);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setIsAdmin(false);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsCheckingAdmin(false);
          }
        });
    };

    const handleSessionChange = (event) => {
      if (typeof event.detail?.isAdmin === "boolean") {
        setIsAdmin(event.detail.isAdmin);
        setIsCheckingAdmin(false);
        return;
      }

      checkAdminSession();
    };

    checkAdminSession();
    window.addEventListener(adminSessionChangedEvent, handleSessionChange);

    return () => {
      controller.abort();
      window.removeEventListener(adminSessionChangedEvent, handleSessionChange);
    };
  }, []);

  return { isAdmin, isCheckingAdmin };
}

export default useAdminSession;
