
export const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "GBP",
});

export const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
});
