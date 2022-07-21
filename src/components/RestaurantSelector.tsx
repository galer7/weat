import React from "react";
import FoodSelector from "./FoodSelector";

const RestaurantSelector = ({
  index,
  state,
  removeRestaurant,
  changeRestaurant,
  addFoodItem,
  removeFoodItem,
  changeFoodItem,
}) => {
  return (
    <div className="border-8 border-rose-500">
      <div>{state[index].name}</div>
      <div className="inline">
        <button onClick={() => changeRestaurant(index, -1)}>{"<"}</button>
        <button onClick={() => changeRestaurant(index, 1)}>{">"}</button>
        <button onClick={() => removeRestaurant(index)}>
          - Restaurant {state[index].name}
        </button>{" "}
      </div>
      {state[index].items.map((_, foodIndex: number) => (
        <FoodSelector
          key={foodIndex}
          index={foodIndex}
          restaurantIndex={index}
          removeFoodItem={removeFoodItem}
          changeFoodItem={changeFoodItem}
        />
      ))}
      <button onClick={() => addFoodItem(index)}>+ Food</button>
    </div>
  );
};

export default RestaurantSelector;
