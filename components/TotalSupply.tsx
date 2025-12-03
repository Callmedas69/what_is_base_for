"use client";

interface TotalSupplyProps {
  totalSupply?: bigint;
}

export function TotalSupply({ totalSupply = 0n }: TotalSupplyProps) {
  return (
    <div className="font-(--font-doto) text-[10px] text-[#5b616e]">
      {totalSupply.toLocaleString()}
    </div>
  );
}
