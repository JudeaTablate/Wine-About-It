function chooseVoice(voices, locale) {
  const prefix = locale.split("-")[0];
  const matching = voices.filter((v) => v.lang?.toLowerCase().startsWith(prefix));
  return (
    matching.find((v) => /natural|online|enhanced|premium|google/i.test(v.name)) ||
    matching[0] ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
    voices[0] ||
    null
  );
}

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text, locale = "en-US", rate = 0.95) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.voice = chooseVoice(synth.getVoices(), locale);
  u.rate = rate;
  synth.speak(u);
}

export const stopSpeaking = () => canSpeak() && window.speechSynthesis.cancel();
