import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";

const Food: NextPage = ({ foodList, groupSize = 1 }) => {
  useEffect(() => {
    // Update the document title using the browser API
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
    });
  }, []);

  return (
    <div>
      {Array.from({ length: groupSize }, (v, i) => i).map((index) => (
        <div key={index}></div>
      ))}
    </div>
  );
};

export default Food;
