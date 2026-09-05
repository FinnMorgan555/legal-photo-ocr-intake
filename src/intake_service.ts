import { InfraiImageClient } from "./infrai_image_client.ts";
import { z } from "zod";

export type MatterIntake = { filename: string; photoBase64: string; language: string; signed: boolean; followUpDays: number };
export type IntakeResult = { text: string; delivery: "signed-document" | "review-needed"; followUpOn: string };

export const matterIntakeBody = z.object({
  filename: z.string().min(1), photoBase64: z.string().min(1), language: z.string().min(2),
  signed: z.boolean(), followUpDays: z.number().int().nonnegative()
});

export function decideDelivery(signed: boolean): IntakeResult["delivery"] {
  return signed ? "signed-document" : "review-needed";
}

export async function processMatter(input: MatterIntake, client = new InfraiImageClient()): Promise<IntakeResult> {
  matterIntakeBody.parse(input);
  const uploaded = await client.upload(input.photoBase64, input.filename);
  const extracted = await client.ocr(uploaded.image, input.language);
  const followUp = new Date(Date.now() + input.followUpDays * 86_400_000).toISOString().slice(0, 10);
  return { text: extracted.text, delivery: decideDelivery(input.signed), followUpOn: followUp };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input: MatterIntake = { filename: "signed-consent.jpg", photoBase64: process.env.LEGAL_PHOTO_BASE64 ?? "", language: "eng", signed: true, followUpDays: 7 };
  processMatter(input).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
}
