import { request, showResult } from "./api.js";
const form = document.querySelector("#recover-form");
const result = document.querySelector("#result");
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector("button");
  button.disabled = true;
  result.hidden = true;
  try {
    const response = await request("/auth/recover", { email: form.elements.email.value.trim() });
    if (response.sent !== true) throw new Error("הבקשה לא אושרה. נסו שוב מאוחר יותר.");
    form.reset();
    form.hidden = true;
    showResult(result, "אם קיים חשבון מתאים לכתובת שהוזנה, יישלח אליו קישור לאיפוס הסיסמה. בדקו גם את תיקיית הספאם. הקישור תקף לזמן מוגבל.");
  } catch (error) { showResult(result, error.message, true); }
  finally { button.disabled = false; }
});
