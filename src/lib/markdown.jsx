import { Fragment } from "react";

// Tiny, safe Markdown renderer (bold, italic, code, links, lists). No innerHTML.
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;

function inline(text, keyBase) {
  return text.split(INLINE).map((part, i) => {
    const k = `${keyBase}-${i}`;
    if (/^\*\*.+\*\*$/.test(part) || /^__.+__$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^\*.+\*$/.test(part) || /^_.+_$/.test(part)) return <em key={k}>{part.slice(1, -1)}</em>;
    if (/^`.+`$/.test(part)) return <code key={k}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) return <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    return <Fragment key={k}>{part}</Fragment>;
  });
}

export function Markdown({ text }) {
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push(list); list = null; } };

  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (bullet || ordered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) { flush(); list = { type, items: [], key: i }; }
      list.items.push((bullet || ordered)[1]);
    } else if (!line.trim()) {
      flush();
    } else {
      flush();
      const h = line.match(/^#{1,4}\s+(.*)/);
      blocks.push({ type: h ? "h" : "p", text: h ? h[1] : line, key: i });
    }
  });
  flush();

  return blocks.map((b) => {
    if (b.type === "ul" || b.type === "ol") {
      const Tag = b.type;
      return <Tag key={b.key}>{b.items.map((it, j) => <li key={j}>{inline(it, `${b.key}-${j}`)}</li>)}</Tag>;
    }
    if (b.type === "h") return <p key={b.key}><strong>{inline(b.text, b.key)}</strong></p>;
    return <p key={b.key}>{inline(b.text, b.key)}</p>;
  });
}
