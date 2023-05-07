const getRoomName = (room, nsp) => {
  if (!room) return;
  let nspTitle = nsp.prefix;
  return `${nspTitle}:${room}`;
}

module.exports = {
  getRoomName
}