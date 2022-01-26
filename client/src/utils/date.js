export const DateWihtoutTime = (data) => {
  let date = new Date(data);
  date.setHours(0, 0, 0, 0);
  return date.toDateString();
};
