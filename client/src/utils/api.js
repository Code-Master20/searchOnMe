import { readAdminAuthToken } from "./adminSession";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const buildApiUrl = (path) => `${apiBaseUrl}${path}`;

export const readJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Backend returned a non-JSON response (${response.status}). Check that your API server is running and VITE_API_BASE_URL points to it.`
    );
  }
};

export const requestJson = async (path, options = {}) => {
  const token = readAdminAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    const details = Array.isArray(data.errors) ? data.errors.map((item) => item.msg).join(" ") : "";
    throw new Error(details || data.message || `Request failed with status ${response.status}.`);
  }

  return data;
};
