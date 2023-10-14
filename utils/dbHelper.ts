import { Connection, connect } from "@planetscale/database";

let psConn: Connection;
export function getConn() {
  if (!psConn) {
    const psConfig: PlanetScaleConnConfig = {
      host: process.env.PLANETSCALE_DB_HOST,
      username: process.env.PLANETSCALE_DB_USERNAME,
      password: process.env.PLANETSCALE_DB_PASSWORD,
    };
    psConn = connect(psConfig);
  }
  return psConn;
}

interface PlanetScaleConnConfig {
  host: string;
  username: string;
  password: string;
}
