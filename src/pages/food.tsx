import type { NextPage } from "next";
import useComponentVisible from "@/hooks/useComponentVisible";
import Modal from "@/components/Modal";
import { prisma } from "@/server/db/client";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import type { GetServerSidePropsContext } from "next";
import { User } from "@prisma/client";
import MainSelector from "@/components/MainSelector";
import useSocket from "@/hooks/useSocket";

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

  if (session) {
    // Find if that user has any foodie group associated
    const foundUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      include: { foodieGroup: { include: { users: true } } },
    });

    const users = foundUser?.foodieGroup?.users || [];
    return {
      props: {
        users,
        name: session.user?.name || null,
        currentUser: session.user,
      },
    };
  }

  return {
    props: {},
  };
}

interface InviteFormFields extends HTMLFormControlsCollection {
  username: HTMLInputElement;
}

interface InviteForm extends HTMLFormElement {
  readonly elements: InviteFormFields;
}

const Food: NextPage = ({
  users: serverSideUsers,
  name: currentName,
  currentUser,
}: FoodProps | Record<string, never>) => {
  // useEffect(() => {
  //   // Update the document title using the browser API
  //   navigator.geolocation.getCurrentPosition(function (position) {
  //     console.log("Latitude is :", position.coords.latitude);
  //     console.log("Longitude is :", position.coords.longitude);
  //   });
  // }, []);

  const handleInviteSubmit = async (event: React.FormEvent<InviteForm>) => {
    event.preventDefault();

    const {
      username: { value: username },
    } = event.currentTarget.elements;

    console.log("captured inputs from INVITE form:", { username });
    inviteMutation.mutate(
      { invitedName: username, currentName },
      {
        onSuccess() {
          setIsComponentVisible(false);
        },
      }
    );
  };

  const socket = useSocket(currentName, state, setState);
  const [groupUsers, setGroupUsers] = useState<User[]>(serverSideUsers);
  const [groupState, setGroupState] = useState(
    groupUsers.reduce((acc, user) => {
      acc[user.name] = [];
      return acc;
    }, {} as Record<string, any>)
  );

  socket.on("server:invite:sent", ({ to, foodieGroupId }) => {
    if (currentUser.foodieGroupId !== foodieGroupId) return;

    if (to === currentUser.name) {
      // TODO: show popup + emit on accept
    } else {
      // TODO: render pending invite accept animation
    }
  });

  socket.on("server:state:updated", ({ state }) => {
    setGroupState(state);
  });

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible<HTMLDivElement>(false);
  const inviteMutation = trpc.useMutation("food.invite");

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

      <div>{JSON.stringify(serverSideUsers)}</div>
      {/* FLEX WITH YOUR FRIENDS */}
      <div className="flex gap-2 justify-evenly">
        {serverSideUsers.map(({ name }, index) => {
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
                currentName={currentName}
                groupState={groupState}
                setGroupState={setGroupState}
              />
              {/* MODAL FOR INVITE */}
              {isCurrentUser && (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Food;
