import { FoodItem, MealAPIResponse, Restaurant } from "@/utils/types";
import { createRouter } from "./context";
import memoryCache from "memory-cache";
import { getPlaiceholder } from "plaiceholder";

memoryCache.clear();
const NR_RESTAURANTS = 5;
const NR_MEALS_PER_RESTAURANT = 4;
const CACHED_MEALS_KEY = "cached-restaurant-meals";

export const foodRouter = createRouter().query("getRestaurantMeals", {
  async resolve() {
    const cachedData = memoryCache.get(CACHED_MEALS_KEY) as Restaurant[];
    if (cachedData) {
      console.log("found cache in meals");
      return cachedData;
    }

    const result = (await Promise.all(
      Array.from({ length: NR_RESTAURANTS }, (_, k) =>
        Promise.all(
          Array.from({ length: NR_MEALS_PER_RESTAURANT }, () =>
            fetch("https://www.themealdb.com/api/json/v1/1/random.php")
              .then(async (res) => {
                return res.json() as Promise<MealAPIResponse>;
              })
              .then(({ meals }) => {
                const [meal] = meals;
                return {
                  name: meal?.strMeal,
                  image: meal?.strMealThumb,
                  price: (Math.random() * 100).toFixed(2),
                };
              })
              .then(async ({ image, ...data }) => {
                const { img, base64 } = await getPlaiceholder(image as string);

                return {
                  ...data,
                  imageProps: {
                    src: img.src,
                    blurDataURL: base64,
                  },
                } as FoodItem;
              })
          )
        ).then((items) => {
          return {
            name: `Restaurant ${k + 1}`,
            items,
          };
        })
      )
    )) as Restaurant[];

    memoryCache.put(CACHED_MEALS_KEY, result);
    return result;
  },
});
