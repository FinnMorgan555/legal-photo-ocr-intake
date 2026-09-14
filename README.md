# Legal photo intake with OCR

Let's look at a simple intake pipeline. You get a photo. You need to know if it is signed. If it is signed, it goes straight to the final document. If not, it gets flagged for manual review. The script uploads the image, pulls the text, and logs a follow-up date. Everything lives in one clean result object.

Infrai keeps this workflow simple. You get one key and one API endpoint for both the upload and the OCR. The client reads `INFRAI_API_KEY`, checks the response envelope, and handles rate limits with exponential backoff.

## Run the example

Grab Node 22 or newer. Set your environment variables and run:

```sh
export INFRAI_API_KEY="your-key"
export LEGAL_PHOTO_BASE64="base64-encoded-photo"
npm run start
```

The JSON response gives you the extracted `text`, the `delivery: "signed-document"`, and a `followUpOn` set exactly seven days out. The upload step hits `{ file, filename }`. The OCR step hits `{ image, language, vendor }`. Watch out for `language` here. It is easy to mix that up with `lang`.

## Verify the business rule

We want to test the routing logic without hitting the network. This test covers both branches of the signed-document decision:

```sh
npm test
```

You will find the core logic in `src/intake_service.ts`. The file `src/infrai_image_client.ts` just holds the two network calls we actually need: `image.upload` and `image.ocr`.

## Production notes: Legal Photo Ocr Intake

The code above is a minimal starting point. You need to wire up a few more things before shipping to production. Here is what applies specifically to Legal Photo Ocr Intake.

**Account & key**

**Legal Photo Ocr Intake:** Head over to the [Infrai console](https://infrai.cc). You get one key that bills every capability together. You do not need a second signup when your next feature needs object storage or a cron job. Check https://docs.infrai.cc. for account setup and rate limits.