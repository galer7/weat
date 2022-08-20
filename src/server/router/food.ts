import { MealAPIResponse } from "@/utils/types";
import { createRouter } from "./context";

const NR_RESTAURANTS = 5;
const NR_MEALS_PER_RESTAURANT = 4;

export const foodRouter = createRouter().query("getRestaurantMeals", {
  async resolve() {
    console.log("!!!!!!!!! fetched meals api");

    const result = await Promise.all(
      Array.from({ length: NR_RESTAURANTS }, () =>
        Promise.all(
          Array.from(
            { length: NR_MEALS_PER_RESTAURANT },
            () =>
              fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(
                (res) => res.json()
              ) as Promise<MealAPIResponse>
          )
        )
      )
    );
    return result;
  },
});
