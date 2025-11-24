"use client";

import { MESSAGES, CHAIN_CONFIG } from "@/lib/config";

interface StatusMessagesProps {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  hash?: `0x${string}`;
  error: Error | null;
}

export function StatusMessages({
  isPending,
  isConfirming,
  isSuccess,
  hash,
  error,
}: StatusMessagesProps) {
  const isProcessing = isPending || isConfirming;

  return (
    <>
      {isProcessing && (
        <div className="rounded-lg border border-[#ffd12f] bg-[#ffd12f]/10 p-4 text-center text-[#0a0b0d]">
          <span className="font-medium">{isPending ? MESSAGES.MINTING : MESSAGES.TRANSACTION_PENDING}</span>
        </div>
      )}

      {isSuccess && (
        <div className="rounded-lg border border-[#66c800] bg-[#66c800]/10 p-4 text-center text-[#0a0b0d]">
          <span className="font-medium">{MESSAGES.MINT_SUCCESS}</span>
          {hash && (
            <a
              href={`${CHAIN_CONFIG.BASESCAN}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 font-medium text-[#0000ff] underline hover:text-[#3c8aff]"
            >
              View Transaction
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#fc401f] bg-[#fc401f]/10 p-4 text-center text-[#0a0b0d]">
          <span className="font-medium">{MESSAGES.MINT_ERROR}</span>
          <p className="mt-2 text-sm text-[#5b616e]">{error.message}</p>
        </div>
      )}
    </>
  );
}
