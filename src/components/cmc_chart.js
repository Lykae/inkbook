import React, { useMemo } from 'react';

export default function CmcChart({ deck }) {
  const stats = useMemo(() => {
    const result = {
      zero: 0,
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      six: 0,
      moreThanSix: 0
    };

    const cards = deck?.cards || [];

    cards.forEach((card) => {
      const cost = card.Cost ?? 0; // Lorcana API uses "Cost"

      if (cost === 0) result.zero++;
      else if (cost === 1) result.one++;
      else if (cost === 2) result.two++;
      else if (cost === 3) result.three++;
      else if (cost === 4) result.four++;
      else if (cost === 5) result.five++;
      else if (cost === 6) result.six++;
      else result.moreThanSix++;
    });

    return result;
  }, [deck]);

  return (
    <div className="cmc_inner">
      <div className="cmc_inner_left">
        <strong>0:</strong> {stats.zero} cards<br />
        <strong>1:</strong> {stats.one} cards<br />
        <strong>2:</strong> {stats.two} cards<br />
        <strong>3:</strong> {stats.three} cards<br />
      </div>

      <div className="cmc_inner_right">
        <strong>4:</strong> {stats.four} cards<br />
        <strong>5:</strong> {stats.five} cards<br />
        <strong>6:</strong> {stats.six} cards<br />
        <strong>&gt;6:</strong> {stats.moreThanSix} cards<br />
      </div>
    </div>
  );
}