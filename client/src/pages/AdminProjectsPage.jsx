import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { requestJson } from "../utils/api";
import styles from "./AdminProjectsPage.module.css";

const initialForm = {
  eyebrow: "",
  tag: "",
  title: "",
  body: "",
  imageUrl: "",
  imageAlt: "",
  projectImages: [],
  pointsText: "",
  featured: false,
  displayOrder: 0
};

const getProjectImages = (project) => {
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images
      .map((image) => ({
        imageUrl: image.imageUrl || "",
        imageAlt: image.imageAlt || ""
      }))
      .filter((image) => image.imageUrl);
  }

  return project.imageUrl
    ? [
        {
          imageUrl: project.imageUrl,
          imageAlt: project.imageAlt || ""
        }
      ]
    : [];
};

const mapProjectToForm = (project) => ({
  eyebrow: project.eyebrow || "",
  tag: project.tag || "",
  title: project.title || "",
  body: project.body || "",
  imageUrl: "",
  imageAlt: "",
  projectImages: getProjectImages(project),
  pointsText: Array.isArray(project.points) ? project.points.join("\n") : "",
  featured: Boolean(project.featured),
  displayOrder: Number.isFinite(Number(project.displayOrder)) ? Number(project.displayOrder) : 0
});

const formatProjectPayload = (form) => ({
  eyebrow: form.eyebrow.trim(),
  tag: form.tag.trim(),
  title: form.title.trim(),
  body: form.body.trim(),
  images: form.projectImages.map((image) => ({
    imageUrl: image.imageUrl.trim(),
    imageAlt: image.imageAlt.trim()
  })),
  points: form.pointsText
    .split("\n")
    .map((point) => point.trim())
    .filter(Boolean),
  featured: Boolean(form.featured),
  displayOrder: Number.isFinite(Number(form.displayOrder)) ? Number(form.displayOrder) : 0
});

