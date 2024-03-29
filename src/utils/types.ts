export type FoodItem = {
  name: string;
  price: string;
  imageProps: {
    src: string;
    blurDataURL: string;
  };
};

export type Restaurant = {
  name: string;
  items: FoodItem[];
};

export type SelectedFoodItem = {
  originalIndex: number;
  name: string;
  price: string;
  imageProps: {
    src: string;
    blurDataURL: string;
  };
  isImageLoading: boolean;
};

export type SelectedRestaurant = {
  name: string;
  items: SelectedFoodItem[];
  originalIndex: number;
};

export type GroupUserState = {
  name: string;
  image: string;
  isInviteAccepted: boolean;
  restaurants: SelectedRestaurant[];
};

export type GroupState = Record<string, GroupUserState>;

export type MealAPIResponse = {
  meals: { idMeal: string; strMeal: string; strMealThumb: string }[];
};

export type ServerToClientEvents = {
  "server:first:render": (stringifiedState: string) => void;
  "server:invite:sent": (
    from: { id: string; name: string },
    foodieGroupId: string
  ) => void;
  "server:state:updated": (stringifiedState: string, name: string) => void;
};

export type ClientToServerEvents = {
  "user:first:render": (foodieGroupId: string) => void;
  "user:invite:sent": (
    from: { id: string; name: string },
    to: string,
    foodieGroupId: string,
    fromUserState: GroupUserState
  ) => void;
  "user:invite:response": (
    from: string,
    to: string,
    foodieGroupId?: GroupUserState
  ) => void;
  "user:state:updated": (
    name: string,
    foodieGroupId: string,
    userState?: GroupUserState
  ) => void;
};
