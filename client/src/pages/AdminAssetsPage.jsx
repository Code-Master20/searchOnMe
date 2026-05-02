import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { buildApiUrl, readJsonResponse, requestJson } from "../utils/api";
import styles from "./AdminAssetsPage.module.css";

const categoryOptions = [
  { value: "resume", label: "Resume", accept: ".pdf,.doc,.docx" },
  { value: "education", label: "Educational document", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png" },
  { value: "image", label: "Image / photo", accept: "image/*" }
];

const getAccept = (category) =>
  categoryOptions.find((option) => option.value === category)?.accept || "*/*";

function AdminAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [category, setCategory] = useState("resume");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef(null);

  const loadAssets = async () => {
    const data = await requestJson("/api/admin/assets", {
      credentials: "include"
    });

    setAssets(data.data || []);
  };

  useEffect(() => {
    loadAssets().catch((error) => setStatus(error.message));
  }, []);

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

  const uploadToCloudinary = async (signatureData) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("folder", signatureData.folder);
    formData.append("signature", signatureData.signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`,
      {
        method: "POST",
        body: formData
      }
    );
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed.");
    }

    return data;
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus("Please choose a file first.");
      return;
    }

    setIsUploading(true);
    setStatus("Creating admin-only Cloudinary upload signature...");

    try {
      const signaturePayload = await requestJson("/api/admin/assets/signature", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ category })
      });

      setStatus("Uploading file to Cloudinary...");
      const cloudinaryAsset = await uploadToCloudinary(signaturePayload.data);

      setStatus("Saving asset metadata...");
      await requestJson("/api/admin/assets", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title || file.name,
          category,
          originalName: file.name,
          secureUrl: cloudinaryAsset.secure_url,
          publicId: cloudinaryAsset.public_id,
          resourceType: cloudinaryAsset.resource_type,
          format: cloudinaryAsset.format || "",
          bytes: cloudinaryAsset.bytes || file.size
        })
      });

      setTitle("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setStatus("Asset uploaded successfully.");
      await loadAssets();
    } catch (error) {
      setStatus(error.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (assetId) => {
    try {
      await requestJson(`/api/admin/assets/${assetId}`, {
        method: "DELETE",
        credentials: "include"
      });

      setStatus("Asset removed successfully.");
      setAssets((current) => current.filter((asset) => asset._id !== assetId));
    } catch (error) {
      setStatus(error.message || "Unable to delete asset.");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.actionRow}>
        <Link className={styles.secondaryLink} to="/admin/about">
          Open about editor
        </Link>
        <Link className={styles.secondaryLink} to="/admin/projects">
          Open project manager
        </Link>
        <Link className={styles.secondaryLink} to="/admin/messages">
          Open admin inbox
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
        <p className={styles.kicker}>Admin uploads</p>
        <h1>Cloudinary asset manager for searchOnMe.</h1>
        <p>
          This page is protected by admin login. Only admin accounts can create signed Cloudinary
          uploads for resume files, educational documents, and photos.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleUpload}>
        <label>
          <span>Asset type</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categoryOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Title</span>
          <input
            type="text"
            placeholder="Example: Sahidur Miah Resume"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          <span>File</span>
          <input
            ref={fileInputRef}
            key={category}
            type="file"
            accept={getAccept(category)}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload to Cloudinary"}
        </button>
      </form>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      {status.toLowerCase().includes("authorized") || status.toLowerCase().includes("login") ? (
        <Link className={styles.loginLink} to="/admin/login">
          Go to admin login
        </Link>
      ) : null}

      <div className={styles.assetsGrid}>
        {assets.length > 0 ? (
          assets.map((asset) => (
            <article className={styles.assetCard} key={asset._id}>
              {asset.resourceType === "image" ? (
                <img src={asset.secureUrl} alt={asset.title} />
              ) : (
                <div className={styles.fileBadge}>{asset.format || asset.resourceType}</div>
              )}
              <div>
                <p className={styles.assetCategory}>{asset.category}</p>
                <h3>{asset.title}</h3>
                <a href={asset.secureUrl} target="_blank" rel="noreferrer">
                  Open asset
                </a>
                <button type="button" onClick={() => handleDelete(asset._id)}>
                  Remove
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            No portfolio assets uploaded yet. Use the form above to publish resume files,
            education documents, or images.
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminAssetsPage;
