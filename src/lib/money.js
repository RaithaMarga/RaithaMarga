export const rupees = (value) => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
