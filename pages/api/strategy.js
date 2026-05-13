export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const account = req.body;

  const SYSTEM = `You are an AI revenue intelligence assistant for Lucky Strike Entertainment, an upscale bowling, dining, and entertainment brand popular for corporate events and team-building.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with exactly these fields:

{
  "rebooking_probability": integer 0-100,
  "recommended_offer": "string (one specific incentive)",
  "revenue_recovery_90d": integer (estimated dollars recoverable in 90 days based on annual_value and days_since),
  "projected_bookings": integer (estimated event bookings in next 90 days if re-engaged),
  "returning_guests": integer (estimated headcount returning),
  "email_subject": "string",
  "email_body": "string (3 short paragraphs separated by \\n\\n, warm and professional, reference team size and preferred package)",
  "signals": [
    { "label": "string", "value": "string", "impact": "positive or negative or neutral" }
  ],
  "risk_summary": "string (1 sentence)",
  "opportunity_summary": "string (1 sentence)",
  "timeline": [
    { "week": 1, "action": "string (short, 6 words max)", "channel": "string (Email or SMS or Phone or Event)", "goal": "string (one sentence)" },
    { "week": 2, "action": "string", "channel": "string", "goal": "string" },
    { "week": 3, "action": "string", "channel": "string", "goal": "string" },
    { "week": 4, "action": "string", "channel": "string", "goal": "string" }
  ],
  "ai_insights": [
    { "insight": "string (a specific data-driven observation about this account type, 1-2 sentences)" },
    { "insight": "string" }
  ]
}

For revenue_recovery_90d: calculate as approximately (annual_value / 365) * 90 * (rebooking_probability / 100), rounded to nearest thousand.
For signals: return 4-5 key data points from the account profile that most influenced the strategy.
For ai_insights: make them specific, quantified, and actionable. Reference real Lucky Strike dynamics like F&B spend, arcade engagement, or event frequency patterns.`;

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
        max_tokens: 1600,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Generate a full re-engagement strategy for this enterprise account:\n${JSON.stringify(account, null, 2)}`,
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

    const raw = data.content[0].text.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    const strategy = JSON.parse(raw);
    res.status(200).json(strategy);
  } catch (err) {
    console.error("Handler error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
