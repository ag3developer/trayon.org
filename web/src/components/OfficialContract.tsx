"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ShieldAlert, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { TRAY_TOKEN } from "@/lib/token";

type Eip1193 = { request: (args: { method: string; params?: unknown }) => Promise<unknown> };

/**
 * Official TRAY contract card: full address with copy, Polygonscan link,
 * "add to wallet" (EIP-747 wallet_watchAsset), and a warning that other
 * tokens named TRAY are not official.
 */
export function OfficialContract() {
  const t = useTranslations("token.contract");
  const [copied, setCopied] = useState(false);
  const [walletMsg, setWalletMsg] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TRAY_TOKEN.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: address is still selectable */
    }
  };

  const addToWallet = async () => {
    const eth = (typeof window !== "undefined" ? (window as unknown as { ethereum?: Eip1193 }).ethereum : undefined);
    if (!eth) {
      setWalletMsg(t("noWallet"));
      return;
    }
    try {
      await eth.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: { address: TRAY_TOKEN.address, symbol: TRAY_TOKEN.symbol, decimals: TRAY_TOKEN.decimals },
        },
      });
      setWalletMsg(null);
    } catch {
      setWalletMsg(t("walletError"));
    }
  };

  return (
    <div className="mt-10 rounded-lg border border-accent/30 bg-accent/5 p-6 sm:p-8 lg:mt-14">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">{t("title")}</h3>
        <p className="text-xs text-muted">
          {TRAY_TOKEN.network} · {TRAY_TOKEN.standard} · {t("decimals", { n: TRAY_TOKEN.decimals })}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 select-all break-all rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground">
          {TRAY_TOKEN.address}
        </code>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("copied") : t("copy")}
          </button>
          <a
            href={TRAY_TOKEN.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("explorer")}
          </a>
          <button
            type="button"
            onClick={addToWallet}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
          >
            <Wallet className="h-3.5 w-3.5" />
            {t("addToWallet")}
          </button>
        </div>
      </div>
      {walletMsg && <p className="mt-2 text-xs text-danger">{walletMsg}</p>}

      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal" strokeWidth={1.75} />
        <span>{t("warning")}</span>
      </p>
    </div>
  );
}
