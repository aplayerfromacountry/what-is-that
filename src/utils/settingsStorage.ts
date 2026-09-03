const SHOOTING_STARS_KEY = "app_shooting_stars_enabled";

export function getShootingStarsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SHOOTING_STARS_KEY);
  if (stored === null) return true; // default ON
  return stored === "true";
}

export function setShootingStarsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHOOTING_STARS_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("app_settings_changed", { detail: { shootingStars: enabled } }));
}
