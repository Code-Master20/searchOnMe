import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAdminSession from "../hooks/useAdminSession";

function ProtectedAdminRoute() {
  const location = useLocation();
  const { isAdmin, isCheckingAdmin } = useAdminSession();

  if (isCheckingAdmin) {
    return (
      <section
        style={{
          padding: "48px 0",
          color: "var(--muted)",
          fontWeight: 600
        }}
      >
        Checking admin session...
      </section>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
