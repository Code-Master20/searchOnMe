import { useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import MainLayout from "./layouts/MainLayout";
import AdminAssetsPage from "./pages/AdminAssetsPage";
import AdminAboutPage from "./pages/AdminAboutPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HelpPage from "./pages/HelpPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectsPage from "./pages/ProjectsPage";
import ResponsesPage from "./pages/ResponsesPage";
import ThisProjectPage from "./pages/ThisProjectPage";

function App() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <Routes>
      <Route element={<MainLayout year={year} />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/this-project" element={<ThisProjectPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/responses" element={<ResponsesPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/panel" element={<AdminPanelPage />} />
          <Route path="/admin/about" element={<AdminAboutPage />} />
          <Route path="/admin/messages" element={<AdminMessagesPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/assets" element={<AdminAssetsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
