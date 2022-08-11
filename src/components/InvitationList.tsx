import { useGroupState } from "@/state/GroupStateContext";
import { useInvitations } from "@/state/InvitationsContext";
import { useLoggedUser } from "@/state/LoggedUserContext";
import { useSocket } from "@/state/SocketContext";
import { trpc } from "@/utils/trpc";
import { GroupUserState } from "@/utils/types";
import { User } from "next-auth";
import { useEffect } from "react";

export default function InvitationList() {
  const socket = useSocket();
  const { invitations, dispatch: invitationsDispatch } = useInvitations();
  const { groupState } = useGroupState();
  const { dispatch, loggedUser } = useLoggedUser();

  useEffect(() => {
    socket.on("server:invite:sent", (from, to, foodieGroupId) => {
      console.log("an invite happened!");
      if (to !== loggedUser?.name) return;

      console.log("received invite sent for me!");

      invitationsDispatch({ type: "add", from, to, foodieGroupId, ack: false });
    });
  });

  const refuseInviteMutation = trpc.useMutation("food.refuse-invite");
  const acceptInviteMutation = trpc.useMutation("food.accept-invite");

  return (
    <div>
      {groupState &&
        invitations.map(({ from, foodieGroupId, to }, index) => {
          return (
            <div key={index} className="relative">
              <div>Invite received from {from}</div>
              <button
                onClick={() => {
                  acceptInviteMutation.mutate(
                    { from },
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
                          to,
                          foodieGroupId,
                          groupState[to] as GroupUserState
                        );

                        invitationsDispatch({ type: "accept" });
                      },
                    }
                  );
                }}
              >
                Accept
              </button>
              <button
                onClick={() => {
                  refuseInviteMutation.mutate(
                    { from },
                    {
                      onSuccess() {
                        socket.emit("user:invite:response", to, foodieGroupId);

                        // delete just the refused invitation
                        invitationsDispatch({ type: "refuse", id: index });
                      },
                    }
                  );
                }}
              >
                Refuse
              </button>
            </div>
          );
        })}
    </div>
  );
}
