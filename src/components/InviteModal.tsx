import { trpc } from "@/utils/trpc";
import { Dispatch, SetStateAction } from "react";
import type { GroupState, GroupUserState } from "@/utils/types";
import { useSocket } from "@/state/SocketContext";
import { useGroupState } from "@/state/GroupStateContext";
import { useLoggedUser } from "@/state/LoggedUserContext";
import { User } from "next-auth";

interface InviteFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
}

export interface InviteForm extends HTMLFormElement {
  readonly elements: InviteFormFields;
}

export default function InviteModal({
  setIsComponentVisible,
}: {
  setIsComponentVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const inviteMutation = trpc.useMutation("food.invite");
  const socket = useSocket();
  const { groupState, dispatch: groupStateDispatch } = useGroupState();
  const { loggedUser, dispatch } = useLoggedUser();

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    await inviteMutation.mutate(
      { to: [username], from: loggedUser?.name as string },
      {
        async onSuccess([newFoodieGroupId]) {
          setIsComponentVisible(false);

          dispatch({
            type: "overwrite",
            payload: {
              ...(loggedUser as User),
              foodieGroupId: newFoodieGroupId as string,
            },
          });

          console.log({ newFoodieGroupId });

          socket.emit(
            "user:invite:sent",
            loggedUser?.name as string,
            username,
            // either foodie group was just created, either it existed from SSR
            newFoodieGroupId || (loggedUser?.foodieGroupId as string), // loggedUser?.foodieGroupId is still from closure
            (groupState as GroupState)[
              loggedUser?.name as string
            ] as GroupUserState
          );

          // add to groupState as empty object
          groupStateDispatch({
            type: "overwrite",
            overwriteState: {
              ...groupState,
              [username]: { isInviteAccepted: false, restaurants: [] },
            },
          });
        },
      }
    );
  };

  return (
    <div className="fixed w-1/2 h-1/2 top-0 left-0 z-10 bg-sky-700">
      <div>Invite a friend</div>
      <form action="" className="w-1/2" onSubmit={handleInviteSubmit}>
        <fieldset disabled={inviteMutation.isLoading}>
          <label className="flex gap-2 justify-around">
            Username
            <input
              type="text"
              id="username"
              className="border-black border-2 text-black"
            />
          </label>
          <input type="submit" value="submit" />
        </fieldset>
      </form>
    </div>
  );
}
