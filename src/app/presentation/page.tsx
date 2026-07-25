import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentTab Presentation | Monad Blitz Toronto",
  description:
    "A three-minute demonstration of bounded x402 payments for autonomous agents on Monad.",
};

const contractUrl =
  "https://testnet.monadscan.com/address/0x9b223107e5724619cbfe06f4847eb097b46a8f16";

export default function PresentationPage() {
  return (
    <main className="shell presentation-shell">
      <div className="grid-noise" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">A/T</span>
          <span>AgentTab</span>
        </a>
        <div className="topbar-actions">
          <a className="presentation-link" href="/">
            Live demo
          </a>
          <div className="network-pill">
            <span className="network-dot" />
            Monad Testnet
          </div>
        </div>
      </header>

      <section className="presentation-hero">
        <p className="eyebrow">MONAD BLITZ TORONTO · PRESENTATION</p>
        <h1>
          The corporate card
          <br />
          <span>for autonomous agents.</span>
        </h1>
        <p className="lede">
          A 2:49 walkthrough of three real x402 payments, one policy block, and
          one public on-chain receipt.
        </p>
      </section>

      <section className="video-stage">
        <video
          controls
          preload="metadata"
          poster="/demo/agenttab-presentation-poster.jpg"
          playsInline
        >
          <source src="/demo/agenttab-presentation.mp4" type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </section>

      <section className="demo-facts" aria-label="Canonical demo values">
        <div>
          <span>Total allowance</span>
          <strong>0.030 USDC</strong>
        </div>
        <div>
          <span>Maximum purchase</span>
          <strong>0.002 USDC</strong>
        </div>
        <div>
          <span>Each approved API</span>
          <strong>0.001 USDC</strong>
        </div>
      </section>

      <section className="presentation-notes">
        <article>
          <span>01</span>
          <h2>What it does</h2>
          <p>
            AgentTab gives an AI agent a visible spending allowance. Purchases
            inside the rules can proceed automatically; purchases over the
            limit are blocked before payment.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>What the contract does</h2>
          <p>
            The Solidity contract is the public rulebook and receipt book. It
            publishes the budget policy and records a cryptographic receipt
            after the payment batch completes.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>What comes next</h2>
          <p>
            This MVP does not custody the funds. The production version would
            use a smart-account vault so the on-chain rules directly control
            the money.
          </p>
        </article>
      </section>

      <div className="presentation-actions">
        <a className="primary-action" href="/">
          Open live demo
          <span aria-hidden="true">→</span>
        </a>
        <a href={contractUrl} target="_blank" rel="noreferrer">
          View fresh budget contract ↗
        </a>
        <a
          href="https://github.com/SathianSrikrishnan/agenttab-monad"
          target="_blank"
          rel="noreferrer"
        >
          View source code ↗
        </a>
      </div>

      <footer>
        <p>AgentTab · Monad Blitz Toronto · July 25, 2026</p>
        <p>Built with x402 + Solidity + Monad EVM</p>
      </footer>
    </main>
  );
}
