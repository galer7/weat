import type { NextPage } from "next";
import useComponentVisible from "@/hooks/useComponentVisible";
import Modal from "@/components/Modal";
import { prisma } from "@/server/db/client";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import type { GetServerSidePropsContext } from "next";
import { User } from "@prisma/client";
import MainSelector from "@/components/MainSelector";
import { io } from "socket.io-client";
import superjson from "superjson";

type FoodProps = {
  users: User[];
  name: string;
  currentUser: User;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Get user id
  const session = await getServerSession(
    context.req,
    context.res,
    nextAuthOptions
  );

  // I tried to search for a solution at middleware level, but this will work
  // as it is the main page for the application
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
      },
    };
  }

  // Find if that user has any foodie group associated
  const foundUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { foodieGroup: { include: { users: true } } },
  });

  const users = foundUser?.foodieGroup?.users || [];
  return {
    props: {
      users: users,
      name: session.user?.name || null,
      currentUser: session.user,
    },
  };
}

interface InviteFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
}

interface InviteForm extends HTMLFormElement {
  readonly elements: InviteFormFields;
}

const socket = io("ws://localhost:3001");

const Food: NextPage = ({
  users: serverSideUsers = [],
  name: loggedInName,
  currentUser,
}: FoodProps | Record<string, never>) => {
  useEffect(() => {
    socket.on("server:invite:sent", (from, to, foodieGroupId) => {
      console.log("an invite happened!");
      if (to === currentUser.name) {
        console.log("received invite sent for me!");
        setGroupInvitations([...groupInvitations, { from, to, foodieGroupId }]);
      } else {
        // TODO: render pending invite accept animation
      }
    });

    socket.on("server:state:updated", (stringifiedState, name) => {
      console.log("server:state:updated", { stringifiedState, name });
      if (name === loggedInName) return;
      const parsedState = superjson.parse(stringifiedState);
      setGroupState({
        ...groupState,
        [name]: parsedState,
      });
    });

    return () => {
      socket.off("server:invite:sent");
      socket.off("server:state:updated");
    };
  });

  const [groupState, setGroupState] = useState(
    serverSideUsers.length
      ? serverSideUsers.reduce((acc, user) => {
          acc[user.name] = [];
          return acc;
        }, {} as Record<string, any>)
      : { [loggedInName]: [] }
  );
  const [groupInvitations, setGroupInvitations] = useState<
    Array<{ from: string; foodieGroupId: string; to: string }>
  >([]);

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    console.log("captured inputs from INVITE form:", { username });
    inviteMutation.mutate(
      { invitedName: username, currentName: loggedInName },
      {
        onSuccess() {
          setIsComponentVisible(false);
        },
      }
    );

    socket.emit(
      "user:invite:sent",
      loggedInName,
      username,
      currentUser.foodieGroupId,
      groupState[loggedInName]
    );

    // add to groupState as empty object
    setGroupState({
      ...groupState,
      [username]: [],
    });
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
          const isCurrentUser = name === loggedInName;
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
                loggedInUser={currentUser}
                groupState={groupState}
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
                acceptInviteMutation.mutate({ from });

                socket.emit(
                  "user:invite:accepted",
                  to,
                  foodieGroupId,
                  groupState[to]
                );

                // delete all pending invitations after accepting one
                setGroupInvitations([]);
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
