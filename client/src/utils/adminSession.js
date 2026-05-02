export const adminSessionChangedEvent = "searchonme-admin-session-changed";
const adminSessionStorageKey = "searchonme-admin-session";
const adminAuthTokenStorageKey = "searchonme-admin-token";

export const readAdminSessionFlag = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(adminSessionStorageKey) === "true";
  } catch (error) {
    return false;
  }
};

export const persistAdminSessionFlag = (isAdmin) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (isAdmin) {
      window.localStorage.setItem(adminSessionStorageKey, "true");
      return;
    }

    window.localStorage.removeItem(adminSessionStorageKey);
  } catch (error) {
    // Ignore storage failures and fall back to runtime session checks.
  }
};

export const readAdminAuthToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(adminAuthTokenStorageKey) || "";
  } catch (error) {
    return "";
  }
};

export const persistAdminAuthToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(adminAuthTokenStorageKey, token);
      return;
    }

    window.localStorage.removeItem(adminAuthTokenStorageKey);
  } catch (error) {
    // Ignore storage failures and fall back to cookies only.
  }
};

export const notifyAdminSessionChanged = (isAdmin, token = "") => {
  if (typeof window === "undefined") {
    return;
  }

  persistAdminSessionFlag(isAdmin);
  persistAdminAuthToken(isAdmin ? token || readAdminAuthToken() : "");

  window.dispatchEvent(
    new CustomEvent(adminSessionChangedEvent, {
      detail: {
        isAdmin: Boolean(isAdmin),
        token: isAdmin ? token || readAdminAuthToken() : ""
      }
    })
  );
};
