import { randomUUID } from "crypto";
import OpenAI from "openai";

// import { writeFile } from "fs/promises";
// @ts-ignore
// import whisper from "whisper-node";

const openAI = new OpenAI();

export async function POST(request: Request) {
  const form = await request.formData();

  const audio = form.get("audio") as Blob;

  const id = randomUUID();

  const fileName = `${id}.wav`;

  try {
    const file = new File([audio], fileName, { type: audio.type });

    const transcript = await openAI.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    return Response.json({ transcript });
  } catch (error) {
    return new Response(`error: ${error}`, {
      status: 400,
    });
  }
}
