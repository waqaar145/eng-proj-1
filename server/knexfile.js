module.exports = {
  client: 'pg',
  connection: {
    host: "localhost",
    user: "waqaar",
    password: "qwertii123", // qwertii123 in mac
    database: "engtech",
  },
  migrations: {
    directory: __dirname + '/db/migrations',
  },
  seeds: {
    directory: __dirname + '/db/seeds',
  },
}