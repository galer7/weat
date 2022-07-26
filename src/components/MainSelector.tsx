import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type FoodItem = {
  name: string;
  price: number;
};

type Restaurant = {
  name: string;
  items: FoodItem[];
};

type SelectedFoodItem = {
  originalIndex: number;
} & FoodItem;

type SelectedRestaurant = {
  name: string;
  items: SelectedFoodItem[];
  originalIndex: number;
};

const MainSelector = ({
  restaurants,
  name,
  loggedInUser,
  groupState,
  setGroupState,
  socket,
}: {
  restaurants: Restaurant[];
  name: string;
  loggedInUser: User;
  groupState: Record<string, SelectedRestaurant[]>;
  setGroupState: any;
  socket: Socket;
}) => {
  // TODO: use a Proxy on the restaurants array so that we can
  // better determine next available restaurants and/or item for a restaurant
  const loggedInName = loggedInUser.name;
  const isCurrentUser = name === loggedInName;
  const loggedInUserState = groupState[loggedInName];
  const currentUserState = groupState[name] as SelectedRestaurant[];
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (!isCurrentUser) return;
    if (isFirstRender) {
      socket.emit("user:first:render", loggedInUser.foodieGroupId);
      setIsFirstRender(false);
      return;
    }

    console.log("fired emit user:state:updated", [
      loggedInName,
      loggedInUser.foodieGroupId,
      loggedInUserState,
    ]);
    socket.emit(
      "user:state:updated",
      loggedInName,
      loggedInUser.foodieGroupId,
      loggedInUserState
    );
  }, [loggedInUserState]);

  const addRestaurant = () => {
    if (currentUserState.length === restaurants.length) return;

    setGroupState({
      ...groupState,
      [name]: [
        ...currentUserState,
        {
          name: restaurants[currentUserState.length]?.name,
          items: [
            {
              ...restaurants[currentUserState.length]?.items[0],
              originalIndex: 0,
            },
          ],
          originalIndex: currentUserState.length,
        },
      ],
    });
  };

  const removeRestaurant = (index: number) => {
    if (index < 0 || index > currentUserState.length - 1) return;
    setGroupState({
      ...groupState,
      [name]: currentUserState?.filter((_, id) => id !== index),
    });
  };

  const changeRestaurant = (index: number, delta: -1 | 1) => {
    let rawNewIndex =
      (currentUserState[index]?.originalIndex as number) + delta;
    if (rawNewIndex < 0) rawNewIndex = restaurants.length - 1;
    if (rawNewIndex === restaurants.length) rawNewIndex = 0;

    setGroupState({
      ...groupState,
      [name]: currentUserState?.map((restaurant, id) => {
        if (id !== index) return restaurant;
        return {
          name: restaurants[rawNewIndex]?.name as string,
          items: [
            {
              ...restaurants[rawNewIndex]?.items[0],
              originalIndex: 0,
            } as SelectedFoodItem,
          ],
          originalIndex: rawNewIndex,
        };
      }),
    });
  };

  const addFoodItem = (restaurantIndex: number) => {
    setGroupState({
      ...groupState,
      [name]: [
        ...currentUserState,
        {
          ...currentUserState[restaurantIndex],
          items: [
            ...(currentUserState[restaurantIndex] as SelectedRestaurant).items,
            {
              ...restaurants[restaurantIndex]?.items[0],
              originalIndex: 0,
            } as SelectedFoodItem,
          ],
        },
      ],
    });
  };

  const removeFoodItem = (restaurantIndex: number, foodItemIndex: number) => {
    setGroupState({
      ...groupState,
      [name]: currentUserState?.map((restaurant, id) => {
        if (id !== restaurantIndex) return restaurant;
        return {
          ...restaurant,
          items: restaurant.items.filter((_, id) => id !== foodItemIndex),
        };
      }),
    });
  };

  const changeFoodItem = (
    restaurantIndex: number,
    foodItemIndex: number,
    delta: -1 | 1
  ) => {
    let rawNewFoodItemIndex =
      ((currentUserState[restaurantIndex] as SelectedRestaurant).items[
        foodItemIndex
      ]?.originalIndex as number) + delta;

    const originalRestaurantIndex = (
      currentUserState[restaurantIndex] as SelectedRestaurant
    ).originalIndex;
    const originalRestaurantItems = restaurants[originalRestaurantIndex]?.items;

    if (rawNewFoodItemIndex < 0)
      rawNewFoodItemIndex = (originalRestaurantItems?.length as number) - 1;
    if (rawNewFoodItemIndex === originalRestaurantItems?.length)
      rawNewFoodItemIndex = 0;

    setGroupState({
      ...groupState,
      [name]: currentUserState?.map((restaurant, id) => {
        if (id !== restaurantIndex) return restaurant;
        return {
          ...restaurant,
          items: restaurant.items.map((item, id) => {
            if (id !== foodItemIndex) return item;
            return {
              ...restaurants[originalRestaurantIndex]?.items[
                rawNewFoodItemIndex
              ],
              originalIndex: rawNewFoodItemIndex,
            } as SelectedFoodItem;
          }),
        };
      }),
    });
  };

  return (
    <div>
      <div>Pick your food!</div>
      {currentUserState.map((restaurant, restaurantIndex) => (
        <div className="border-2 border-yellow-500" key={restaurantIndex}>
          <div>{currentUserState[restaurantIndex]?.name}</div>
          <div className="inline">
            {isCurrentUser && (
              <button onClick={() => changeRestaurant(restaurantIndex, -1)}>
                {"<"}
              </button>
            )}
            {isCurrentUser && (
              <button onClick={() => changeRestaurant(restaurantIndex, 1)}>
                {">"}
              </button>
            )}
            {isCurrentUser && (
              <button onClick={() => removeRestaurant(restaurantIndex)}>
                - Restaurant {restaurant.name}
              </button>
            )}
          </div>
          {restaurant.items.map((food, foodIndex: number) => (
            <div key={foodIndex}>
              <div>
                {food.name} ${food.price.toFixed(2)}
              </div>
              <div className="inline">
                {isCurrentUser && (
                  <button
                    onClick={() =>
                      changeFoodItem(restaurantIndex, foodIndex, -1)
                    }
                  >
                    {"<"}
                  </button>
                )}
                {isCurrentUser && (
                  <button
                    onClick={() =>
                      changeFoodItem(restaurantIndex, foodIndex, 1)
                    }
                  >
                    {">"}
                  </button>
                )}
                {isCurrentUser && (
                  <button
                    onClick={() => removeFoodItem(restaurantIndex, foodIndex)}
                  >
                    - Food {food.name}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isCurrentUser && (
            <button onClick={() => addFoodItem(restaurantIndex)}>+ Food</button>
          )}
        </div>
      ))}
      {isCurrentUser && (
        <button
          className="rounded-md bg-black text-blue-600 p-2 h-8 text-center"
          onClick={() => addRestaurant()}
        >
          + Restaurant
        </button>
      )}
    </div>
  );
};

export default MainSelector;
export type { SelectedRestaurant };
