import { useEffect, useState } from "react";
import { getLocalGroupState, setLocalGroupState } from "@/utils/localStorage";
import type { GroupState, SelectedRestaurant } from "@/utils/types";
import { useSocket } from "@/state/SocketContext";
import { useGroupState } from "@/state/GroupStateContext";
import { useLoggedUser } from "@/state/LoggedUserContext";

const MainSelector = ({ name }: { name: string }) => {
  const socket = useSocket();
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
        const parsedLocalStorage = getLocalGroupState();
        if (!parsedLocalStorage) return;

        dispatch({
          type: "overwrite",
          overwriteState: { [name]: parsedLocalStorage },
        });
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
          <div className="flex justify-evenly">
            {isCurrentUser && (
              <button
                onClick={() =>
                  dispatch({
                    type: "restaurant:change",
                    delta: -1,
                    restaurantIndex,
                    name,
                  })
                }
              >
                {"<"}
              </button>
            )}
            <div>{currentUserState[restaurantIndex]?.name}</div>
            {isCurrentUser && (
              <button
                onClick={() =>
                  dispatch({
                    type: "restaurant:change",
                    delta: 1,
                    restaurantIndex,
                    name,
                  })
                }
              >
                {">"}
              </button>
            )}
          </div>
          <div className="bg-black rounded-lg">
            {restaurant.items.map((food, foodItemIndex: number) => (
              <div key={foodItemIndex} className="relative">
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
                <div className="flex justify-evenly">
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
                      {"<"}
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
                      {">"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isCurrentUser && (
              <button
                onClick={() =>
                  dispatch({
                    type: "food:add",
                    restaurantIndex,
                    name,
                  })
                }
              >
                + Food
              </button>
            )}
          </div>
        </div>
      ))}
      {isCurrentUser && (
        <button
          className="rounded-lg bg-black text-yellow-200 p-1 text-center mt-2"
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
