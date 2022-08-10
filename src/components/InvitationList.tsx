import { useGroupState } from "@/state/GroupStateContext";
import { useInvitations } from "@/state/InvitationsContext";
import { useSocket } from "@/state/SocketContext";
import { trpc } from "@/utils/trpc";
import { GroupUserState } from "@/utils/types";
import { useEffect } from "react";

export default function InvitationList() {
  const socket = useSocket();
  const { invitations, dispatch: invitationsDispatch } = useInvitations();
  const { state } = useGroupState();

  useEffect(() => {
    socket.on("server:invite:sent", (from, to, foodieGroupId) => {
      console.log("an invite happened!");
      if (to !== currentName) return;

      console.log("received invite sent for me!");

      invitationsDispatch({ type: "add", from, to, foodieGroupId, ack: false });
    });
  });

  const refuseInviteMutation = trpc.useMutation("food.refuse-invite");
  const acceptInviteMutation = trpc.useMutation("food.accept-invite");

  return (
    <div>
      {invitations.map(({ from, foodieGroupId, to }, index) => {
        return (
          <div key={index} className="relative">
            <div>Invite received from {from}</div>
            <button
              onClick={() => {
                acceptInviteMutation.mutate(
                  { from },
                  {
                    onSuccess() {
                      setLoggedInUser({
                        ...loggedInUser,
                        foodieGroupId,
                      });

                      socket.emit(
                        "user:invite:response",
                        to,
                        foodieGroupId,
                        state[to] as GroupUserState
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
