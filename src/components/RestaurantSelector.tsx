import React from "react";
import FoodSelector from "./FoodSelector";

const RestaurantSelector = ({ index, setState, state }) => {
  return (
    <div>
      <div>{state[index].name}</div>
      {state[index].items.map((foodItem, foodIndex) => (
        <FoodSelector
          key={index}
          index={foodIndex}
          setState={setState}
          state={state}
        />
      ))}
      <button
        className="rounded-full bg-black text-white w-8 h-8"
        onClick={() => {
          const tempState = [...state];
          tempState[index].push();
          setState([...state, []]);
        }}
      >
        + Food
      </button>
    </div>
  );
};

export default RestaurantSelector;
