export type FoodItem = {
  name: string;
  price: number;
};

export type Restaurant = {
  name: string;
  items: FoodItem[];
};

export type SelectedFoodItem = {
  originalIndex: number;
} & FoodItem;

export type SelectedRestaurant = {
  name: string;
  items: SelectedFoodItem[];
  originalIndex: number;
};

export type GroupUserState = {
  isInviteAccepted: boolean;
  restaurants: SelectedRestaurant[];
};
