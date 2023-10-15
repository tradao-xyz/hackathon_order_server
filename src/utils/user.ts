import { selectUserInfoByTgId } from "./dbHelper";

export async function selectUserInfo(tgId: number) {
  return await selectUserInfoByTgId(tgId);
}
