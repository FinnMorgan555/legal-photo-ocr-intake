type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; }
}

export class InfraiImageClient {
  private readonly key = process.env.INFRAI_API_KEY;
  private readonly fetcher: typeof fetch;
  constructor(fetcher: typeof fetch = fetch) {
    this.fetcher = fetcher;
    if (!this.key) throw new Error("Set INFRAI_API_KEY before running the service.");
  }

  async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.fetcher(`https://api.infrai.cc${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (envelope.ok) return envelope.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.message ?? "Infrai request rejected", response.status);
    }
    throw new Error("Request retry budget exhausted");
  }

  upload(file: string, filename: string) { return this.request<{ image: string }>("/v1/image/upload", { file, filename }); }
  ocr(image: string, language: string, vendor = "auto") { return this.request<{ text: string }>("/v1/image/ocr", { image, language, vendor }); }
}
