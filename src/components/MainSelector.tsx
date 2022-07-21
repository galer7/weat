import { useState } from "react";
import RestaurantSelector from "./RestaurantSelector";

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

const MainSelector = ({ restaurants }: { restaurants: Restaurant[] }) => {
  // TODO: use a Proxy on the restaurants array so that we can
  // better determine next available restaurants and/or item for a restaurant
  const [state, setState] = useState<SelectedRestaurant[]>([]);

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
    let rawNewIndex = index + delta;
    if (rawNewIndex < 0) rawNewIndex = state.length - 1;
    if (rawNewIndex === state.length) rawNewIndex = 0;

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
    if (rawNewFoodItemIndex < 0) rawNewFoodItemIndex = state.length - 1;
    if (rawNewFoodItemIndex === state.length) rawNewFoodItemIndex = 0;

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
      {state.map((restaurant, index) => (
        <RestaurantSelector
          key={index}
          index={index}
          state={state}
          removeRestaurant={removeRestaurant}
          changeRestaurant={changeRestaurant}
          addFoodItem={addFoodItem}
          removeFoodItem={removeFoodItem}
          changeFoodItem={changeFoodItem}
        />
      ))}
      <button
        className="rounded-full bg-black text-white w-8 h-8"
        onClick={() => addRestaurant()}
      >
        + Restaurant
      </button>
    </div>
  );
};

export default MainSelector;
