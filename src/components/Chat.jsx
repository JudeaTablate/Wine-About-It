import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { Markdown } from "../lib/markdown";
import { streamChat, splitFollowUps, ChatError } from "../lib/chat";
import { localAnswer } from "../lib/local";
import { useStored } from "../lib/storage";
import { resizeImage } from "../lib/image";
import { canSpeak, speak, stopSpeaking } from "../lib/speech";

const STARTERS = [
  ["🍷", "Explain tannins like I'm five"],
  ["🍲", "What pairs with sinigang or adobo?"],
  ["💸", "Suggest a budget red for pizza night"],
  ["🏷️", "How do I read a wine label?"],
  ["🧊", "Should I chill red wine?"],
  ["📸", "I'll send a label photo, tell me about it"],
];

const uid = () => Math.random().toString(36).slice(2, 10);
const Recognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

function Bubble({ m, isLast, busy, dev, onRegen, onChip }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  if (m.role === "user") {
    return (
      <div className="msg user">
        <div className="bubble">
          {m.hadImage && <span className="img-pill">📷 label photo</span>}
          {m.content}
        </div>
      </div>
    );
  }

  const { body, chips } = splitFollowUps(m.content);
  const copy = async () => {
    try { await navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* clipboard blocked */ }
  };
  const listen = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    speak(body.replace(/[*_`#]/g, ""));
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), Math.min(60000, body.length * 70));
  };

  return (
    <div className="msg bot">
      <span className="avatar" aria-hidden="true">S</span>
      <div className="msg-main">
        <div className={`bubble ${m.error ? "error" : ""}`}>
          {body ? <Markdown text={body} /> : <span className="typing" aria-label="Sommy is typing"><i /><i /><i /></span>}
          {m.pending && body && <span className="caret" aria-hidden="true" />}
        </div>
        {!m.pending && !m.error && body && (
          <div className="msg-actions">
            <button onClick={copy} aria-label="Copy reply"><Icon name="copy" size={15} /> {copied ? "Copied" : "Copy"}</button>
            {canSpeak() && <button onClick={listen} aria-pressed={speaking}><Icon name="speaker" size={15} /> {speaking ? "Stop" : "Listen"}</button>}
            {isLast && !busy && <button onClick={onRegen}><Icon name="refresh" size={15} /> Retry</button>}
            {dev && m.meta && (
              <span className="telemetry" title="Developer telemetry">
                {m.meta.provider}{m.meta.model ? `/${m.meta.model}` : ""} · TTFB {m.meta.ttfb}ms · {(m.meta.total / 1000).toFixed(1)}s · {m.meta.chars} ch
              </span>
            )}
          </div>
        )}
        {m.error && isLast && !busy && <div className="msg-actions"><button onClick={onRegen}><Icon name="refresh" size={15} /> Try again</button></div>}
        {isLast && !busy && chips.length > 0 && (
          <ul className="chip-row follow" aria-label="Suggested follow-ups">
            {chips.map((c) => <li key={c}><button className="chip" onClick={() => onChip(c)}>{c}</button></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Chat({ open, setOpen, pending, dev }) {
  const [messages, setMessages] = useStored("wai-chat-v2", []);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const listRef = useRef(null);
  const taRef = useRef(null);
  const abortRef = useRef(null);
  const stickRef = useRef(true);
  const recRef = useRef(null);
  const fileRef = useRef(null);

  // Keep latest messages available to async handlers without stale closures.
  const msgsRef = useRef(messages);
  msgsRef.current = messages;

  const patchLast = useCallback((patch) => {
    setMessages((all) => all.map((m, i) => (i === all.length - 1 ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)));
  }, [setMessages]);

  const run = useCallback(async (history) => {
    setBusy(true);
    stickRef.current = true;
    setMessages([...history, { id: uid(), role: "assistant", content: "", pending: true }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const meta = await streamChat(history, { signal: ctrl.signal, onToken: (t) => patchLast((m) => ({ content: m.content + t })) });
      patchLast({ pending: false, meta });
    } catch (err) {
      if (err.name === "AbortError") {
        patchLast((m) => ({ pending: false, content: m.content || "_Stopped._" }));
      } else if (err instanceof ChatError && ["no_key", "no_api", "network", "bad_key", "upstream"].includes(err.code)) {
        const q = [...history].reverse().find((m) => m.role === "user")?.content || "";
        patchLast({ pending: false, content: localAnswer(q) });
      } else {
        patchLast({ pending: false, error: true, content: `Hmm, that didn't work: ${err.message || "unknown error"}\nFOLLOW_UPS: ` });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [patchLast, setMessages]);

  const send = useCallback((text, img = null) => {
    const content = text.trim();
    if ((!content && !img) || abortRef.current) return;
    const hist = msgsRef.current.filter((m) => !(m.error && m.role === "assistant")).slice(-30);
    run([...hist, { id: uid(), role: "user", content: content || "What can you tell me about this label?", image: img, hadImage: !!img }]);
    setInput(""); setImage(null);
    if (taRef.current) taRef.current.style.height = "auto";
  }, [run]);

  const regen = () => {
    const hist = msgsRef.current.slice(0, -1);
    if (hist.length) run(hist);
  };

  // Messages that arrive from hero / directory / palette.
  const lastNonce = useRef(0);
  useEffect(() => {
    if (pending && pending.nonce !== lastNonce.current) {
      lastNonce.current = pending.nonce;
      send(pending.text);
    }
  }, [pending, send]);

  // Persist without heavy image data; clear stuck "pending" flags after reload.
  useEffect(() => {
    if (!busy && messages.some((m) => m.pending)) setMessages((all) => all.map((m) => ({ ...m, pending: false })));
  }, [busy, messages, setMessages]);

  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => { if (open) setTimeout(() => taRef.current?.focus(), 60); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !e.defaultPrevented) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const onScroll = () => {
    const el = listRef.current;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const onPickImage = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    try { setImage(await resizeImage(f)); } catch { /* unreadable image */ }
  };

  const toggleMic = () => {
    if (!Recognition) return;
    if (listening) { recRef.current?.stop(); return; }
    const r = new Recognition();
    r.lang = "en-US"; r.interimResults = true; r.continuous = false;
    r.onresult = (ev) => setInput(Array.from(ev.results).map((x) => x[0].transcript).join(""));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    setListening(true);
    r.start();
  };

  const onInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(140, e.target.scrollHeight) + "px";
  };

  const clear = () => { abortRef.current?.abort(); setMessages([]); setImage(null); stopSpeaking(); };
  const lastIdx = messages.length - 1;

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat with Sommy, the AI wine guide">
          <Icon name="spark" size={22} /> <span>Ask Sommy</span>
        </button>
      )}
      <aside className={`chat ${open ? "open" : ""}`} role="dialog" aria-label="Chat with Sommy, your AI wine guide" aria-hidden={!open} inert={!open}>
        <header className="chat-head">
          <span className="avatar big" aria-hidden="true">S</span>
          <div>
            <h2>Sommy <span className="badge">AI</span>{dev && <span className="badge dev">DEV</span>}</h2>
            <p>{busy ? "Thinking…" : "Free AI wine guide · ask anything"}</p>
          </div>
          <div className="chat-head-actions">
            {messages.length > 0 && <button className="icon-btn" onClick={clear} aria-label="Start a new chat" title="New chat"><Icon name="trash" size={18} /></button>}
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><Icon name="x" /></button>
          </div>
        </header>

        <div className="chat-body" ref={listRef} onScroll={onScroll} role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <span className="avatar xl" aria-hidden="true">S</span>
              <h3>Hi, I'm Sommy 👋</h3>
              <p>Ask me anything about wine: what to buy, what to pour with dinner, what that label means. I remember our conversation, so just keep chatting.</p>
              <ul className="starters">
                {STARTERS.map(([e, t]) => (
                  <li key={t}><button onClick={() => (t.startsWith("I'll send") ? fileRef.current?.click() : send(t))}><span aria-hidden="true">{e}</span>{t}</button></li>
                ))}
              </ul>
            </div>
          ) : (
            messages.map((m, i) => (
              <Bubble key={m.id} m={m} isLast={i === lastIdx} busy={busy} dev={dev} onRegen={regen} onChip={(c) => send(c)} />
            ))
          )}
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input, image); }}>
          {image && (
            <div className="attach">
              <img src={image} alt="Label photo to send" />
              <button type="button" onClick={() => setImage(null)} aria-label="Remove photo"><Icon name="x" size={14} /></button>
            </div>
          )}
          <div className="input-row">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
            <button type="button" className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Attach a label photo"><Icon name="clip" /></button>
            {Recognition && (
              <button type="button" className={`icon-btn ${listening ? "rec" : ""}`} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Stop voice input" : "Speak your question"}><Icon name="mic" /></button>
            )}
            <label htmlFor="chat-text" className="sr-only">Message Sommy</label>
            <textarea
              id="chat-text" ref={taRef} rows={1} value={input} onChange={onInput} placeholder="Message Sommy…"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input, image); } }}
            />
            {busy ? (
              <button type="button" className="send stop" onClick={() => abortRef.current?.abort()} aria-label="Stop generating"><Icon name="stop" size={18} /></button>
            ) : (
              <button type="submit" className="send" disabled={!input.trim() && !image} aria-label="Send message"><Icon name="send" size={18} /></button>
            )}
          </div>
          <p className="fine">AI can make mistakes. Check labels, and please drink responsibly.</p>
        </form>
      </aside>
    </>
  );
}
