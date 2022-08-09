import {
  useGroupState,
  useGroupStateDispatch,
} from "@/state/GroupStateContext";
import useComponentVisible from "@/hooks/useComponentVisible";

export default function TopBar() {
  const {
    ref: inviteModalRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible<HTMLDivElement>(false);

  const groupState = useGroupState();
  const groupStateDispatch = useGroupStateDispatch();

  return (
    <div className="bg-black w-full flex justify-between">
      <div className="text-white m-8 text-xl font-bold">WEAT</div>
      <div className="flex justify-end gap-1">
        <div className="text-white m-8 text-xl font-bold">
          <button onClick={() => setIsComponentVisible(!isComponentVisible)}>
            INVITE
          </button>
        </div>
        {loggedInUser.foodieGroupId && Object.keys(groupState).length >= 2 && (
          <div className="text-white m-8 text-xl font-bold">
            <button
              onClick={() => {
                leaveGroupMutation.mutate(
                  {},
                  {
                    onSuccess() {
                      socket.emit(
                        "user:state:updated",
                        loggedInUser.name,
                        loggedInUser.foodieGroupId as string
                        // pass undefined as the 3rd argument, so that we can delete this user's state
                      );

                      setLoggedInUser({
                        ...loggedInUser,
                        foodieGroupId: null,
                      });

                      groupStateDispatch({
                        type: "overwrite",
                        overwriteState: {
                          [loggedInUser.name]: groupState[
                            loggedInUser.name
                          ] as GroupUserState,
                        },
                      });

                      setLocalGroupState({
                        [loggedInUser.name]: groupState[
                          loggedInUser.name
                        ] as GroupUserState,
                      });
                    },
                  }
                );
              }}
            >
              LEAVE GROUP
            </button>
          </div>
        )}
        <div className="text-white m-8 text-xl font-bold">
          <button
            onClick={() => {
              if (!loggedInUser.foodieGroupId) {
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
                      loggedInUser.name,
                      loggedInUser.foodieGroupId as string
                    );

                    setLoggedInUser({
                      ...loggedInUser,
                      foodieGroupId: null,
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
