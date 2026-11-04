export const convertAmountFromBase = (amount, rate) => {
  const value = Number(amount);
  const conversionRate = Number(rate);

  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
    return value;
  }

  return value * conversionRate;
};

export const convertAmountToBase = (amount, rate) => {
  const value = Number(amount);
  const conversionRate = Number(rate);

  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
    return value;
  }

  return value / conversionRate;
};
