import type { NextApiRequest, NextApiResponse, NextPage } from "next";
import useComponentVisible from "@/hooks/useComponentVisible";
import Modal from "@/components/Modal";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { makeAuthOptions as makeNextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import type { GetServerSidePropsContext } from "next";
import { User } from "@prisma/client";
import MainSelector, { SelectedRestaurant } from "@/components/MainSelector";
import { io } from "socket.io-client";
import superjson from "superjson";

type FoodProps = { user: User };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Get user id
  const session = await getServerSession(
    context.req,
    context.res,
    makeNextAuthOptions(
      context.req as NextApiRequest,
      context.res as NextApiResponse
    )
  );

  // I tried to search for a solution at middleware level, but this will work
  // as it is the main page for the application
  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/api/auth/signin",
      },
    };
  }

  console.log("session.user ssr in plm", session.user);

  return {
    props: {
      user: session.user,
    },
  };
}

interface InviteFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
}

interface InviteForm extends HTMLFormElement {
  readonly elements: InviteFormFields;
}

const socket = io(process.env.NEXT_PUBLIC_WS_URL as string);

const Food: NextPage = (props: FoodProps | Record<string, never>) => {
  // set initial empty arrays for users if in a group,
  // else, just empty array for the logged in user

  const [loggedInUser, setLoggedInUser] = useState(props.user);
  const [groupState, setGroupState] = useState({
    [loggedInUser?.name as string]: [],
  } as Record<string, object[]>);

  const currentName = loggedInUser?.name as string;

  useEffect(() => {
    socket.on("server:first:render", (stringifiedState) => {
      console.log("first render!", { stringifiedState });
      const parsedState = superjson.parse(stringifiedState) as Map<
        string,
        Array<object>
      >;

      if (parsedState) {
        setGroupState(
          Object.fromEntries(
            new Map(
              Array.from(parsedState).sort(([a]) => {
                if (a === loggedInUser.name) return -1;
                return 1;
              })
            )
          )
        );
      }
    });

    socket.on("server:invite:sent", (from, to, foodieGroupId) => {
      console.log("an invite happened!");
      if (to === currentName) {
        console.log("received invite sent for me!");
        setGroupInvitations([...groupInvitations, { from, to, foodieGroupId }]);
      } else {
        // TODO: render pending invite accept animation
      }
    });

    socket.on("server:state:updated", (stringifiedState, name) => {
      console.log("server:state:updated", {
        stringifiedState,
        name,
        groupState,
      });
      if (name === currentName) return;
      const parsedState = superjson.parse(stringifiedState);
      setGroupState({
        ...groupState,
        [name]: parsedState,
      });
    });

    return () => {
      socket.off("server:first:render");
      socket.off("server:invite:sent");
      socket.off("server:state:updated");
    };
  });

  const [groupInvitations, setGroupInvitations] = useState<
    Array<{ from: string; foodieGroupId: string; to: string }>
  >([]);

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    console.log("captured inputs from INVITE form:", { username });
    await inviteMutation.mutate(
      { to: [username], from: currentName },
      {
        async onSuccess([newFoodieGroupId]) {
          setIsComponentVisible(false);
          setLoggedInUser({
            ...loggedInUser,
            foodieGroupId: newFoodieGroupId as string,
          });

          await fetch(`${process.env.NEXTAUTH_URL}/session?update`);
          console.log({ newFoodieGroupId });

          socket.emit(
            "user:invite:sent",
            currentName,
            username,
            // either foodie group was just created, either it existed from SSR
            newFoodieGroupId || loggedInUser?.foodieGroupId, // loggedInUser?.foodieGroupId is still from closure
            groupState[currentName]
          );

          // add to groupState as empty object
          setGroupState({
            ...groupState,
            [username]: [],
          });
        },
      }
    );
  };

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible<HTMLDivElement>(false);
  const inviteMutation = trpc.useMutation("food.invite");
  const acceptInviteMutation = trpc.useMutation("food.accept-invite");

  return (
    <div>
      {/* HEADER */}
      <div className="bg-black w-full flex justify-between">
        <div className="text-white p-8 px-10 text-xl font-bold">WEAT</div>
        <div className="text-white p-8 px-10 text-xl font-bold">
          <button onClick={() => setIsComponentVisible(!isComponentVisible)}>
            INVITE
          </button>
        </div>
      </div>

      <div>{JSON.stringify(groupState)}</div>
      {/* FLEX WITH YOUR FRIENDS */}
      <div className="flex gap-2 justify-evenly">
        {Object.keys(groupState).map((name, index) => {
          const isCurrentUser = name === currentName;
          return (
            <div
              className={`m-8 ${isCurrentUser && "border-red-600 border-2"}`}
              key={index}
            >
              <div className="m-4">{name}</div>
              <MainSelector
                restaurants={[
                  {
                    name: "1",
                    items: [
                      { name: "sushi", price: 12.12 },
                      { name: "sushi2", price: 122.122 },
                    ],
                  },
                  { name: "2", items: [{ name: "burger", price: 23.23 }] },
                  { name: "3", items: [{ name: "sandwich", price: 34.34 }] },
                  { name: "4", items: [{ name: "coffee", price: 45.45 }] },
                ]}
                name={name}
                loggedInUser={loggedInUser}
                groupState={groupState as Record<string, SelectedRestaurant[]>}
                setGroupState={setGroupState}
                socket={socket}
              />
              {/* MODAL FOR INVITE */}
              <div ref={ref}>
                {isComponentVisible && (
                  <Modal>
                    <div>Invite a friend</div>
                    <form
                      action=""
                      className="w-1/2"
                      onSubmit={handleInviteSubmit}
                    >
                      <fieldset disabled={inviteMutation.isLoading}>
                        <label className="flex gap-2 justify-around">
                          Username
                          <input
                            type="text"
                            id="username"
                            className="border-black border-2"
                          />
                        </label>
                        <input type="submit" value="submit" />
                      </fieldset>
                    </form>
                  </Modal>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* INVITE POPUP */}
      {groupInvitations.map(({ from, foodieGroupId, to }, index) => {
        return (
          <div key={index}>
            <div>Invite received from {from}</div>
            <button
              onClick={() => {
                acceptInviteMutation.mutate(
                  { from },
                  {
                    onSuccess(newFoodieGroupId) {
                      setLoggedInUser({
                        ...loggedInUser,
                        foodieGroupId: newFoodieGroupId as string,
                      });

                      socket.emit(
                        "user:invite:accepted",
                        to,
                        foodieGroupId,
                        groupState[to]
                      );

                      // delete all pending invitations after accepting one
                      setGroupInvitations([]);
                    },
                  }
                );
              }}
            >
              Accept
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Food;
