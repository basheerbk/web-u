import { getDatabase } from "@/lib/db";

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

  try {
    const sql = getDatabase();
    await sql`
      INSERT INTO coffee_notes (name, message)
      VALUES (${name}, ${message})
    `;
  } catch (error) {
    console.error("Coffee note storage failed", error);
    return Response.json(
      {
        message:
          "The letterbox is having a moment. Your note is still here — please try again soon.",
      },
      { status: 503 }
    );
  }

  return Response.json({
    message: "Your note is tucked safely into Nayana's little coffee counter.",
  });
}
