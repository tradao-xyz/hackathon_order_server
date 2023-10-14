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

export async function selectUserInfoByTgId(tgId: number) {
  const conn = getConn();
  const selectUserInfoStatement = `select tgId, sessionKey, scw, updatetime
    from tradaodb1.HackasonUserInfo
    where tgId = ?`;
  return conn.execute(selectUserInfoStatement, [tgId]).then((r) => {
    const infos = r.rows as UserInfo[];
    return infos[0] ?? null;
  });
}

export interface UserInfo {
  tgId: number;
  sessionKey: string;
  scw: string;
  updatetime: number;
}

export async function insertBinding(
  tgId: number,
  sessionKey: string,
  scw: string
) {
  const conn = getConn();
  const selectUserInfoStatement = `insert ignore into tradaodb1.HackasonUserInfo (tgId, sessionKey, scw) values (?, ?, ?)`;
  return conn
    .execute(selectUserInfoStatement, [tgId, sessionKey, scw])
    .then((r) => {
      return r.rowsAffected;
    });
}
