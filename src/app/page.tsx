"use client";

import { useState } from "react";

type PaidTool = {
  purchase: {
    id: string;
    tool: string;
    priceMicros: string;
  };
  payment: {
    success: boolean;
    transaction: string;
  };
};

type BlockedTool = {
  purchase: {
    id: string;
    tool: string;
    priceMicros: string;
  };
  reason: "PER_CALL_LIMIT" | "TOTAL_BUDGET";
};

type DemoResult = {
  paid: PaidTool[];
  failed: unknown[];
  blocked: BlockedTool[];
  spentMicros: string;
  remainingMicros: string;
  totalSpentMicros: string;
  elapsedMs: number;
  registry: {
    transactionHash: string;
    blockNumber: string;
  } | null;
};

const explorer = "https://testnet.monadscan.com";
const contractAddress = "0x9b223107e5724619cbfe06f4847eb097b46a8f16";
const demoBudgetMicros = 30_000;

function usdc(micros: string | number) {
  return (Number(micros) / 1_000_000).toFixed(3);
}

function shortHash(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState("");
  const [presenterCode, setPresenterCode] = useState("");

  async function runDemo() {
    setStatus("running");
    setError("");

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: {
          "x-demo-access-code": presenterCode,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "The demo could not complete");
      }

      setResult(payload);
      setStatus("done");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The demo could not complete",
      );
      setStatus("error");
    }
  }

  const totalSpent = result ? Number(result.totalSpentMicros) : 0;
  const remaining = Math.max(0, demoBudgetMicros - totalSpent);
  const spentPercent = Math.min(
    100,
    (totalSpent / demoBudgetMicros) * 100,
  );

  return (
    <main className="shell">
      <div className="grid-noise" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">A/T</span>
          <span>AgentTab</span>
        </a>
        <div className="topbar-actions">
          <a className="presentation-link" href="/presentation">
            Watch presentation
          </a>
          <div className="network-pill">
            <span className="network-dot" />
            Monad Testnet
          </div>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">THE PAYMENT FIREWALL FOR AUTONOMOUS AGENTS</p>
          <h1>
            Give agents a card.
            <br />
            <span>Keep the spending rules.</span>
          </h1>
          <p className="lede">
            AgentTab lets an AI agent buy digital services through x402—fast,
            in parallel, and inside a public on-chain budget.
          </p>
        </div>

        <div className="policy-stamp">
          <span>POLICY</span>
          <strong>ACTIVE</strong>
          <small>Contract-enforced record</small>
        </div>
      </section>

      <section className="console">
        <div className="console-head">
          <div>
            <p className="section-label">LIVE MISSION</p>
            <h2>Research a new market opportunity</h2>
          </div>
          <div className="presenter-controls">
            <label>
              <span>Presenter code</span>
              <input
                aria-label="Presenter code"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="••••"
                value={presenterCode}
                onChange={(event) =>
                  setPresenterCode(event.target.value.replace(/\D/g, ""))
                }
              />
            </label>
            <button
              className="run-button"
              onClick={runDemo}
              disabled={
                status === "running" ||
                remaining < 3_000 ||
                presenterCode.length !== 4
              }
            >
              {status === "running" ? (
                <>
                  <span className="spinner" />
                  Agent purchasing…
                </>
              ) : remaining < 3_000 ? (
                "Budget used"
              ) : (
                <>
                  Run agent
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mission-grid">
          <div className="budget-panel">
            <div className="budget-topline">
              <span>Budget status</span>
              <span>{Math.round(100 - spentPercent)}% available</span>
            </div>
            <div className="budget-value">
              <strong>${usdc(remaining)}</strong>
              <span>of $0.030 USDC</span>
            </div>
            <div className="meter">
              <span style={{ width: `${spentPercent}%` }} />
            </div>
            <dl className="limits">
              <div>
                <dt>Per purchase</dt>
                <dd>$0.002</dd>
              </div>
              <div>
                <dt>Agent</dt>
                <dd>0xc0C0…b367</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>24 hours</dd>
              </div>
            </dl>
          </div>

          <div className="tool-panel">
            <div className="lane-header">
              <span>Agent request</span>
              <span>Decision</span>
            </div>

            {[
              ["01", "Market research", "$0.001"],
              ["02", "Sentiment analysis", "$0.001"],
              ["03", "Risk check", "$0.001"],
            ].map(([number, name, price], index) => {
              const paid = result?.paid[index];
              return (
                <div className="tool-row" key={name}>
                  <span className="tool-number">{number}</span>
                  <div className="tool-name">
                    <strong>{name}</strong>
                    <span>{price} USDC</span>
                  </div>
                  <span
                    className={`decision ${
                      status === "running"
                        ? "working"
                        : paid
                          ? "approved"
                          : "ready"
                    }`}
                  >
                    {status === "running"
                      ? "PAYING"
                      : paid
                        ? "PAID"
                        : "READY"}
                  </span>
                </div>
              );
            })}

            <div className="tool-row blocked-row">
              <span className="tool-number">04</span>
              <div className="tool-name">
                <strong>Premium forecast</strong>
                <span>$0.003 USDC</span>
              </div>
              <span className="decision blocked">
                {result ? "BLOCKED" : "OVER LIMIT"}
              </span>
            </div>
          </div>
        </div>

        {status === "done" && result && (
          <div className="receipt-strip">
            <div className="receipt-success">
              <span className="check">✓</span>
              <div>
                <strong>
                  3 payments settled in {result.elapsedMs} ms
                </strong>
                <span>
                  ${usdc(result.spentMicros)} USDC paid · expensive request
                  blocked
                </span>
              </div>
            </div>
            {result.registry && (
              <a
                href={`${explorer}/tx/${result.registry.transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                On-chain receipt {shortHash(result.registry.transactionHash)} ↗
              </a>
            )}
          </div>
        )}

        {status === "error" && <p className="error-strip">{error}</p>}
      </section>

      <section className="proof-grid">
        <article>
          <span className="proof-index">01</span>
          <h3>Bounded</h3>
          <p>The owner sets a total budget, a per-purchase cap, and an expiry.</p>
        </article>
        <article>
          <span className="proof-index">02</span>
          <h3>Concurrent</h3>
          <p>
            The Agent sends independent purchases together; Monad provides the
            throughput and fast settlement layer.
          </p>
        </article>
        <article>
          <span className="proof-index">03</span>
          <h3>Provable</h3>
          <p>Every completed batch leaves a public, tamper-resistant receipt.</p>
        </article>
      </section>

      <section className="presentation-callout">
        <div>
          <p className="section-label">JUDGE MODE</p>
          <h2>Watch the complete 2:49 walkthrough.</h2>
          <p>
            The recorded presentation shows the live x402 payment flow, the
            blocked over-limit request, and the Monad on-chain receipt.
          </p>
        </div>
        <a href="/presentation">
          Play presentation
          <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer>
        <p>Built for Monad Blitz Toronto · x402 + Solidity + Monad EVM</p>
        <a
          href={`${explorer}/address/${contractAddress}`}
          target="_blank"
          rel="noreferrer"
        >
          View budget contract ↗
        </a>
      </footer>
    </main>
  );
}
