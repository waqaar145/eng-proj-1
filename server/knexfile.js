module.exports = {
  client: 'pg',
  connection: {
    host: "localhost",
    user: "root",
    password: "qwertii123", // qwertii123 in mac
    database: "english",
  },
  migrations: {
    directory: __dirname + '/db/migrations',
  },
  seeds: {
    directory: __dirname + '/db/seeds',
  },
}