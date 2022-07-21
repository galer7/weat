import React from "react";

const FoodSelector = ({ index, setState, state }) => {
  return (
    <div className="inline">
      <button>{"<"}</button>
      <div></div>
      <button>{">"}</button>
    </div>
  );
};

export default FoodSelector;
