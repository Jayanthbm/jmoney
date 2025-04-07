export const formatIndianNumber = (num) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString("en-IN");
};
