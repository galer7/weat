import type { GroupUserState } from "@/utils/types";
const LOCAL_STORAGE_GROUP_STATE_KEY = "local_group_state";

export function setLoggedUserState(groupState: GroupUserState) {
  localStorage.setItem(
    LOCAL_STORAGE_GROUP_STATE_KEY,
    JSON.stringify(groupState)
  );
}

export function getLoggedUserState(): GroupUserState {
  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_GROUP_STATE_KEY) as string
  );
}
