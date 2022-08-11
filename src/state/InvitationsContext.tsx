import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

type Invitation = {
  from: string;
  to: string;
  foodieGroupId: string;
  ack: boolean;
};

const InvitationContext = createContext<{
  invitations: Invitation[];
  dispatch: Dispatch<InvitationsReducerAction>;
}>({
  invitations: [],
  dispatch: () => {},
});

export function InvitationProvider({ children }: { children: ReactNode }) {
  const [invitations, dispatch] = useReducer(invitationReducer, []);

  return (
    <InvitationContext.Provider value={{ invitations, dispatch }}>
      {children}
    </InvitationContext.Provider>
  );
}

type InvitationsReducerAction =
  | (Invitation & {
      type: "add";
    })
  | {
      type: "accept";
    }
  | { type: "refuse"; id: number };

function invitationReducer(
  invitations: Invitation[],
  action: InvitationsReducerAction
) {
  console.log("invitations dispatch", { invitations, action });
  const { type } = action;
  switch (type) {
    case "add": {
      const { type: _, ...payload } = action;
      return [...invitations, payload];
    }
    case "accept": {
      return [];
    }
    case "refuse": {
      const { id } = action;
      return invitations.filter((_, notificationId) => notificationId !== id);
    }
    default:
      console.error(`Action object ${action} unknown`);
      return invitations;
  }
}

export function useInvitations() {
  return useContext(InvitationContext);
}
