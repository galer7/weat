import {
  GroupUserState,
  GroupState,
  SelectedRestaurant,
  FoodItem,
  SelectedFoodItem,
} from "@/utils/types";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

const GroupStateContext = createContext<{
  groupState: GroupState | null;
  dispatch: Dispatch<GroupStateReducerAction>;
}>({
  groupState: null,
  dispatch: () => {},
});

export function GroupStateProvider({ children }: { children: ReactNode }) {
  const [groupState, dispatch] = useReducer(groupStateReducer, null);

  return (
    <GroupStateContext.Provider value={{ groupState, dispatch }}>
      {children}
    </GroupStateContext.Provider>
  );
}

const restaurants = [
  {
    name: "1",
    items: [
      { name: "sushi", price: 12.12 },
      { name: "sushi2", price: 122.122 },
    ],
  },
  { name: "2", items: [{ name: "burger", price: 23.23 }] },
  { name: "3", items: [{ name: "sandwich", price: 34.34 }] },
  { name: "4", items: [{ name: "coffee", price: 45.45 }] },
];

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
    ))
  | {
      type: "overwrite";
      overwriteState: GroupState;
    };

const groupStateReducer = (
  groupState: GroupState | null,
  action: GroupStateReducerAction
) => {
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

  switch (type) {
    case "restaurant:add": {
      if (currentUserState.length === restaurants.length) return groupState;

      return {
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
                },
              ],
              originalIndex: currentUserState.length,
            },
          ],
        },
      };
    }
    case "restaurant:remove": {
      const { restaurantIndex } = action;
      if (restaurantIndex < 0 || restaurantIndex > currentUserState.length - 1)
        return groupState;

      return {
        ...groupState,
        [userId]: {
          ...(groupState[userId] as GroupUserState),
          restaurants: currentUserState?.filter(
            (_, id) => id !== restaurantIndex
          ),
        },
      };
    }
    case "restaurant:change": {
      const { restaurantIndex, delta } = action;

      let rawNewIndex =
        (currentUserState[restaurantIndex]?.originalIndex as number) + delta;
      if (rawNewIndex < 0) rawNewIndex = restaurants.length - 1;
      if (rawNewIndex === restaurants.length) rawNewIndex = 0;

      return {
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
                } as SelectedFoodItem,
              ],
              originalIndex: rawNewIndex,
            };
          }),
        },
      };
    }
    case "food:add": {
      const { restaurantIndex } = action;

      const originalRestaurantIndex = (
        currentUserState[restaurantIndex] as SelectedRestaurant
      ).originalIndex;

      return {
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
    }
    case "food:remove": {
      const { restaurantIndex, foodItemIndex } = action;

      // if we remove last item from restaurant, remove restaurant all together
      if (
        currentUserState[restaurantIndex]?.items.length === 1 &&
        foodItemIndex === 0
      )
        return {
          ...groupState,
          [userId]: {
            ...(groupState[userId] as GroupUserState),
            restaurants: currentUserState.filter((_, id) => {
              if (id === restaurantIndex) return false;
              return true;
            }),
          },
        };

      return {
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

      return {
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
                } as SelectedFoodItem;
              }),
            };
          }),
        },
      };
    }

    default:
      console.error(`Action object ${action} unknown`);
      return groupState;
  }
};

export function useGroupState() {
  return useContext(GroupStateContext);
}
