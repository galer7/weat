import type { GroupUserState } from "@/utils/types";
const LOCAL_STORAGE_GROUP_STATE_KEY = "local_group_state";

export function setLocalGroupState(groupState: Record<string, GroupUserState>) {
  localStorage.setItem(
    LOCAL_STORAGE_GROUP_STATE_KEY,
    JSON.stringify(groupState)
  );
}

export function getLocalGroupState(): Record<string, GroupUserState> {
  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_GROUP_STATE_KEY) as string
  );
}