function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const editingProject = useMemo(
    () => projects.find((project) => project._id === editingId) || null,
    [projects, editingId]
  );

  const loadProjects = async () => {
    setIsLoading(true);

    try {
      const [projectsData, assetsData] = await Promise.all([
        requestJson("/api/admin/projects", {
          credentials: "include"
        }),
        requestJson("/api/admin/assets", {
          credentials: "include"
        })
      ]);

      setProjects(projectsData.data || []);
      setImageAssets((assetsData.data || []).filter((asset) => asset.category === "image"));
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Unable to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageSelect = (event) => {
    const nextImageUrl = event.target.value;
    const selectedAsset = imageAssets.find((asset) => asset.secureUrl === nextImageUrl);

    setForm((current) => ({
      ...current,
      imageUrl: nextImageUrl,
      imageAlt: nextImageUrl
        ? selectedAsset?.title || current.imageAlt || `${current.title || "Project"} image`
        : ""
    }));
  };

  const handleAddImage = () => {
    if (!form.imageUrl) {
      setStatus("Choose an image first before adding it to the project.");
      return;
    }

    if (form.projectImages.some((image) => image.imageUrl === form.imageUrl)) {
      setStatus("That image is already attached to this project.");
      return;
    }

    setForm((current) => {
      return {
        ...current,
        projectImages: [
          ...current.projectImages,
          {
            imageUrl: current.imageUrl,
            imageAlt: current.imageAlt.trim()
          }
        ],
        imageUrl: "",
        imageAlt: ""
      };
    });
    setStatus("Project image added to the gallery.");
  };

  const handleRemoveImage = (imageUrl) => {
    setForm((current) => ({
      ...current,
      projectImages: current.projectImages.filter((image) => image.imageUrl !== imageUrl)
    }));
  };

  const resetEditor = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(editingId ? "Updating project..." : "Saving project...");

    try {
      const payload = formatProjectPayload(form);
      const endpoint = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";

      const data = await requestJson(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const savedProject = data.data;
      setProjects((current) => {
        const exists = current.some((project) => project._id === savedProject._id);
        const nextProjects = exists
          ? current.map((project) => (project._id === savedProject._id ? savedProject : project))
          : [...current, savedProject];

        return nextProjects.sort(
          (left, right) =>
            Number(left.displayOrder || 0) - Number(right.displayOrder || 0) ||
            new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
        );
      });
      setStatus(editingId ? "Project updated successfully." : "Project saved successfully.");
      resetEditor();
    } catch (error) {
      setStatus(error.message || "Unable to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm(mapProjectToForm(project));
    setStatus(`Editing "${project.title}".`);
  };

  const handleDelete = async (projectId) => {
    try {
      await requestJson(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include"
      });

      setProjects((current) => current.filter((project) => project._id !== projectId));
      if (editingId === projectId) {
        resetEditor();
      }
      setStatus("Project removed successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to remove project.");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setStatus("Closing admin session...");

    try {
      await requestJson("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });

      setStatus("Logged out successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showLoginLink =
    status.toLowerCase().includes("authorized") || status.toLowerCase().includes("login");

  return (
    <section className={styles.section}>
      <div className={styles.actionRow}>
        <Link className={styles.secondaryLink} to="/admin/about">
          Open about editor
        </Link>
        <Link className={styles.secondaryLink} to="/admin/messages">
          Open admin inbox
        </Link>
        <Link className={styles.secondaryLink} to="/admin/assets">
          Open asset manager
        </Link>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <div className={styles.heading}>
        <p className={styles.kicker}>Admin projects</p>
        <h1>Publish and maintain projects for the public portfolio page.</h1>
        <p>
          Use this protected space to add project details, set featured work, control order, and
          update the Projects navigation whenever new work is ready.
        </p>
      </div>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      {showLoginLink ? (
        <Link className={styles.loginLink} to="/admin/login">
          Go to admin login
        </Link>
      ) : null}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2>{editingProject ? "Edit project" : "Add project"}</h2>
            {editingProject ? (
              <button type="button" className={styles.ghostButton} onClick={resetEditor}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <label>
            <span>Eyebrow</span>
            <input
              type="text"
              name="eyebrow"
              maxLength="80"
              placeholder="Ongoing project"
              value={form.eyebrow}
              onChange={handleChange}
              required
            />
          </label>

          <div className={styles.formRow}>
            <label>
              <span>Tag</span>
              <input
                type="text"
                name="tag"
                maxLength="120"
                placeholder="Social platform"
                value={form.tag}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Display order</span>
              <input
                type="number"
                name="displayOrder"
                min="0"
                max="999"
                value={form.displayOrder}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            <span>Title</span>
            <input
              type="text"
              name="title"
              maxLength="120"
              placeholder="globMe"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              name="body"
              rows="6"
              maxLength="5000"
              placeholder="Describe the project, direction, stack, and purpose."
              value={form.body}
              onChange={handleChange}
              required
            />
          </label>

          <div className={styles.formRow}>
            <label>
              <span>Add project image</span>
              <select name="imageUrl" value={form.imageUrl} onChange={handleImageSelect}>
                <option value="">Choose an uploaded image</option>
                {imageAssets.map((asset) => (
                  <option key={asset._id} value={asset.secureUrl}>
                    {asset.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Image alt text</span>
              <input
                type="text"
                name="imageAlt"
                maxLength="180"
                placeholder="Describe the image for accessibility"
                value={form.imageAlt}
                onChange={handleChange}
              />
            </label>
          </div>

          <button type="button" className={styles.ghostButton} onClick={handleAddImage}>
            Add image to project
          </button>

          {imageAssets.length === 0 ? (
            <p className={styles.helperText}>
              No image assets are available yet. Upload as many as you need in the asset manager,
              then return here to attach them to a specific project.
            </p>
          ) : null}

          {form.imageUrl ? (
            <div className={styles.previewPanel}>
              <p className={styles.previewLabel}>Selected image preview</p>
              <img
                className={styles.previewImage}
                src={form.imageUrl}
                alt={form.imageAlt || `${form.title || "Project"} preview`}
              />
            </div>
          ) : null}

          {form.projectImages.length > 0 ? (
            <div className={styles.previewPanel}>
              <p className={styles.previewLabel}>Project gallery</p>
              <div className={styles.galleryGrid}>
                {form.projectImages.map((image) => (
                  <article className={styles.galleryCard} key={image.imageUrl}>
                    <img
                      className={styles.galleryImage}
                      src={image.imageUrl}
                      alt={image.imageAlt || `${form.title || "Project"} gallery image`}
                    />
                    <p className={styles.galleryMeta}>{image.imageAlt || "No alt text added yet"}</p>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleRemoveImage(image.imageUrl)}
                    >
                      Remove image
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <label>
            <span>Highlight points</span>
            <textarea
              name="pointsText"
              rows="5"
              placeholder="One point per line"
              value={form.pointsText}
              onChange={handleChange}
            />
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            <span>Mark as featured project</span>
          </label>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : editingProject ? "Update project" : "Add project"}
          </button>
        </form>

        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <h2>Published projects</h2>
            <span>{projects.length}</span>
          </div>

          {isLoading ? (
            <p className={styles.emptyState}>Loading admin projects...</p>
          ) : projects.length > 0 ? (
            <div className={styles.projectList}>
              {projects.map((project) => (
                <article className={styles.projectCard} key={project._id}>
                  {getProjectImages(project).length > 0 ? (
                    <div className={styles.cardGallery}>
                      {getProjectImages(project).map((image) => (
                        <img
                          className={styles.cardImage}
                          key={`${project._id}-${image.imageUrl}`}
                          src={image.imageUrl}
                          alt={image.imageAlt || `${project.title} preview`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className={styles.cardTop}>
                    <div>
                      <p className={styles.cardMeta}>
                        {project.eyebrow} / {project.tag}
                      </p>
                      <h3>{project.title}</h3>
                    </div>
                    {project.featured ? <span className={styles.badge}>Featured</span> : null}
                  </div>

                  <p className={styles.cardBody}>{project.body}</p>

                  {project.points?.length ? (
                    <ul className={styles.pointsList}>
                      {project.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className={styles.cardFooter}>
                    <span>Order: {project.displayOrder ?? 0}</span>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.ghostButton} onClick={() => handleEdit(project)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(project._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              No admin-managed projects yet. Add one from the editor to publish it on the Projects
              page.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminProjectsPage;
