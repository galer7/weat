import { useState } from "react";

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
  currentName,
}: {
  restaurants: Restaurant[];
  name: string;
  currentName: string;
}) => {
  // TODO: use a Proxy on the restaurants array so that we can
  // better determine next available restaurants and/or item for a restaurant
  const [state, setState] = useState<SelectedRestaurant[]>([]);
  const isCurrentUser = name === currentName;

  const addRestaurant = () => {
    if (state.length === restaurants.length) return;

    setState([
      ...state,
      {
        name: restaurants[state.length]?.name,
        items: [restaurants[state.length]?.items[0]],
        originalIndex: state.length,
      } as SelectedRestaurant,
    ]);
  };

  const removeRestaurant = (index: number) => {
    if (index < 0 || index > state.length - 1) return;

    const tmpState = [...state];
    tmpState.splice(index, 1);
    setState(tmpState);
  };

  const changeRestaurant = (index: number, delta: -1 | 1) => {
    let rawNewIndex = (state[index]?.originalIndex as number) + delta;
    if (rawNewIndex < 0) rawNewIndex = restaurants.length - 1;
    if (rawNewIndex === restaurants.length) rawNewIndex = 0;

    const tmpState = [...state];
    tmpState.splice(index, 1, {
      name: restaurants[rawNewIndex]?.name as string,
      items: [
        {
          ...restaurants[rawNewIndex]?.items[0],
          originalIndex: 0,
        } as SelectedFoodItem,
      ],
      originalIndex: rawNewIndex,
    });

    setState(tmpState);
  };

  const addFoodItem = (restaurantIndex: number) => {
    const tmpState = [...state];
    tmpState[restaurantIndex]?.items.push({
      ...restaurants[restaurantIndex]?.items[0],
      originalIndex: 0,
    } as SelectedFoodItem);
    setState(tmpState);
  };

  const removeFoodItem = (restaurantIndex: number, foodItemIndex: number) => {
    const tmpState = [...state];
    tmpState[restaurantIndex]?.items.splice(foodItemIndex, 1);
    setState(tmpState);
  };

  const changeFoodItem = (
    restaurantIndex: number,
    foodItemIndex: number,
    delta: -1 | 1
  ) => {
    let rawNewFoodItemIndex =
      ((state[restaurantIndex] as SelectedRestaurant).items[foodItemIndex]
        ?.originalIndex as number) + delta;
    const originalRestaurantItems =
      restaurants[(state[restaurantIndex] as SelectedRestaurant).originalIndex]
        ?.items;
    if (rawNewFoodItemIndex < 0)
      rawNewFoodItemIndex = (originalRestaurantItems?.length as number) - 1;
    if (rawNewFoodItemIndex === originalRestaurantItems?.length)
      rawNewFoodItemIndex = 0;

    console.log({
      foodItemIndex,
      rawNewFoodItemIndex,
    });

    const tmpState = [...state];
    (tmpState[restaurantIndex] as SelectedRestaurant).items.splice(
      foodItemIndex,
      1,
      {
        ...restaurants[restaurantIndex]?.items[rawNewFoodItemIndex],
        originalIndex: rawNewFoodItemIndex,
      } as SelectedFoodItem
    );

    setState(tmpState);
  };

  return (
    <div>
      <div>Pick your food!</div>
      {state.map((restaurant, restaurantIndex) => (
        <div className="border-8 border-rose-500" key={restaurantIndex}>
          <div>{state[restaurantIndex]?.name}</div>
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
          {state[restaurantIndex]?.items.map((food, foodIndex: number) => (
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
