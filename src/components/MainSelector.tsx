import { useEffect, useState } from "react";
import type { GroupState, SelectedRestaurant } from "@/utils/types";
import { useSocket } from "@/state/SocketContext";
import { useGroupState } from "@/state/GroupStateContext";
import { useLoggedUser } from "@/state/LoggedUserContext";
import Image from "next/image";
import cn from "classnames";
import { getLoggedUserState } from "@/utils/localStorage";

const MainSelector = ({ userId }: { userId: string }) => {
  const { socket } = useSocket();
  const { loggedUser } = useLoggedUser();
  const { groupState, dispatch: dispatchGroupState } = useGroupState();

  const isCurrentUser = userId === loggedUser?.id;
  const loggedUserState = (groupState as GroupState)[userId];
  const currentUserState = (groupState as GroupState)[userId]
    ?.restaurants as SelectedRestaurant[];
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (!isCurrentUser) return;
    if (!loggedUser?.foodieGroupId) {
      // local storage while not in a group
      if (isFirstRender) {
        setIsFirstRender(false);

        const localStorageUserState = getLoggedUserState();
        if (!localStorageUserState) return;

        dispatchGroupState({
          type: "overwrite",
          overwriteState: { [loggedUser?.id]: getLoggedUserState() },
        });
      }
    } else {
      if (isFirstRender) {
        setIsFirstRender(false);
        socket.emit("user:first:render", loggedUser?.foodieGroupId as string);
        return;
      }

      console.log("fired emit user:state:updated", [
        userId,
        loggedUser.foodieGroupId,
        loggedUserState,
      ]);

      console.log({ loggedUserState });
      socket.emit(
        "user:state:updated",
        userId,
        loggedUser.foodieGroupId as string,
        loggedUserState
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUserState]);

  return (
    <div className="flex flex-col">
      {currentUserState.map((restaurant, restaurantIndex) => (
        <div
          className="border-2 bg-yellow-500 border-transparent m-1 rounded-lg relative"
          key={restaurantIndex}
        >
          {isCurrentUser && (
            <div className="absolute top-0 right-1">
              <button
                className="text-red-600"
                onClick={() =>
                  dispatchGroupState({
                    type: "restaurant:remove",
                    restaurantIndex,
                    userId,
                  })
                }
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex justify-start gap-5 ml-2 items-center ">
            {isCurrentUser && (
              <button
                className="text-black"
                onClick={() =>
                  dispatchGroupState({
                    type: "restaurant:change",
                    delta: -1,
                    restaurantIndex,
                    userId,
                  })
                }
              >
                ⮜
              </button>
            )}
            <div className="text-black">
              {currentUserState[restaurantIndex]?.name}
            </div>
            {isCurrentUser && (
              <button
                className="text-black"
                onClick={() =>
                  dispatchGroupState({
                    type: "restaurant:change",
                    delta: 1,
                    restaurantIndex,
                    userId,
                  })
                }
              >
                ⮞
              </button>
            )}
          </div>
          <div className="flex flex-col">
            {restaurant.items.map(
              (food, foodItemIndex: number, foodItemsArr) => (
                <div
                  key={foodItemIndex}
                  className={`relative bg-black rounded-lg my-2 ${
                    // make collapsing margin
                    foodItemIndex < foodItemsArr.length - 1 && "-mb-1"
                  }`}
                >
                  {isCurrentUser && (
                    <div className="absolute top-0 right-1">
                      <button
                        className="text-red-600 z-10"
                        onClick={() =>
                          dispatchGroupState({
                            type: "food:remove",
                            foodItemIndex,
                            restaurantIndex,
                            userId,
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex justify-start gap-4 ml-2 mt-2">
                    {isCurrentUser && (
                      <button
                        className="z-10 text-yellow-500"
                        onClick={() => {
                          dispatchGroupState({
                            type: "food:change",
                            delta: -1,
                            foodItemIndex,
                            restaurantIndex,
                            userId,
                          });
                        }}
                      >
                        ⮜
                      </button>
                    )}
                    <div className="w-64">
                      <div className="h-32 w-64 relative rounded-xl overflow-hidden">
                        <Image
                          className={cn(
                            "duration-700 ease-in-out",
                            food.isImageLoading
                              ? "grayscale blur-2xl scale-110"
                              : "grayscale-0 blur-0 scale-100"
                          )}
                          src={food.imageProps.src}
                          priority={true}
                          alt={`Photo of ${food.name} dish`}
                          layout="fill"
                          objectFit="cover"
                          onLoadingComplete={() =>
                            dispatchGroupState({
                              type: "food:image-loading-done",
                              restaurantIndex,
                              foodItemIndex,
                              userId,
                            })
                          }
                        />
                      </div>
                    </div>
                    {isCurrentUser && (
                      <button
                        className="z-10 text-yellow-500"
                        onClick={() => {
                          dispatchGroupState({
                            type: "food:change",
                            delta: 1,
                            foodItemIndex,
                            restaurantIndex,
                            userId,
                          });
                        }}
                      >
                        ⮞
                      </button>
                    )}
                    <div className="mx-4"></div>
                  </div>

                  <div className="ml-10 w-64 mt-2">
                    <p className="break-words">{food.name}</p>
                    <p>${food.price}</p>
                  </div>
                </div>
              )
            )}
            {isCurrentUser && (
              <button
                className="rounded-lg bg-black text-yellow-500 p-1 text-center"
                onClick={() =>
                  dispatchGroupState({
                    type: "food:add",
                    restaurantIndex,
                    userId,
                  })
                }
              >
                Add Food
              </button>
            )}
          </div>
        </div>
      ))}
      {isCurrentUser && (
        <button
          className="rounded-lg bg-black text-yellow-500 p-1 text-center mt-2"
          onClick={() =>
            dispatchGroupState({
              type: "restaurant:add",
              userId,
            })
          }
        >
          Add Restaurant
        </button>
      )}
    </div>
  );
};

export default MainSelector;
export type { SelectedRestaurant };
