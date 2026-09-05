import assert from "node:assert/strict";
import { decideDelivery } from "./intake_service.ts";

assert.equal(decideDelivery(true), "signed-document");
assert.equal(decideDelivery(false), "review-needed");
console.log("delivery decision test passed");
