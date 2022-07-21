import type { NextPage } from "next";
import { useEffect, useState } from "react";
import useComponentVisible from "@/hooks/useComponentVisible";
import Modal from "@/components/Modal";
import useSocket from "@/hooks/useSocket";
import { prisma } from "@/server/db/client";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { trpc } from "@/utils/trpc";
import type { GetServerSidePropsContext } from "next";
import { User } from "@prisma/client";

type FoodProps = {
  users: User[];
  name: string;
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
  users: sessionUsers,
  name: currentName,
}: FoodProps) => {
  useEffect(() => {
    // Update the document title using the browser API
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
    });
  }, []);

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

  const makeFoodCarousel = (key: number) => (
    <div key={key}>food selector {key}</div>
  );
  const [foodSelectors, setFoodSelectors] = useState([makeFoodCarousel(0)]);
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible<HTMLDivElement>(false);
  useSocket();

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

      <div>{JSON.stringify(sessionUsers)}</div>
      {/* FLEX WITH YOUR FRIENDS */}
      <div className="flex gap-2 justify-evenly">
        {sessionUsers.map(({ name }, index) => (
          <div
            className={`m-8 ${name === "you" && "border-red-600 border-2"}`}
            key={index}
          >
            <div className="m-4">{name}</div>
            <div>restaurant selector</div>
            {foodSelectors.map((elem, selectorIndex) => {
              if (selectorIndex > 0 && name === currentName) {
                return (
                  <div className="flex justify-center" key={selectorIndex}>
                    {elem}
                    <button
                      className="rounded-full bg-black text-white w-8 h-8"
                      onClick={() =>
                        setFoodSelectors(
                          foodSelectors.filter((_, i) => i !== selectorIndex)
                        )
                      }
                    >
                      -
                    </button>
                  </div>
                );
              }
              return elem;
            })}
            {name === currentName && (
              <button
                className="rounded-full bg-black text-white w-8 h-8"
                onClick={() =>
                  setFoodSelectors([
                    ...foodSelectors,
                    makeFoodCarousel(foodSelectors.length),
                  ])
                }
              >
                +
              </button>
            )}
            <hr className="bg-black h-1" />
            <div>total: </div>
            {name === currentName && (
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
        ))}
      </div>
    </div>
  );
};

export default Food;
