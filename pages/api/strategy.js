export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const account = req.body;

  const SYSTEM = `You are an AI assistant for a Lucky Strike Entertainment Customer Success Manager. Lucky Strike operates upscale bowling, dining, and entertainment centers popular for corporate events and team-building across the US.

Return ONLY a valid JSON object (no markdown, no explanation, no backticks) with exactly these fields:
{
  "email_subject": "string",
  "email_body": "string (3 short paragraphs separated by \\n\\n, professional and warm, reference their specific team size and preferred package)",
  "talking_points": ["string", "string", "string"],
  "rebooking_probability": integer 0-100,
  "recommended_offer": "string (one specific incentive for this account)"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Generate a re-engagement strategy for this enterprise account:\n${JSON.stringify(account, null, 2)}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.content) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(500).json({
        error: data?.error?.message || `Anthropic API error: ${JSON.stringify(data)}`,
      });
    }

    const raw = data.content[0].text.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
const strategy = JSON.parse(raw);
    res.status(200).json(strategy);
  } catch (err) {
    console.error("Handler error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
