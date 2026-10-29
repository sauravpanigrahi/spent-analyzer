export const getCategoryLabel = (categoryId, fallback, t) => {
  const translation = t(`categories.${categoryId}`, {
    defaultValue: fallback || categoryId,
  });
  return translation;
};

export const getPaymentMethodLabel = (methodId, fallback, t) =>
  t(`paymentMethods.${methodId}`, {
    defaultValue: fallback || methodId,
  });
