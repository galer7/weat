import { useGroupState } from "@/state/GroupStateContext";
import { useInvitations } from "@/state/InvitationsContext";
import { useLoggedUser } from "@/state/LoggedUserContext";
import { useSocket } from "@/state/SocketContext";
import { trpc } from "@/utils/trpc";
import { GroupUserState } from "@/utils/types";
import { User } from "next-auth";
import { useEffect } from "react";

export default function InvitationList() {
  const { socket } = useSocket();
  const { invitations, dispatch: invitationsDispatch } = useInvitations();
  const { groupState } = useGroupState();
  const { dispatch, loggedUser } = useLoggedUser();

  useEffect(() => {
    socket.on("server:invite:sent", (from, foodieGroupId) => {
      // no need to check for invite destination, as WS server sends to sockets of the invited user
      console.log("received invite sent for me!"), { from, foodieGroupId };

      invitationsDispatch({
        type: "add",
        from,
        foodieGroupId,
        ack: false,
      });
    });
  });

  const refuseInviteMutation = trpc.useMutation("food.refuse-invite");
  const acceptInviteMutation = trpc.useMutation("food.accept-invite");

  return (
    <div>
      {groupState &&
        invitations.map(({ from, foodieGroupId }, index) => {
          return (
            <div key={index} className="relative bg-black rounded-xl p-2">
              <div>
                Invite received from{" "}
                <span className="text-yellow-500">{from.name}</span>
              </div>
              <div className="flex justify-evenly mt-2">
                <button
                  className="bg-green-500 rounded-lg p-2"
                  onClick={() => {
                    acceptInviteMutation.mutate(
                      { from: from.id },
                      {
                        onSuccess() {
                          dispatch({
                            type: "overwrite",
                            payload: {
                              ...(loggedUser as User),
                              foodieGroupId,
                            },
                          });

                          socket.emit(
                            "user:invite:response",
                            loggedUser?.id as string,
                            foodieGroupId,
                            groupState[
                              loggedUser?.id as string
                            ] as GroupUserState
                          );

                          invitationsDispatch({ type: "accept" });
                        },
                      }
                    );
                  }}
                >
                  Accept ✓
                </button>
                <button
                  className="bg-red-600 p-2 rounded-lg"
                  onClick={() => {
                    refuseInviteMutation.mutate(
                      { from: from.id },
                      {
                        onSuccess() {
                          socket.emit(
                            "user:invite:response",
                            loggedUser?.id as string,
                            foodieGroupId
                          );

                          // delete just the refused invitation
                          invitationsDispatch({ type: "refuse", id: index });
                        },
                      }
                    );
                  }}
                >
                  Refuse ✕
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
