'use client';

import { PAYMENT_CONFIG } from '@/lib/config';
import type { PhraseCount } from '@/types/x402';

interface PhraseSelectorProps {
  selected: PhraseCount;
  onSelect: (count: PhraseCount) => void;
  disabled?: boolean;
}

/**
 * Phrase Count Selector Component
 * Allows users to select how many custom phrases they want to mint (1, 2, or 3)
 * Shows pricing for each option with "Best Value" badge for 3 phrases
 */
export function PhraseSelector({ selected, onSelect, disabled = false }: PhraseSelectorProps) {
  const options: PhraseCount[] = [1, 2, 3];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#0a0b0d]">
        How many phrases do you want to mint?
      </p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((count) => {
          const config = PAYMENT_CONFIG.PRICING_DISPLAY[count];
          const isSelected = selected === count;

          return (
            <button
              key={count}
              onClick={() => !disabled && onSelect(count)}
              disabled={disabled}
              className={`relative rounded-lg border-2 px-3 py-3 text-center transition-all ${
                isSelected
                  ? 'border-[#0000ff] bg-[#0000ff]/5 ring-2 ring-[#0000ff]/20'
                  : 'border-[#dee1e7] hover:border-[#0000ff]/50 hover:bg-[#f9fafb]'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              aria-label={`Select ${config.label} for ${config.price} USDC`}
              aria-pressed={isSelected}
            >
              {/* Best Value Badge */}
              {'badge' in config && config.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#0000ff] px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap shadow-sm">
                  {config.badge}
                </span>
              )}

              {/* Phrase Count Label */}
              <div className="text-sm font-semibold text-[#0a0b0d]">
                {config.label}
              </div>

              {/* Price */}
              <div className="text-xs text-[#5b616e] mt-1 font-mono">
                {config.price} USDC
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0000ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Pricing Info */}
      <p className="text-xs text-[#5b616e] text-center italic">
        💡 3 phrases = Best value! Save 50% compared to 1 phrase each
      </p>
    </div>
  );
}
