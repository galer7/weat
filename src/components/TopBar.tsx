import { useGroupState } from "@/state/GroupStateContext";
import { useLoggedUser } from "@/state/LoggedUserContext";
import { useSocket } from "@/state/SocketContext";
import { setLocalGroupState } from "@/utils/localStorage";
import { trpc } from "@/utils/trpc";
import { GroupUserState } from "@/utils/types";
import { signOut } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";

export default function TopBar({
  isComponentVisible,
  setIsComponentVisible,
}: {
  isComponentVisible: boolean;
  setIsComponentVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const leaveGroupMutation = trpc.useMutation("food.leave-group");
  const { groupState, dispatch: groupStateDispatch } = useGroupState();
  const socket = useSocket();
  const { loggedUser, dispatch } = useLoggedUser();

  return (
    <div className="bg-black w-full flex justify-between">
      <div className="text-white m-8 text-xl font-bold">WEAT</div>
      <div className="flex justify-end gap-1">
        <div className="text-white m-8 text-xl font-bold">
          <button onClick={() => setIsComponentVisible(!isComponentVisible)}>
            INVITE
          </button>
        </div>
        <>
          {loggedUser?.foodieGroupId &&
            groupState &&
            Object.keys(groupState).length >= 2 && (
              <div className="text-white m-8 text-xl font-bold">
                <button
                  onClick={() => {
                    leaveGroupMutation.mutate(
                      {},
                      {
                        onSuccess() {
                          socket.emit(
                            "user:state:updated",
                            loggedUser?.name as string,
                            loggedUser?.foodieGroupId as string
                            // pass undefined as the 3rd argument, so that we can delete this user's state
                          );

                          dispatch({
                            type: "overwrite",
                            payload: {
                              ...loggedUser,
                              foodieGroupId: null,
                            },
                          });

                          groupStateDispatch({
                            type: "overwrite",
                            overwriteState: {
                              [loggedUser?.name as string]: groupState[
                                loggedUser?.name as string
                              ] as GroupUserState,
                            },
                          });

                          setLocalGroupState(
                            groupState[
                              loggedUser?.name as string
                            ] as GroupUserState
                          );
                        },
                      }
                    );
                  }}
                >
                  LEAVE GROUP
                </button>
              </div>
            )}
        </>
        <div className="text-white m-8 text-xl font-bold">
          <button
            onClick={() => {
              if (!loggedUser?.foodieGroupId) {
                signOut();
                return;
              }

              leaveGroupMutation.mutate(
                {},
                {
                  onSuccess() {
                    // users that do not belong to any group can logout DUUH
                    socket.emit(
                      "user:state:updated",
                      loggedUser.name as string,
                      loggedUser.foodieGroupId as string
                    );

                    dispatch({
                      type: "overwrite",
                      payload: {
                        ...loggedUser,
                        foodieGroupId: null,
                      },
                    });

                    signOut();
                  },
                }
              );
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}
