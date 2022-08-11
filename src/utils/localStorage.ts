import type { GroupUserState } from "@/utils/types";
const LOCAL_STORAGE_GROUP_STATE_KEY = "local_group_state";

export function setLocalGroupState(groupState: GroupUserState) {
  localStorage.setItem(
    LOCAL_STORAGE_GROUP_STATE_KEY,
    JSON.stringify(groupState)
  );
}

export function getLocalGroupState(): GroupUserState {
  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_GROUP_STATE_KEY) as string
  );
}
