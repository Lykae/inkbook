export const getCardKey = (c) =>
  `${c.Name || c.name}-${c.Set_Name || c.set_name}-${c.Image || c.image}`;