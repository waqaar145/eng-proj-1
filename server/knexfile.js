module.exports = {
  client: 'pg',
  connection: {
    host: "localhost",
    user: "postgres",
    password: "root", // qwertii123 in mac
    database: "postgres",
  },
  migrations: {
    directory: __dirname + '/db/migrations',
  },
  seeds: {
    directory: __dirname + '/db/seeds',
  },
}