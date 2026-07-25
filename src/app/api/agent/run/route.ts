import { NextRequest, NextResponse } from "next/server";
import { decodePaymentResponseHeader } from "@x402/core/http";
import { timingSafeEqual } from "node:crypto";
import { getAddress, isHex, type Hex } from "viem";

import { runAgentMission } from "@/lib/agent-runner";
import { loadConfig } from "@/lib/config";
import { createBudgetRegistry } from "@/lib/registry";
import { createPaymentFetch } from "@/lib/x402/client";

export const runtime = "nodejs";

function configuredAgentKey(): Hex | undefined {
  const value = process.env.AGENT_PRIVATE_KEY?.trim();

  if (!value || !isHex(value) || value.length !== 66) {
    return undefined;
  }

  return value;
}

function presenterAuthorized(request: NextRequest) {
  const expected = process.env.DEMO_ACCESS_CODE?.trim();
  const supplied = request.headers.get("x-demo-access-code")?.trim();

  if (!expected || !supplied || expected.length !== supplied.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export async function POST(request: NextRequest) {
  const agentPrivateKey = configuredAgentKey();

  if (!agentPrivateKey) {
    return NextResponse.json(
      {
        error: "AgentTab payment signer is not configured",
        code: "SETUP_REQUIRED",
      },
      { status: 503 },
    );
  }

  if (!process.env.DEMO_ACCESS_CODE?.trim()) {
    return NextResponse.json(
      {
        error: "Presenter access is not configured",
        code: "ACCESS_SETUP_REQUIRED",
      },
      { status: 503 },
    );
  }

  if (!presenterAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Enter the presenter code to run the live Agent",
        code: "PRESENTER_CODE_REQUIRED",
      },
      { status: 401 },
    );
  }

  const config = loadConfig();
  const registry = createBudgetRegistry({
    rpcUrl: config.rpcUrl,
    registryAddress: config.registryAddress,
    agentPrivateKey,
  });

  if (getAddress(registry.agentAddress) !== getAddress(config.agentAddress)) {
    return NextResponse.json(
      {
        error: "Configured signer does not match the approved Agent wallet",
        code: "SIGNER_MISMATCH",
      },
      { status: 503 },
    );
  }

  const policy = await registry.readPolicy();

  if (policy.paused) {
    return NextResponse.json(
      {
        error: "The owner has paused this Agent policy",
        code: "POLICY_PAUSED",
      },
      { status: 409 },
    );
  }

  if (policy.expiresAt <= BigInt(Math.floor(Date.now() / 1_000))) {
    return NextResponse.json(
      {
        error: "This Agent policy has expired",
        code: "POLICY_EXPIRED",
      },
      { status: 409 },
    );
  }

  const result = await runAgentMission({
    baseUrl: request.nextUrl.origin,
    paymentFetch: createPaymentFetch(agentPrivateKey),
    policy,
  });

  const registryRecord =
    result.paid.length > 0
      ? await registry.recordBatch(
          result.paid.map((item) => item.purchase.priceMicros),
          result.paid.map((item) => item.paymentReceipt),
        )
      : undefined;

  return NextResponse.json({
    paid: result.paid.map((item) => ({
      data: item.data,
      payment: decodePaymentResponseHeader(item.paymentReceipt),
      purchase: {
        ...item.purchase,
        priceMicros: item.purchase.priceMicros.toString(),
      },
    })),
    failed: result.failed.map((item) => ({
      ...item,
      purchase: {
        ...item.purchase,
        priceMicros: item.purchase.priceMicros.toString(),
      },
    })),
    blocked: result.blocked.map((item) => ({
      ...item,
      purchase: {
        ...item.purchase,
        priceMicros: item.purchase.priceMicros.toString(),
      },
    })),
    spentMicros: result.spentMicros.toString(),
    remainingMicros: result.remainingMicros.toString(),
    totalSpentMicros: (
      policy.spentMicros + result.spentMicros
    ).toString(),
    policy: {
      totalMicros: policy.totalMicros.toString(),
      perCallMicros: policy.perCallMicros.toString(),
      spentBeforeMicros: policy.spentMicros.toString(),
    },
    registry: registryRecord
      ? {
          receiptHash: registryRecord.receiptHash,
          transactionHash: registryRecord.transactionHash,
          blockNumber: registryRecord.blockNumber.toString(),
        }
      : null,
    elapsedMs: result.elapsedMs,
  });
}
