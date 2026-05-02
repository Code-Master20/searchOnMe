import { useEffect, useState } from "react";
import { requestJson } from "../utils/api";

function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

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

    return () => controller.abort();
  }, []);

  return { isAdmin, isCheckingAdmin };
}

export default useAdminSession;
