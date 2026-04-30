import React, { useMemo } from 'react';
import PieChart from 'react-simple-pie-chart';

export default function ColorChart({ deck }) {
  const stats = useMemo(() => {
    const result = {
      Amber: 0,
      Amethyst: 0,
      Emerald: 0,
      Ruby: 0,
      Sapphire: 0,
      Steel: 0
    };

    const cards = deck?.cards || [];

    cards.forEach((card) => {
      const color = card.Color; // Lorcana API field

      if (color && result[color] !== undefined) {
        result[color]++;
      }
    });

    return result;
  }, [deck]);

  return (
    <PieChart
      slices={[
        {
          color: '#f2c14e', // Amber
          value: stats.Amber
        },
        {
          color: '#b46cff', // Amethyst
          value: stats.Amethyst
        },
        {
          color: '#3cb371', // Emerald
          value: stats.Emerald
        },
        {
          color: '#e63946', // Ruby
          value: stats.Ruby
        },
        {
          color: '#4ea8de', // Sapphire
          value: stats.Sapphire
        },
        {
          color: '#6c757d', // Steel
          value: stats.Steel
        }
      ]}
    />
  );
}