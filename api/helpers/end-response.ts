import { VercelResponse } from "@vercel/node";
import { ResBody } from "alice-types";

export default function end(res: VercelResponse, answer: ResBody) {
  return res.end(JSON.stringify(answer));
}
