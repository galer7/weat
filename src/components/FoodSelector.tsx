import React from "react";

const FoodSelector = ({
  index,
  restaurantIndex,
  removeFoodItem,
  changeFoodItem,
}) => {
  return (
    <div className="inline">
      <button onClick={() => changeFoodItem(restaurantIndex, index, -1)}>
        {"<"}
      </button>
      <div></div>
      <button onClick={() => changeFoodItem(restaurantIndex, index, 1)}>
        {">"}
      </button>
      <button onClick={() => removeFoodItem(restaurantIndex, index)}>
        - Food
      </button>
    </div>
  );
};

export default FoodSelector;
