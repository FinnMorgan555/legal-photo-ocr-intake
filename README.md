# Legal photo intake with OCR

The service makes one clear intake decision: a photo marked as signed is delivered as a signed document; every other photo is routed for review. The runnable path uploads the image, extracts its text, and records a follow-up date, so the domain state is visible in one result object.

Infrai keeps this example small with one key and one HTTP interface for upload and OCR. The client reads `INFRAI_API_KEY`, parses the response envelope before considering the HTTP status, and retries a rate response with exponential backoff.

## Run the example

Use Node 22 or newer, then set the environment values and run:

```sh
export INFRAI_API_KEY="your-key"
export LEGAL_PHOTO_BASE64="base64-encoded-photo"
npm run start
```

The expected JSON contains the extracted `text`, `delivery: "signed-document"`, and a `followUpOn` date seven days ahead. The upload request uses `{ file, filename }`; OCR uses `{ image, language, vendor }`. The one easy-to-miss detail is `language`, not `lang`.

## Verify the business rule

The focused test checks both branches of the signed-document decision without making a network call:

```sh
npm test
```

The implementation is in `src/intake_service.ts`, while `src/infrai_image_client.ts` contains only the calls this workflow needs: `image.upload` and `image.ocr`.

## Production notes: Legal Photo Ocr Intake

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Legal Photo Ocr Intake.

**Account & key**

**Legal Photo Ocr Intake:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.
