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
    <div>
      <div>Pick your food!</div>
      {currentUserState.map((restaurant, restaurantIndex) => (
        <div className="border-2 border-yellow-500" key={restaurantIndex}>
          <div>{currentUserState[restaurantIndex]?.name}</div>
          <div className="inline">
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
            {isCurrentUser && (
              <button
                onClick={() =>
                  dispatch({ type: "restaurant:remove", restaurantIndex, name })
                }
              >
                - Restaurant {restaurant.name}
              </button>
            )}
          </div>
          {restaurant.items.map((food, foodItemIndex: number) => (
            <div key={foodItemIndex}>
              <div>
                {food.name} ${food.price.toFixed(2)}
              </div>
              <div className="inline">
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
                {isCurrentUser && (
                  <button
                    onClick={() =>
                      dispatch({
                        type: "food:remove",
                        foodItemIndex,
                        restaurantIndex,
                        name,
                      })
                    }
                  >
                    - Food {food.name}
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
      ))}
      {isCurrentUser && (
        <button
          className="rounded-md bg-black text-blue-600 p-2 h-8 text-center"
          onClick={() =>
            dispatch({
              type: "restaurant:add",
              name,
            })
          }
        >
          + Restaurant
        </button>
      )}
    </div>
  );
};

export default MainSelector;
export type { SelectedRestaurant };
