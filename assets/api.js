import { apiBaseUrl } from "./config.js";
export async function request(path, data) {
  const base = new URL(apiBaseUrl);
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) throw new Error("שירות שחזור הסיסמה טרם הוגדר. אפשר לפנות לתמיכה.");
  let response;
  try {
    response = await fetch(apiBaseUrl.replace(/\/$/, "") + path, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
      body: JSON.stringify(data), signal: AbortSignal.timeout(20_000),
    });
  } catch { throw new Error("לא ניתן להתחבר לשירות כרגע. נסו שוב מאוחר יותר או פנו לתמיכה."); }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const code = result?.error?.code;
    const message = code === "SIGNOUT_PENDING"
      ? "הסיסמה עודכנה, אך נדרש לפנות לתמיכה להשלמת ניתוק החיבורים הקודמים. אין לשלוח לתמיכה את קישור האיפוס."
      : response.status === 401 ? "קישור האיפוס אינו תקף. יש לבקש קישור חדש."
      : response.status === 429 ? "בוצעו בקשות רבות בזמן קצר. המתינו ונסו שוב."
      : response.status === 503 ? "שירות שחזור הסיסמה אינו זמין כרגע. נסו מאוחר יותר או פנו לתמיכה."
      : "הפעולה לא הושלמה. בדקו את הפרטים ונסו שוב.";
    throw Object.assign(new Error(message), { status: response.status, code });
  }
  if (!result || typeof result !== "object") throw new Error("התקבלה תשובה לא תקינה מהשירות. הפעולה לא אושרה.");
  return result;
}
export function showResult(element, message, error = false) {
  element.textContent = message;
  element.hidden = false;
  element.className = "notice" + (error ? " error" : "");
  element.setAttribute("role", error ? "alert" : "status");
}
