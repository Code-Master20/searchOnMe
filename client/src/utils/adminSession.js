export const adminSessionChangedEvent = "searchonme-admin-session-changed";
const adminSessionStorageKey = "searchonme-admin-session";

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

export const notifyAdminSessionChanged = (isAdmin) => {
  if (typeof window === "undefined") {
    return;
  }

  persistAdminSessionFlag(isAdmin);

  window.dispatchEvent(
    new CustomEvent(adminSessionChangedEvent, {
      detail: {
        isAdmin: Boolean(isAdmin)
      }
    })
  );
};
