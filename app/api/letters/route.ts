const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 1200;

type LetterPayload = {
  name?: unknown;
  message?: unknown;
  website?: unknown;
  startedAt?: unknown;
};

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export async function POST(request: Request) {
  let payload: LetterPayload;

  try {
    payload = (await request.json()) as LetterPayload;
  } catch {
    return Response.json(
      { message: "That note did not arrive in a readable shape." },
      { status: 400 }
    );
  }

  // Quietly accept bot submissions caught by the hidden field.
  if (cleanText(payload.website, 200)) {
    return Response.json({ message: "Your note is on its way." });
  }

  const name = cleanText(payload.name, MAX_NAME_LENGTH) || "Anonymous";
  const message = cleanText(payload.message, MAX_MESSAGE_LENGTH);
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;

  if (!message) {
    return Response.json({ message: "Write a little something first." }, { status: 400 });
  }

  if (message.length < 3) {
    return Response.json({ message: "Give the note just a few more words." }, { status: 400 });
  }

  if (startedAt && Date.now() - startedAt < 800) {
    return Response.json({ message: "Take a breath, then try sending that again." }, { status: 429 });
  }

  const webhookUrl = process.env.LETTER_INBOX_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json(
      {
        message:
          "The café letterbox has not been connected yet. Your words are still here — please copy them and try again soon.",
      },
      { status: 503 }
    );
  }

  const submittedAt = new Date().toISOString();
  const readableText = `New coffee note for Nayana\n\nFrom: ${name}\n\n${message}`;

  try {
    const inbox = new URL(webhookUrl);
    const webhookBody = inbox.hostname.includes("discord")
      ? { content: readableText }
      : inbox.hostname.includes("slack")
        ? { text: readableText }
        : {
            content: readableText,
            text: readableText,
            name,
            message,
            submittedAt,
            source: "nayana-coffee-notes",
          };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Inbox returned ${response.status}`);
    }
  } catch (error) {
    console.error("Coffee note delivery failed", error);
    return Response.json(
      {
        message:
          "The letterbox is having a moment. Your note is still here — please try once more.",
      },
      { status: 502 }
    );
  }

  return Response.json({
    message: "Your note is on its way to Nayana's little coffee counter.",
  });
}
