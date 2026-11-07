// Runs synchronously in the head, before styles and document rendering.
// Recovery credentials live only in this closure; never write them to storage or logs.
(() => {
  let accessToken = null;
  let params = new URLSearchParams(location.hash.slice(1));
  if (params.get("type") === "recovery") {
    const candidate = params.get("access_token");
    if (candidate && candidate.length >= 10 && candidate.length <= 10000) accessToken = candidate;
  }
  params = null;
  try { history.replaceState(null, "", location.pathname); }
  catch { accessToken = null; location.replace(location.pathname); return; }
  const missing = "הקישור אינו תקין או שתוקפו הסתיים. בקשו קישור חדש ופתחו אותו מתוך הודעת הדוא״ל.";
  let form, result;
  const clear = () => { accessToken = null; if (form) { form.reset(); form.hidden = true; } };
  addEventListener("pagehide", clear);
  addEventListener("pageshow", event => {
    if (event.persisted && result) { clear(); result.textContent = missing; result.hidden = false; result.className = "notice error"; result.setAttribute("role", "alert"); }
  });
  addEventListener("DOMContentLoaded", async () => {
    form = document.querySelector("#reset-form");
    result = document.querySelector("#result");
    const { request, showResult } = await import("./api.js");
    if (!accessToken) { showResult(result, missing, true); return; }
    form.hidden = false;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!accessToken) { clear(); showResult(result, missing, true); return; }
      if (!form.reportValidity()) return;
      if (form.elements.password.value !== form.elements.confirmation.value) { showResult(result, "הסיסמאות אינן תואמות.", true); return; }
      const button = form.querySelector("button");
      button.disabled = true;
      result.hidden = true;
      try {
        const response = await request("/auth/reset-password", { accessToken, newPassword: form.elements.password.value });
        if (response.updated !== true) throw new Error("השירות לא אישר עדכון סיסמה. נסו שוב או פנו לתמיכה.");
        clear();
        showResult(result, "הסיסמה עודכנה. חזרו לאפליקציה והתחברו מחדש באמצעות הסיסמה החדשה.");
      } catch (error) {
        if (error.status === 401 || error.code === "SIGNOUT_PENDING") clear();
        showResult(result, error.message, true);
      } finally { button.disabled = false; }
    });
  });
})();
