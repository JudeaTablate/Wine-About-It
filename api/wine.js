export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query = "", image = null } = req.body || {};
    if (!query.trim() && !image) {
      return res.status(400).json({ error: "Provide a wine name or label image." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Wine AI is not configured yet. Add GEMINI_API_KEY to Vercel Environment Variables." });
    }

    const prompt = `You are Wine About It, a warm, highly knowledgeable wine educator with sommelier-level knowledge. Explain wine clearly, never condescendingly.

User's wine text: ${query || "(none; identify the bottle from the label image)"}

The goal is to give the user information that goes BEYOND the static Wine About It website. Do not simply repeat generic tasting notes, body, or food pairings. Give a useful mini research brief about the specific wine, producer, region, vintage, or style when those details can be supported.

Return these section labels exactly, each on its own line:
WHAT IT IS
WHY THIS WINE IS INTERESTING
GRAPE(S) & STYLE
WHERE IT COMES FROM
HOW IT IS MADE
VINTAGE / AGING
WHAT YOU'LL NOTICE
SERVING & DECANTING
FOOD PAIRINGS
WHAT THE LABEL DOESN'T TELL YOU
IF YOU LIKE THIS, TRY
BEGINNER TAKE

For the useful detail, include things such as:
- producer or estate background when identifiable
- appellation/region and what makes that place distinctive
- grape varieties and the role each grape plays
- fermentation, oak, skin contact, lees, bottle aging, or other relevant winemaking choices
- vintage conditions or drinking-window guidance when a vintage is known
- realistic serving temperature and whether decanting is worthwhile
- 2–4 specific pairing ideas with a short explanation of why they work
- a few less-obvious facts or context that a beginner would not normally find on a simple wine glossary
- similar wines or grapes the user could explore next

Do not invent facts. If a producer, vintage, grape, appellation, alcohol level, price, or production method cannot be established from the user's text or visible label, say "Not confirmed from the information provided" instead of guessing. Distinguish general style knowledge from bottle-specific facts. If the label image is unclear, state what you can and cannot confidently read.

Keep the answer detailed but readable, around 500–700 words. Use short paragraphs or bullet points under each section. Avoid repeating information between sections.`;

    const parts = [{ text: prompt }];

    if (image && typeof image === "string" && image.startsWith("data:image/")) {
      const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inline_data: {
            mime_type: match[1],
            data: match[2]
          }
        });
      }
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts
          }],
          generationConfig: {
            maxOutputTokens: 1400
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini could not analyze the wine."
      });
    }

    const result = data?.candidates?.[0]?.content?.parts
      ?.filter(part => typeof part.text === "string")
      ?.map(part => part.text)
      ?.join("\n")
      ?.trim();

    return res.status(200).json({
      result: result || "I couldn't get a readable wine breakdown this time."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong while reading the wine." });
  }
}
