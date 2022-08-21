import type { NextApiRequest, NextApiResponse, NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import type { GroupState, GroupUserState } from "@/utils/types";
import useComponentVisible from "@/hooks/useComponentVisible";
import InviteModal from "@/components/InviteModal";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { makeAuthOptions as makeNextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { useEffect } from "react";
import { User } from "@prisma/client";
import MainSelector from "@/components/MainSelector";
import Loading from "@/components/Loading";
import superjson from "superjson";
import { useGroupState } from "@/state/GroupStateContext";
import { useSocket } from "@/state/SocketContext";
import { useNotifications } from "@/state/NotificationsContext";
import NotificationList from "@/components/NotificationList";
import InvitationList from "@/components/InvitationList";
import { useLoggedUser } from "@/state/LoggedUserContext";
import TopBar from "@/components/TopBar";
import Image from "next/image";

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

  console.log("ssr log", { session, cookies: context.req.cookies });
  return {
    props: {
      user: session.user,
      sessionToken:
        context.req.cookies[
          (process.env.VERCEL_URL ? "__Secure-" : "") +
            "next-auth.session-token"
        ],
    },
  };
}

// In this component i must use props.session.user instead of LoggedUserContext's user
const Food: NextPage = ({
  user,
  sessionToken,
}: { user: User; sessionToken: string } | Record<string, never>) => {
  const {
    ref: inviteModalRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible(false);

  const { socket, dispatch: dispatchSocket } = useSocket();
  const { addTemporaryToast } = useNotifications();
  const { groupState, dispatch: dispatchGroupState } = useGroupState();
  const { loggedUser, dispatch: dispatchLoggedUser } = useLoggedUser();

  useEffect(() => {
    dispatchSocket({ type: "set-session-token", token: sessionToken });

    if (!groupState)
      dispatchGroupState({
        type: "overwrite",
        overwriteState: {
          [user?.id as string]: {
            name: user.name,
            isInviteAccepted: true,
            restaurants: [],
            image: user?.image as string,
          },
        },
      });

    if (!loggedUser) dispatchLoggedUser({ type: "overwrite", payload: user });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("server:first:render", (stringifiedState) => {
      console.log("first render!", { stringifiedState });
      const parsedState = superjson.parse(stringifiedState) as Map<
        string,
        GroupUserState
      >;

      // on first render, state comes as a ES6 Map
      // on the WS server, the group state is persisted as a ES6 Map
      if (parsedState) {
        dispatchGroupState({
          type: "overwrite",
          overwriteState: Object.fromEntries(
            new Map(
              Array.from(parsedState).sort(([a]) => {
                if (a === user?.name) return -1;
                return 1;
              })
            )
          ),
        });
      }
    });

    socket.on("server:state:updated", (stringifiedState, userId) => {
      console.log("server:state:updated", {
        stringifiedState,
        userId,
        groupState,
      });
      if (userId === loggedUser?.id) return;
      const parsedState = superjson.parse(stringifiedState);

      if (!parsedState) {
        const { [userId]: _, ...restOfGroupState } = groupState as GroupState;
        dispatchGroupState({
          type: "overwrite",
          overwriteState: restOfGroupState,
        });

        // need to save to storage here, because the useEffect from MainSelector
        // is not activated because the loggedInUser is not modified here
        if (Object.keys(restOfGroupState).length === 1) {
          dispatchLoggedUser({
            type: "overwrite",
            payload: {
              ...user,
              foodieGroupId: null,
            },
          });
        }

        addTemporaryToast({
          title: `${(groupState as GroupState)[userId]?.name} left your group!`,
        });
      } else {
        if (
          (groupState as GroupState)[userId] &&
          !(groupState as GroupState)[userId]?.isInviteAccepted
        ) {
          addTemporaryToast({
            title: `${
              (groupState as GroupState)[userId]?.name
            } joined your group!`,
          });
        }

        dispatchGroupState({
          type: "overwrite",
          overwriteState: {
            ...groupState,
            [userId]: parsedState as GroupUserState,
          },
        });
      }
    });

    return () => {
      // remove all listeners for all events
      socket.off();
    };
  });

  return (
    <div>
      <TopBar
        isComponentVisible={isComponentVisible}
        setIsComponentVisible={setIsComponentVisible}
      />
      <div className="flex gap-2 justify-evenly">
        {groupState &&
          Object.keys(groupState).map((userId, index) => {
            return (
              <div className={`m-8`} key={index}>
                <div className="flex flex-col">
                  {groupState[userId]?.image && (
                    <div className="h-24 w-24 relative mx-auto mt-3">
                      <Image
                        className="rounded-full shadow-2xl"
                        layout="fill"
                        objectFit="cover"
                        src={(groupState[userId] as GroupUserState).image}
                        alt={`Profile picture of ${name}`}
                        priority={true}
                      />
                    </div>
                  )}
                  <div className="m-4 text-center">
                    {groupState[userId]?.name}
                  </div>
                </div>
                {groupState[userId]?.isInviteAccepted ? (
                  <MainSelector userId={userId} />
                ) : (
                  <div>
                    <div className="m-4">Loading...</div>
                    <Loading className="m-4" />
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div ref={inviteModalRef}>
        {isComponentVisible && (
          <InviteModal setIsComponentVisible={setIsComponentVisible} />
        )}
      </div>
      <div className="bottom-0 right-0 fixed m-0 p-0">
        <NotificationList />
        <InvitationList />
      </div>
    </div>
  );
};

export default Food;
