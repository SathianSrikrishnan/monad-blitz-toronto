import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

describe("agent run route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("fails closed when the disposable agent key is not configured", async () => {
    vi.stubEnv("AGENT_PRIVATE_KEY", "0xREPLACE_LOCALLY");

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/agent/run", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "AgentTab payment signer is not configured",
      code: "SETUP_REQUIRED",
    });
  });

  it("does not allow a payment run without the presenter code", async () => {
    vi.stubEnv("AGENT_PRIVATE_KEY", `0x${"11".repeat(32)}`);
    vi.stubEnv("DEMO_ACCESS_CODE", "1234");

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/agent/run", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Enter the presenter code to run the live Agent",
      code: "PRESENTER_CODE_REQUIRED",
    });
  });
});
