import type { NextApiRequest, NextApiResponse, NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import type { GroupUserState } from "@/utils/types";
import useComponentVisible from "@/hooks/useComponentVisible";
import InviteModal from "@/components/InviteModal";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { makeAuthOptions as makeNextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { useEffect } from "react";
import { User } from "@prisma/client";
import MainSelector from "@/components/MainSelector";
import Loading from "@/components/Loading";
import superjson from "superjson";
import { setLocalGroupState } from "@/utils/localStorage";
import { GroupStateProvider, useGroupState } from "@/state/GroupStateContext";
import { useSocket } from "@/state/SocketContext";
import { useNotifications } from "@/state/NotificationsContext";
import NotificationList from "@/components/NotificationList";
import InvitationList from "@/components/InvitationList";
import {
  LoggedInUserProvider,
  useLoggedInUser,
} from "@/state/LoggedUserContext";
import { Session } from "next-auth";
import TopBar from "@/components/TopBar";

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
      session,
    },
  };
}

const Food: NextPage = ({
  session,
}: { session: Session } | Record<string, never>) => {
  // save user from SSR in a state, because we will hold foodieGroupId until a refresh at some point
  const { dispatch } = useLoggedInUser();

  const {
    ref: inviteModalRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible<HTMLDivElement>(false);

  const currentName = session.user?.name as string;

  const socket = useSocket();
  const { addTemporaryToast } = useNotifications();
  const { groupState, dispatch: dispatchGroupState } = useGroupState();

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
        dispatchGroupState({
          type: "overwrite",
          overwriteState: Object.fromEntries(
            new Map(
              Array.from(parsedState).sort(([a]) => {
                if (a === session.user?.name) return -1;
                return 1;
              })
            )
          ),
        });
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

      if (!parsedState) {
        const { [name]: _, ...restOfGroupState } = groupState;
        dispatchGroupState({
          type: "overwrite",
          overwriteState: restOfGroupState,
        });

        // need to save to storage here, because the useEffect from MainSelector
        // is not activated because the loggedInUser is not modified here
        if (Object.keys(restOfGroupState).length === 1) {
          setLocalGroupState(
            Object.values(restOfGroupState)[0] as GroupUserState
          );

          dispatch({
            type: "overwrite",
            payload: {
              ...(session?.user as User),
              foodieGroupId: null,
            },
          });
        }

        addTemporaryToast({
          title: `${name} left your group!`,
        });
      } else {
        dispatchGroupState({
          type: "overwrite",
          overwriteState: {
            ...groupState,
            [name]: parsedState as GroupUserState,
          },
        });

        addTemporaryToast({
          title: `${name} joined your group!`,
        });
      }
    });

    return () => {
      // remove all listeners for all events
      socket.off();
    };
  });

  return (
    <LoggedInUserProvider user={session.user as User}>
      <GroupStateProvider
        initialState={{
          [session.user?.name as string]: {
            isInviteAccepted: true,
            restaurants: [],
          },
        }}
      >
        <TopBar
          isComponentVisible={isComponentVisible}
          setIsComponentVisible={setIsComponentVisible}
        />
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
                  <MainSelector name={name} />
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

        {/* INVITE MODAL */}
        <div ref={inviteModalRef}>
          {isComponentVisible && (
            <InviteModal setIsComponentVisible={setIsComponentVisible} />
          )}
        </div>
        <div className="bottom-0 right-0 fixed m-0 p-0">
          <NotificationList />
          <InvitationList />
        </div>
      </GroupStateProvider>
    </LoggedInUserProvider>
  );
};

export default Food;
