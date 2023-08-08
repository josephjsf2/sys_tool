export class RedisConfig {
  host = '127.0.0.1';
  port = 6379;
  db = 0;
  user?: string;
  password?: string;

  constructor(
    host: string,
    port: number,
    db?: number,
    user?: string,
    password?: string,
  ) {
    this.host = host || this.host;
    this.port = port || this.port;
    this.db = db || this.db;
    this.user = user;
    this.password = password;
  }

  getConnectionString() {
    return `redis://${!!this.user ? this.user : ''}${
      !!this.password ? ':' + this.password : ''
    }${!!this.user ? '@' : ''}${this.host}:${this.port}/${this.db}`;
  }
}
