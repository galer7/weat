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
  state: GroupState;
  dispatch: Dispatch<GroupStateReducerAction>;
}>({
  state: {},
  dispatch: () => {},
});

export function GroupStateProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: GroupState;
}) {
  const [groupState, dispatch] = useReducer(groupStateReducer, initialState);

  return (
    <GroupStateContext.Provider value={groupState}>
      <GroupStateDispatchContext.Provider value={dispatch}>
        {children}
      </GroupStateDispatchContext.Provider>
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

type GroupStateReducerAction = {
  name: string;
  type:
    | "restaurant:add"
    | "restaurant:remove"
    | "restaurant:change"
    | "food:add"
    | "food:remove"
    | "food:change"
    | "overwrite";
  restaurantIndex: number;
  foodItemIndex: number;
  delta: 1 | -1;
  overwriteState: GroupUserState;
};

const groupStateReducer = (
  groupState: GroupState,
  action: GroupStateReducerAction
) => {
  const { name, type, restaurantIndex, foodItemIndex, delta, overwriteState } =
    action;
  const currentUserState = groupState[name]
    ?.restaurants as SelectedRestaurant[];

  switch (type) {
    case "restaurant:add": {
      if (currentUserState.length === restaurants.length) return;

      return {
        ...groupState,
        [name]: {
          ...(groupState[name] as GroupUserState),
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
      if (restaurantIndex < 0 || restaurantIndex > currentUserState.length - 1)
        return;
      return {
        ...groupState,
        [name]: {
          ...(groupState[name] as GroupUserState),
          restaurants: currentUserState?.filter(
            (_, id) => id !== restaurantIndex
          ),
        },
      };
    }
    case "restaurant:change": {
      let rawNewIndex =
        (currentUserState[restaurantIndex]?.originalIndex as number) + delta;
      if (rawNewIndex < 0) rawNewIndex = restaurants.length - 1;
      if (rawNewIndex === restaurants.length) rawNewIndex = 0;

      return {
        ...groupState,
        [name]: {
          ...(groupState[name] as GroupUserState),
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
      const originalRestaurantIndex = (
        currentUserState[restaurantIndex] as SelectedRestaurant
      ).originalIndex;

      return {
        ...groupState,
        [name]: {
          ...(groupState[name] as GroupUserState),
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
      return {
        ...groupState,
        [name]: {
          ...(groupState[name] as GroupUserState),
          restaurants: currentUserState?.map((restaurant, id) => {
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
        [name]: {
          ...(groupState[name] as GroupUserState),
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

    case "overwrite": {
      return overwriteState;
    }
  }
};

export function useGroupState() {
  return useContext(GroupStateContext);
}

export function useGroupStateDispatch() {
  return useContext(GroupStateDispatchContext);
}
