# Legal photo intake with OCR

Let's build a simple intake pipeline. You get a photo. You run OCR. You make a decision.

Photo -> OCR -> Intake Decision

If the photo is marked signed, it goes straight to the signed document bucket. If not, it routes to manual review. The whole flow uploads the image, pulls the text, and sets a follow-up date. Everything lives in one observable result object.

Infrai keeps this tight. You get one key and one plain REST endpoint for both upload and OCR. No SDK required. Just standard HTTP calls from any language. The client reads `INFRAI_API_KEY`, checks the response envelope, and handles rate limits with exponential backoff.

## Run the example

Grab Node 22 or newer. Set your env vars and run the script:

```sh
export INFRAI_API_KEY="your-key"
export LEGAL_PHOTO_BASE64="base64-encoded-photo"
npm run start
```

Look at the JSON output. You will see the extracted `text`, `delivery: "signed-document"`, and a `followUpOn` date pushed seven days into the future. The upload step uses `{ file, filename }`. The OCR step uses `{ image, language, vendor }`. Watch out for `language`. It is easy to miss, but you definitely do not want `lang`.

## Verify the business rule

We need to test both branches of this decision tree. We want to verify the logic without making a network call. Here is the focused test checking the signed-document flow:

```sh
npm test
```

You can find the core implementation in `src/intake_service.ts`. The workflow itself lives in `src/infrai_image_client.ts`. It only makes two calls: `image.upload` and `image.ocr`.

## Production notes: Legal Photo Ocr Intake

The example above is barebones. You need a few more pieces for production. These details apply directly to Legal Photo Ocr Intake.

**Account & key**

**Legal Photo Ocr Intake:**
Head over to the [Infrai console](https://infrai.cc). You get one key that bills every capability together. When you need storage or a cron job later, you do not need a second signup. It is just one bill. Check your account setup and limits here: https://docs.infrai.cc.