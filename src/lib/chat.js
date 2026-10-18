export class ChatError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

/** Split the model's trailing "FOLLOW_UPS: a | b | c" line into suggestion chips. */
export function splitFollowUps(text) {
  const i = text.lastIndexOf("FOLLOW_UPS:");
  if (i === -1) return { body: text.replace(/\n?FOLLOW_?U?P?S?:?$/, "").trimEnd(), chips: [] };
  const chips = text
    .slice(i + 11)
    .split("|")
    .map((s) => s.trim().replace(/^["“]|["”]$/g, ""))
    .filter(Boolean)
    .slice(0, 3);
  return { body: text.slice(0, i).trimEnd(), chips };
}

/**
 * Streams a reply from /api/chat. Calls onToken(text) for each chunk.
 * Resolves with telemetry (provider, model, time-to-first-byte, total ms).
 */
export async function streamChat(messages, { signal, onToken }) {
  const last = messages.length - 1;
  const payload = messages.slice(-16).map((m, i, arr) => ({
    role: m.role,
    content: (m.content || "").slice(0, 4000),
    ...(m.image && i === arr.length - 1 && last >= 0 ? { image: m.image } : {}),
  }));

  const t0 = performance.now();
  let res;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ChatError("Network error", "network");
  }

  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("text/html")) {
    let data = {};
    try { data = await res.json(); } catch { /* not JSON */ }
    throw new ChatError(data.error || `Request failed (${res.status})`, data.code || (res.status === 404 || type.includes("html") ? "no_api" : "http"));
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let first = null;
  let chars = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = dec.decode(value, { stream: true });
    if (first === null) first = performance.now() - t0;
    chars += text.length;
    onToken(text);
  }
  return {
    provider: res.headers.get("x-provider") || "unknown",
    model: res.headers.get("x-model") || "",
    ttfb: Math.round(first ?? 0),
    total: Math.round(performance.now() - t0),
    chars,
  };
}
