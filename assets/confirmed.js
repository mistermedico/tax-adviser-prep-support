// Synchronous head script: clear callback material before styles or page rendering.
// No authentication credentials are read, stored, exchanged or sent anywhere.
(() => {
  function cleanCallback() {
    let outcome = "continue";
    for (const raw of [location.search.slice(1), location.hash.slice(1)]) {
      const parameters = new URLSearchParams(raw);
      if (parameters.get("error_code") === "otp_expired") outcome = "expired";
      else if (
        outcome !== "expired" &&
        (parameters.has("error") || parameters.has("error_code") || parameters.has("error_description"))
      ) outcome = "error";
    }
    try { history.replaceState(null, "", location.pathname); }
    catch { location.replace(location.pathname); return "continue"; }
    return outcome;
  }
  let outcome = cleanCallback();
  // Do not reflect provider text, codes or URLs, or infer verification from a fragment.
  const messages = {
    continue: "חזרו לאפליקציה והתחברו באמצעות כתובת הדוא״ל והסיסמה שבחרתם.",
    expired: "לא ניתן להמשיך דרך קישור זה. ייתכן שתוקפו הסתיים או שכבר נעשה בו שימוש. חזרו לאפליקציה, ואם לא ניתן להתחבר פנו לתמיכה.",
    error: "לא ניתן היה להשלים את הפעולה דרך הקישור. חזרו לאפליקציה ונסו להתחבר. אם הבעיה נמשכת, פנו לתמיכה.",
  };
  function showOutcome() {
    if (!Object.hasOwn(messages, outcome)) return;
    const result = document.querySelector("#confirmation-result");
    if (!result) return;
    result.textContent = messages[outcome];
    result.className = outcome === "continue" ? "notice" : "notice error";
    result.setAttribute("role", outcome === "continue" ? "status" : "alert");
  }
  addEventListener("DOMContentLoaded", showOutcome);
  // A second email link can reuse this tab and cause a same-document navigation.
  addEventListener("hashchange", () => {
    outcome = cleanCallback();
    showOutcome();
  });
  addEventListener("pageshow", event => {
    if (event.persisted && (location.hash || location.search)) {
      outcome = cleanCallback();
      showOutcome();
    }
  });
})();
