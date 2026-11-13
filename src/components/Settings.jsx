import { Dialog, Segmented } from "./ui";

export default function Settings({ open, onClose, settings: s, set, reset }) {
  return (
    <Dialog open={open} onClose={onClose} title="Reading and display">
      <p className="dlg-lede">Adjust the site to suit your eyes. Changes apply right away and are remembered on this device.</p>
      <div className="settings">
        <div className="setting">
          <label htmlFor="scale">Text size <output htmlFor="scale">{s.scale}%</output></label>
          <input id="scale" type="range" min="90" max="160" step="10" value={s.scale} onChange={(e) => set("scale", +e.target.value)} />
          <p className="preview" aria-hidden="true">Pinot Noir is light, silky and smells of cherries.</p>
        </div>
        <Segmented legend="Theme" name="theme" value={s.theme} onChange={(v) => set("theme", v)} options={[["system", "Match device"], ["light", "Light"], ["dark", "Dark"]]} />
        <Segmented legend="Contrast" name="contrast" value={s.contrast} onChange={(v) => set("contrast", v)} options={[["standard", "Standard"], ["high", "High"]]} />
        <Segmented legend="Typeface" name="font" value={s.font} onChange={(v) => set("font", v)} options={[["default", "Default"], ["hyperlegible", "Hyperlegible"], ["system", "Device default"]]} />
        <Segmented legend="Line spacing" name="spacing" value={s.spacing} onChange={(v) => set("spacing", v)} options={[["normal", "Normal"], ["relaxed", "Relaxed"]]} />
        <Segmented legend="Animation" name="motion" value={s.motion} onChange={(v) => set("motion", v)} options={[["system", "Match device"], ["reduce", "Reduce"], ["full", "Allow"]]} />
        <Segmented legend="Links" name="links" value={s.links} onChange={(v) => set("links", v)} options={[["auto", "Standard"], ["underline", "Always underline"]]} />
      </div>
      <p className="fine">Hyperlegible switches body text to Atkinson Hyperlegible, a typeface designed by the Braille Institute so letters like I, l and 1 are easy to tell apart.</p>
      <div className="dlg-actions">
        <button type="button" className="btn btn-ghost" onClick={reset}>Reset to defaults</button>
        <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </Dialog>
  );
}
