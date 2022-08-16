import { useEffect, useState } from "react";
import type { GroupState, SelectedRestaurant } from "@/utils/types";
import { useSocket } from "@/state/SocketContext";
import { useGroupState } from "@/state/GroupStateContext";
import { useLoggedUser } from "@/state/LoggedUserContext";

const MainSelector = ({ name }: { name: string }) => {
  const { socket } = useSocket();
  const { loggedUser } = useLoggedUser();
  const { groupState, dispatch } = useGroupState();

  const loggedName = loggedUser?.name;
  const isCurrentUser = name === loggedName;
  const loggedUserState = (groupState as GroupState)[loggedName as string];
  const currentUserState = (groupState as GroupState)[name]
    ?.restaurants as SelectedRestaurant[];
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (!isCurrentUser) return;
    if (!loggedUser?.foodieGroupId) {
      // local storage while not in a group
      if (isFirstRender) {
        setIsFirstRender(false);

        // TODO: local storage stuff
      }
    } else {
      if (isFirstRender) {
        setIsFirstRender(false);
        socket.emit("user:first:render", loggedUser?.foodieGroupId as string);
        return;
      }

      console.log("fired emit user:state:updated", [
        loggedName,
        loggedUser.foodieGroupId,
        loggedUserState,
      ]);

      console.log({ loggedUserState });
      socket.emit(
        "user:state:updated",
        loggedName,
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
                  dispatch({ type: "restaurant:remove", restaurantIndex, name })
                }
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex justify-start gap-5 ml-2">
            {isCurrentUser && (
              <button
                className="text-black"
                onClick={() =>
                  dispatch({
                    type: "restaurant:change",
                    delta: -1,
                    restaurantIndex,
                    name,
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
                  dispatch({
                    type: "restaurant:change",
                    delta: 1,
                    restaurantIndex,
                    name,
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
                        className="text-red-600"
                        onClick={() =>
                          dispatch({
                            type: "food:remove",
                            foodItemIndex,
                            restaurantIndex,
                            name,
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex justify-start gap-4 ml-2">
                    {isCurrentUser && (
                      <button
                        onClick={() =>
                          dispatch({
                            type: "food:change",
                            delta: -1,
                            foodItemIndex,
                            restaurantIndex,
                            name,
                          })
                        }
                      >
                        ⮜
                      </button>
                    )}
                    <div>
                      <p>{food.name}</p>
                      <p>${food.price.toFixed(2)}</p>
                    </div>
                    {isCurrentUser && (
                      <button
                        onClick={() =>
                          dispatch({
                            type: "food:change",
                            delta: 1,
                            foodItemIndex,
                            restaurantIndex,
                            name,
                          })
                        }
                      >
                        ⮞
                      </button>
                    )}
                    <div className="mx-4"></div>
                  </div>
                </div>
              )
            )}
            {isCurrentUser && (
              <button
                className="rounded-lg bg-black text-yellow-500 p-1 text-center"
                onClick={() =>
                  dispatch({
                    type: "food:add",
                    restaurantIndex,
                    name,
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
            dispatch({
              type: "restaurant:add",
              name,
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
