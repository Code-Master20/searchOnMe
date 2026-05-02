export const adminSessionChangedEvent = "searchonme-admin-session-changed";

export const notifyAdminSessionChanged = (isAdmin) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(adminSessionChangedEvent, {
      detail: {
        isAdmin: Boolean(isAdmin)
      }
    })
  );
};
