import { trpc } from "@/utils/trpc";
import { Dispatch, SetStateAction, useState } from "react";
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
  setIsComponentVisible: setIsModalVisible,
}: {
  setIsComponentVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const inviteMutation = trpc.useMutation("food.invite");
  const { socket } = useSocket();
  const { groupState, dispatch: groupStateDispatch } = useGroupState();
  const { loggedUser, dispatch } = useLoggedUser();
  const [usersFetchQuery, setUsersFetchQuery] = useState("");
  const getUsersForSearchQuery = trpc.useQuery([
    "users.getForSearch",
    { search: usersFetchQuery },
  ]);

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    inviteMutation.mutate(
      { to: [username], from: loggedUser?.name as string },
      {
        async onSuccess([newFoodieGroupId]) {
          setIsModalVisible(false);

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
              [username]: {
                isInviteAccepted: false,
                restaurants: [],
                image: loggedUser?.image as string,
              },
            },
          });
        },
        onError(error, variables, context) {
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="fixed z-10 bg-black rounded-lg border-yellow-500 border-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-20">
      <div className="text-center text-7xl text-teal-200 mt-4">
        Invite a friend
      </div>
      <form action="" onSubmit={handleInviteSubmit} autoComplete="off">
        <fieldset
          disabled={inviteMutation.isLoading}
          className="flex justify-center items-center mt-14 gap-10"
        >
          <label className="flex flex-col items-center gap-2 justify-around text-center text-xl">
            Username
            <input
              type="text"
              id="username"
              className="border-black border-2 text-black"
              value={usersFetchQuery}
              autoFocus
              onChange={async (e) => {
                console.log("on change ", e.target.value);
                setUsersFetchQuery(e.target.value);

                // refetch cancels any currently running requests before requesting again
                getUsersForSearchQuery.refetch();
              }}
            />
          </label>
          <input
            type="submit"
            value="SUBMIT"
            className="bg-gray-800 rounded-lg p-2 h-10 mt-4 cursor-pointer"
          />
        </fieldset>
      </form>
      <div className="mt-5 ml-20">
        {getUsersForSearchQuery.isLoading ? (
          "Loading..."
        ) : (
          <ul>
            {getUsersForSearchQuery.isSuccess &&
              getUsersForSearchQuery.data.map((user) => (
                <li
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setUsersFetchQuery(user.name);
                    getUsersForSearchQuery.refetch();
                  }}
                >
                  <div className="flex gap-5">
                    <div>{user.online ? "🟢" : "🔴"}</div>
                    <div>{user.name}</div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
