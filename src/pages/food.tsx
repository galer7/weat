import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const Food: NextPage = () => {
  useEffect(() => {
    // Update the document title using the browser API
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
    });
  }, []);

  const makeFoodCarousel = (key: number) => <div key={key}>food selector</div>;
  const [foodSelectors, setFoodSelectors] = useState([makeFoodCarousel(0)]);

  const users = [
    { name: "you" },
    {
      name: "your friend",
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="bg-black w-full flex justify-between">
        <div className="text-white p-8 px-10 text-xl font-bold">WEAT</div>
        <div className="text-white p-8 px-10 text-xl font-bold">
          <Link href={"/"}>
            <a>INVITE</a>
          </Link>
        </div>
      </div>

      {/* FLEX WITH YOUR FRIENDS */}
      <div className="flex gap-2 justify-evenly">
        {users.map(({ name }, index) => (
          <div
            className={`m-8 ${name === "you" && "border-red-600 border-2"}`}
            key={index}
          >
            <div className="m-4">{name}</div>
            <div>restaurant selector</div>
            {foodSelectors.map((elem, index) => {
              if (index > 0 && name === "you") {
                return (
                  <div className="flex justify-center" key={index}>
                    {elem}
                    <button
                      className="rounded-full bg-black text-white w-8 h-8"
                      onClick={() => {
                        const temp = foodSelectors.slice(0, -1);
                        setFoodSelectors(temp);
                      }}
                    >
                      -
                    </button>
                  </div>
                );
              }
              return elem;
            })}
            {name === "you" && (
              <button
                className="rounded-full bg-black text-white w-8 h-8"
                onClick={() =>
                  setFoodSelectors([
                    ...foodSelectors,
                    makeFoodCarousel(foodSelectors.length),
                  ])
                }
              >
                +
              </button>
            )}
            <hr className="bg-black h-1" />
            <div>total: </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Food;
