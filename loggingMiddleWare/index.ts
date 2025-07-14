import fetch from "node-fetch";

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzdXNoaWx2ZXJtYTExMjVAZ21haWwuY29tIiwiZXhwIjoxNzUyNDcyMTYwLCJpYXQiOjE3NTI0NzEyNjAsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4YzAyNDQxMS1hMzRjLTRkYTEtYjdhNC1lYjYwNDUxODBjZDMiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzdXNoaWwga3VtYXIgdmVybWEiLCJzdWIiOiI4ZmU5YWZhYi1lMDk2LTQ2OGYtYjlkMC1hM2FmOGY1N2UzZGUifSwiZW1haWwiOiJzdXNoaWx2ZXJtYTExMjVAZ21haWwuY29tIiwibmFtZSI6InN1c2hpbCBrdW1hciB2ZXJtYSIsInJvbGxObyI6IjEyMjIyMjIxIiwiYWNjZXNzQ29kZSI6IkNaeXBRSyIsImNsaWVudElEIjoiOGZlOWFmYWItZTA5Ni00NjhmLWI5ZDAtYTNhZjhmNTdlM2RlIiwiY2xpZW50U2VjcmV0IjoidFFWdUdramRCU0JCVHNHRCJ9.5HnaeCQUq8mzjy5Cfiz01wM0sRaA2OUKjXl_nu_voiM";

const validStacks = ["backend", "frontend"] as const;
const validLevels = ["debug", "info", "warn", "error", "fatal"] as const;
const backendPackages = ["cache", "controller", "cron_job", "domain", "handler", "repository", "route", "service"] as const;
const frontendPackages = ["api", "component", "hook", "page", "state", "style"] as const;
const bothPackages = ["auth", "config", "middleware", "utils"] as const;

type Stack = typeof validStacks[number];
type Level = typeof validLevels[number];
type Package = typeof backendPackages[number] | typeof frontendPackages[number] | typeof bothPackages[number];

interface LogParams {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

export async function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void> {
  if (!validStacks.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  if (!validLevels.includes(level)) {
    throw new Error(`Invalid level: ${level}`);
  }

  if (stack === "backend") {
    if (!backendPackages.includes(pkg) && !bothPackages.includes(pkg)) {
      throw new Error(`Invalid package for backend: ${pkg}`);
    }
  } else if (stack === "frontend") {
    if (!frontendPackages.includes(pkg) && !bothPackages.includes(pkg)) {
      throw new Error(`Invalid package for frontend: ${pkg}`);
    }
  }

  const payload: LogParams = { stack, level, package: pkg, message };

  try {
    const res = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Failed to log message: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log(`Log created with ID: ${data.logID}`);
  } catch (error) {
    console.error("Error sending log:", error);
  }
}
