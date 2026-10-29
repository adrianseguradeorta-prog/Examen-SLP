export const DIAGNOSTIC_IDENTITY_KEY = "slp:diagnostic:identity-change";
export const DIAGNOSTIC_IDENTITY_EVENT = "slp-diagnostic-identity-change";
export function invalidateDiagnosticIdentity() {
  try {
    localStorage.setItem(DIAGNOSTIC_IDENTITY_KEY, crypto.randomUUID());
  } catch {
    // Storage denial must not prevent logout. Also notify live tabs without storage.
  } finally {
    window.dispatchEvent(new Event(DIAGNOSTIC_IDENTITY_EVENT));
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(DIAGNOSTIC_IDENTITY_EVENT);
        channel.postMessage("lock");
        channel.close();
      }
    } catch {
      /* The current-page event still locks the diagnostic. */
    }
  }
}
