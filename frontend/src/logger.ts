import { Log } from "./loggingMiddleWare/index";

export async function logFrontend(level: Parameters<typeof Log>[1], pkg: Parameters<typeof Log>[2], message: string) {
  try {
    await Log("frontend", level, pkg, message);
  } catch (error) {
    console.error("Frontend logging failed:", error);
  }
}
