import React, { useState } from "react";
import RestaurantSelector from "./RestaurantSelector";

type FoodItem = {
  name: string;
  price: number;
};

type Restaurant = {
  name?: string;
  items: FoodItem[];
};


type SelectedFoodItem = {
    originalIndex: number
} & FoodItem;

type SelectedRestaurant = {
    name?: string;
    items: SelectedFoodItem[];
    originalIndex: number
}


const MainSelector = ({ restaurants }: { restaurants: Restaurant[] }) => {
  // TODO: use a Proxy on the restaurants array so that we can
  // better determine next available restaurants and/or item for a restaurant
  const [state, setState] = useState<SelectedRestaurant[]>([]);

  const addRestaurant = () => {
    if (state.length === restaurants.length) return;

    setState([
      ...state,
      {
        name: restaurants[state.length],
        items: [restaurants[state.length]?.items[0]],
        originalIndex: state.length
      },
    ]);
  };

  const removeRestaurant = (index: number) => {
    if (index < 0 || index > state.length - 1) return;
    setState(state.splice(index, 1));
  };

  const changeRestaurant = (index: number, delta: -1 | 1) => {
    let rawNewIndex = index + delta;
    if (rawNewIndex < 0) rawNewIndex = state.length - 1;
    if (rawNewIndex === state.length) rawNewIndex = 0;

    setState(
      state.splice(index, 1, {
        name: restaurants[rawNewIndex]?.name,
        items: [restaurants[rawNewIndex]?.items[0]],
        originalIndex: rawNewIndex
      })
    );
  };

  const addFoodItem = (restaurantIndex: number) => {
    const tmpState = [...state];
    tmpState[restaurantIndex]?.items.push({...restaurants[rawNewIndex]?.items[0], originalIndex: 0});
    setState(tmpState);
  };

  const changeFoodItem = (
    restaurantIndex: number,
    foodItemIndex: number,
    delta: -1 | 1
  ) => {
    let rawNewFoodItemIndex = state[restaurantIndex].items[foodItemIndex]?.originalIndex + delta;
    if (rawNewFoodItemIndex < 0) rawNewFoodItemIndex = state.length - 1;
    if (rawNewFoodItemIndex === state.length) rawNewFoodItemIndex = 0;

    setState(
        state[restaurantIndex].items.splice(foodItemIndex, 1, {
            ...restaurants[restaurantIndex]?.items[rawNewFoodItemIndex],
        });
    )
  };

  return (
    <div>
      <div>Pick your food!</div>
      {state.map((restaurant, index) => (
        <RestaurantSelector
          key={index}
          index={index}
          setState={setState}
          state={state}
        />
      ))}
      <button
        className="rounded-full bg-black text-white w-8 h-8"
        onClick={() => setState([...state, restaurants[state.length]])}
      >
        + Restaurant
      </button>
    </div>
  );
};

export default MainSelector;
