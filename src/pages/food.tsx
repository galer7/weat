import type { NextApiRequest, NextApiResponse, NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import type {
  GroupUserState,
  GroupInvitation,
  ToastNotification,
} from "@/utils/types";
import useComponentVisible from "@/hooks/useComponentVisible";
import Modal from "@/components/Modal";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { makeAuthOptions as makeNextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import MainSelector from "@/components/MainSelector";
import Loading from "@/components/Loading";
import { io } from "socket.io-client";
import superjson from "superjson";
import { signOut } from "next-auth/react";
import { setLocalGroupState } from "@/utils/localStorage";
import ToastNotifStyle from "@/styles/ToastNotification.module.css";
import cn from "classnames";

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

const socket = io(process.env.NEXT_PUBLIC_WS_URL as string, {
  transports: ["websocket", "polling"],
});

const Food: NextPage = ({ user }: { user: User } | Record<string, never>) => {
  // save user from SSR in a state, because we will hold foodieGroupId until a refresh at some point
  const [loggedInUser, setLoggedInUser] = useState<User>(user);
  const [groupState, setGroupState] = useState({
    [loggedInUser.name as string]: { isInviteAccepted: true, restaurants: [] },
  } as Record<string, GroupUserState>);
  const [groupInvitations, setGroupInvitations] = useState<GroupInvitation[]>(
    []
  );
  const [toastNotifications, setToastNotifications] = useState(
    [] as ToastNotification[]
  );
  const {
    ref: inviteModalRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible<HTMLDivElement>(false);

  function addTemporaryToast(data: ToastNotification, expiry: number = 5000) {
    setToastNotifications([...toastNotifications, data]);

    setTimeout(() => {
      setToastNotifications(
        toastNotifications.filter(({ id }) => (data.id === id ? false : true))
      );
    }, expiry);
  }

  const inviteMutation = trpc.useMutation("food.invite");
  const acceptInviteMutation = trpc.useMutation("food.accept-invite");
  const leaveGroupMutation = trpc.useMutation("food.leave-group");
  const refuseInviteMutation = trpc.useMutation("food.refuse-invite");
  const currentName = loggedInUser?.name as string;

  useEffect(() => {
    socket.on("server:first:render", (stringifiedState) => {
      console.log("first render!", { stringifiedState });
      const parsedState = superjson.parse(stringifiedState) as Map<
        string,
        GroupUserState
      >;

      // on first render, state comes as a ES6 Map
      // On the WS server, the group state is persisted as a ES6 Map
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
      if (to !== currentName) return;

      console.log("received invite sent for me!");
      setGroupInvitations([
        ...groupInvitations,
        { from, to, foodieGroupId, ack: false },
      ]);
    });

    socket.on("server:state:updated", (stringifiedState, name) => {
      console.log("server:state:updated", {
        stringifiedState,
        name,
        groupState,
      });
      if (name === currentName) return;
      const parsedState = superjson.parse(stringifiedState);

      if (!parsedState) {
        const { [name]: _, ...restOfGroupState } = groupState;
        setGroupState(restOfGroupState);

        // need to save to storage here, because the useEffect from MainSelector
        // is not activated because the loggedInUser is not modified here
        if (Object.keys(restOfGroupState).length === 1) {
          setLocalGroupState(restOfGroupState);

          setLoggedInUser({
            ...loggedInUser,
            foodieGroupId: null,
          });
        }

        addTemporaryToast({
          title: `${name} left your group!`,
          id: toastNotifications.length,
        });
      } else {
        setGroupState({
          ...groupState,
          [name]: parsedState,
        });

        addTemporaryToast({
          title: `${name} joined your group!`,
          id: toastNotifications.length,
        });
      }
    });

    return () => {
      // remove all listeners for all events
      socket.off();
    };
  });

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    await inviteMutation.mutate(
      { to: [username], from: currentName },
      {
        async onSuccess([newFoodieGroupId]) {
          setIsComponentVisible(false);
          setLoggedInUser({
            ...loggedInUser,
            foodieGroupId: newFoodieGroupId as string,
          });

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
            [username]: { isInviteAccepted: false, restaurants: [] },
          });
        },
      }
    );
  };

  return (
    <div>
      {/* HEADER */}
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
                          loggedInUser.foodieGroupId
                          // pass undefined as the 3rd argument, so that we can delete this user's state
                        );

                        setLoggedInUser({
                          ...loggedInUser,
                          foodieGroupId: null,
                        });

                        setGroupState({
                          [loggedInUser.name]: groupState[
                            loggedInUser.name
                          ] as GroupUserState,
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
                        loggedInUser.foodieGroupId
                        // pass undefined as the 3rd argument, so that we can delete this user's state
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
              {groupState[name]?.isInviteAccepted ? (
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
                  groupState={groupState}
                  setGroupState={setGroupState}
                  socket={socket}
                />
              ) : (
                <div>
                  <div className="m-4">Loading...</div>
                  <Loading className="m-4" />
                </div>
              )}
              {/* MODAL FOR INVITE */}
              <div ref={inviteModalRef}>
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
      <div className="bottom-0 right-0 fixed m-0 p-0">
        {/* TOAST NOTIFICATIONS: should sit on top of group invitations */}
        {toastNotifications.map(({ title }, index) => {
          return (
            <div
              key={index}
              className={cn("relative", ToastNotifStyle.toastNotification)}
            >
              <button onClick={() => {}}>X</button>
              <div>{title}</div>
            </div>
          );
        })}
        {/* GROUP INVITATIONS: should always be stacked in bottom right corner */}
        {groupInvitations.map(({ from, foodieGroupId, to }, index) => {
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
                          "user:invite:accepted",
                          to,
                          foodieGroupId,
                          groupState[to]
                        );

                        setGroupInvitations([]);
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
                        socket.emit("user:invite:refused", to, foodieGroupId);

                        // delete just the refused invitation
                        setGroupInvitations(
                          groupInvitations.filter(
                            ({
                              from: cFrom,
                              foodieGroupId: cFoodieGroupId,
                            }) => {
                              if (
                                cFrom === from &&
                                cFoodieGroupId === foodieGroupId
                              )
                                return false;
                              return true;
                            }
                          )
                        );
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
    </div>
  );
};

export default Food;
