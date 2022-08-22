import { setLoggedUserState } from "@/utils/localStorage";
import { trpc } from "@/utils/trpc";
import {
  GroupUserState,
  GroupState,
  SelectedRestaurant,
  FoodItem,
  SelectedFoodItem,
  Restaurant,
} from "@/utils/types";
import { User } from "next-auth";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
  useState,
  useEffect,
} from "react";
import { useLoggedUser } from "./LoggedUserContext";

const GroupStateContext = createContext<{
  groupState: GroupState | null;
  dispatch: Dispatch<GroupStateReducerAction>;
}>({
  groupState: null,
  dispatch: () => {},
});

export function GroupStateProvider({ children }: { children: ReactNode }) {
  const { loggedUser } = useLoggedUser() as { loggedUser: User };
  const [restaurantMeals, setRestaurantMeals] = useState([] as Restaurant[]);
  const [groupState, dispatch] = useReducer(
    makeGroupStateReducer({ restaurants: restaurantMeals, loggedUser }),
    null
  );

  const { data } = trpc.useQuery(["food.getRestaurantMeals"], {
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data) return;
    console.log({ mealsData: data });
    setRestaurantMeals(data);
  }, [data]);

  return (
    <GroupStateContext.Provider value={{ groupState, dispatch }}>
      {children}
    </GroupStateContext.Provider>
  );
}

type GroupStateReducerAction =
  | ({
      userId: string;
    } & (
      | {
          type: "restaurant:add";
        }
      | {
          type: "restaurant:remove";
          restaurantIndex: number;
        }
      | {
          type: "restaurant:change";
          restaurantIndex: number;
          delta: 1 | -1;
        }
      | {
          type: "food:add";
          restaurantIndex: number;
        }
      | {
          type: "food:remove";
          restaurantIndex: number;
          foodItemIndex: number;
        }
      | {
          type: "food:change";
          restaurantIndex: number;
          foodItemIndex: number;
          delta: 1 | -1;
        }
      | {
          type: "food:image-loading-done";
          restaurantIndex: number;
          foodItemIndex: number;
        }
    ))
  | {
      type: "overwrite";
      overwriteState: GroupState;
    };

const makeGroupStateReducer =
  ({
    restaurants,
    loggedUser,
  }: {
    restaurants: Restaurant[];
    loggedUser: User;
  }) =>
  (groupState: GroupState | null, action: GroupStateReducerAction) => {
    console.log("group state dispatch", action);

    if (!groupState) {
      if (action.type === "overwrite") {
        return action.overwriteState;
      }

      return null;
    }

    if (action.type === "overwrite") {
      return action.overwriteState;
    }

    const { userId, type } = action;
    const currentUserState = groupState[userId]
      ?.restaurants as SelectedRestaurant[];

    let result: GroupState;
    switch (type) {
      case "restaurant:add": {
        if (currentUserState.length === restaurants.length) return groupState;

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: [
              ...currentUserState,
              {
                name: restaurants[currentUserState.length]?.name as string,
                items: [
                  {
                    ...(restaurants[currentUserState.length]
                      ?.items[0] as FoodItem),
                    originalIndex: 0,
                    isImageLoading: true,
                  },
                ],
                originalIndex: currentUserState.length,
              },
            ],
          },
        };
        break;
      }

      case "restaurant:remove": {
        const { restaurantIndex } = action;
        if (
          restaurantIndex < 0 ||
          restaurantIndex > currentUserState.length - 1
        )
          return groupState;

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState?.filter(
              (_, id) => id !== restaurantIndex
            ),
          },
        };
        break;
      }

      case "restaurant:change": {
        const { restaurantIndex, delta } = action;

        let rawNewIndex =
          (currentUserState[restaurantIndex]?.originalIndex as number) + delta;
        if (rawNewIndex < 0) rawNewIndex = restaurants.length - 1;
        if (rawNewIndex === restaurants.length) rawNewIndex = 0;

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState?.map((restaurant, id) => {
              if (id !== restaurantIndex) return restaurant;
              return {
                name: restaurants[rawNewIndex]?.name as string,
                items: [
                  {
                    ...restaurants[rawNewIndex]?.items[0],
                    originalIndex: 0,
                    isImageLoading: true,
                  } as SelectedFoodItem,
                ],
                originalIndex: rawNewIndex,
              };
            }),
          },
        };
        break;
      }

      case "food:add": {
        const { restaurantIndex } = action;

        const originalRestaurantIndex = (
          currentUserState[restaurantIndex] as SelectedRestaurant
        ).originalIndex;

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState.map((restaurant, id) => {
              if (id !== restaurantIndex) return restaurant;
              return {
                ...restaurant,
                items: [
                  ...restaurant.items,
                  {
                    ...restaurants[originalRestaurantIndex]?.items[0],
                    originalIndex: 0,
                  } as SelectedFoodItem,
                ],
              };
            }),
          },
        };
        break;
      }

      case "food:remove": {
        const { restaurantIndex, foodItemIndex } = action;

        // if we remove last item from restaurant, remove restaurant all together
        if (
          currentUserState[restaurantIndex]?.items.length === 1 &&
          foodItemIndex === 0
        ) {
          result = {
            ...groupState,
            [userId]: {
              ...(groupState[userId] as GroupUserState),
              restaurants: currentUserState.filter((_, id) => {
                if (id === restaurantIndex) return false;
                return true;
              }),
            },
          };
          break;
        }

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState.map((restaurant, id) => {
              if (id !== restaurantIndex) return restaurant;
              return {
                ...restaurant,
                items: restaurant.items.filter((_, id) => id !== foodItemIndex),
              };
            }),
          },
        };
        break;
      }

      case "food:change": {
        const { restaurantIndex, foodItemIndex, delta } = action;

        let rawNewFoodItemIndex =
          ((currentUserState[restaurantIndex] as SelectedRestaurant).items[
            foodItemIndex
          ]?.originalIndex as number) + delta;

        const originalRestaurantIndex = (
          currentUserState[restaurantIndex] as SelectedRestaurant
        ).originalIndex;
        const originalRestaurantItems =
          restaurants[originalRestaurantIndex]?.items;

        if (rawNewFoodItemIndex < 0)
          rawNewFoodItemIndex = (originalRestaurantItems?.length as number) - 1;
        if (rawNewFoodItemIndex === originalRestaurantItems?.length)
          rawNewFoodItemIndex = 0;

        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState?.map((restaurant, id) => {
              if (id !== restaurantIndex) return restaurant;
              return {
                ...restaurant,
                items: restaurant.items.map((item, id) => {
                  if (id !== foodItemIndex) return item;
                  return {
                    ...restaurants[originalRestaurantIndex]?.items[
                      rawNewFoodItemIndex
                    ],
                    originalIndex: rawNewFoodItemIndex,
                    isImageLoading: true,
                  } as SelectedFoodItem;
                }),
              };
            }),
          },
        };
        break;
      }

      case "food:image-loading-done": {
        const { restaurantIndex, foodItemIndex } = action;
        result = {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState?.map((restaurant, id) => {
              if (id !== restaurantIndex) return restaurant;
              return {
                ...restaurant,
                items: restaurant.items.map((item, id) => {
                  if (id !== foodItemIndex) return item;
                  return {
                    ...item,
                    isImageLoading: false,
                  };
                }),
              };
            }),
          },
        };
        break;
      }

      default:
        console.error(`Action object ${action} unknown`);
        return groupState;
    }

    if (loggedUser?.id === userId) {
      setLoggedUserState(result[userId] as GroupUserState);
    }

    return result;
  };

export function useGroupState() {
  return useContext(GroupStateContext);
}
