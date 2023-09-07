import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, _: VercelResponse) {
  throw new Error(JSON.stringify(req));
}
