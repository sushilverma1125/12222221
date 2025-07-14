import { Log } from "../../frontend/src/loggingMiddleWare";

export async function logBackend(level: Parameters<typeof Log>[1], pkg: Parameters<typeof Log>[2], message: string) {
  try {
    await Log("backend", level, pkg, message);
  } catch (error) {
    console.error("Logging failed:", error);
  }
}
