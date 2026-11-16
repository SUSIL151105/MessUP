import type { DishItem, MealType } from '../types/models';

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
};

export const getDefaultDishesForMeal = (date: string, mealType: MealType): DishItem[] => {
  const tomorrow = getTomorrowDateString();
  const isTomorrow = date === tomorrow;

  if (isTomorrow) {
    switch (mealType) {
      case 'BREAKFAST':
        return [
          { id: 'D_TOM_B1', name: 'Onion Tomato Uttapam with Coconut Chutney', description: 'Thick rice pancake topped with onions, tomatoes & herbs', isVeg: true, isAvailable: true },
          { id: 'D_TOM_B2', name: 'Fluffy Poori with Spiced Aloo Bhaji', description: 'Deep fried puffed bread served with potato curry', isVeg: true, isAvailable: true },
          { id: 'D_TOM_B3', name: 'Boiled Eggs / Scrambled Eggs', description: 'Fresh farm eggs served hot', isVeg: false, containsEgg: true, isAvailable: true },
          { id: 'D_TOM_B4', name: 'South Indian Filter Coffee & Tea', description: 'Traditional brewed coffee & fresh milk', isVeg: true, isAvailable: true }
        ];
      case 'LUNCH':
        return [
          { id: 'D_TOM_L1', name: 'Cumin Jeera Rice & Punjabi Rajma Masala', description: 'Fragrant jeera rice with slow cooked kidney bean gravy', isVeg: true, isAvailable: true },
          { id: 'D_TOM_L2', name: 'Rich Kadhai Paneer', description: 'Cottage cheese cooked with bell peppers and ground spices', isVeg: true, isAvailable: true },
          { id: 'D_TOM_L3', name: 'Crispy Bhindi Fry & Wheat Phulka', description: 'Spiced okra fry served with hot wheat phulkas', isVeg: true, isAvailable: true },
          { id: 'D_TOM_L4', name: 'Cucumber Mint Raita & Green Salad', description: 'Chilled curd with roasted cumin and fresh salad', isVeg: true, isAvailable: true }
        ];
      case 'SNACKS':
        return [
          { id: 'D_TOM_S1', name: 'Crispy Bread Pakora & Veg Cutlet', description: 'Stuffed fried bread & spiced potato patty', isVeg: true, isAvailable: true },
          { id: 'D_TOM_S2', name: 'Hot Masala Tea & Filter Coffee', description: 'Freshly brewed hot beverages', isVeg: true, isAvailable: true }
        ];
      case 'DINNER':
        return [
          { id: 'D_TOM_D1', name: 'Butter Wheat Roti & Steamed Rice', description: 'Fresh wheat rotis brushed with butter & fluffy rice', isVeg: true, isAvailable: true },
          { id: 'D_TOM_D2', name: 'Creamy Malai Kofta / Egg Curry', description: 'Soft paneer koftas in cashew gravy or spicy egg curry', isVeg: true, containsEgg: true, isAvailable: true },
          { id: 'D_TOM_D3', name: 'Dal Makhani & Seasonal Subzi', description: 'Slow cooked black lentils with cream & mixed veg', isVeg: true, isAvailable: true },
          { id: 'D_TOM_D4', name: 'Sweet Rasgulla Dessert', description: 'Soft spongy syrup soaked sweet dumplings', isVeg: true, isAvailable: true }
        ];
    }
  } else {
    switch (mealType) {
      case 'BREAKFAST':
        return [
          { id: 'D_TOD_B1', name: 'Masala Dosa with Sambar & Coconut Chutney', description: 'Crispy rice crêpe served with spiced potato filling & fresh chutney', isVeg: true, isAvailable: true },
          { id: 'D_TOD_B2', name: 'Steamed Idli & Medu Vada', description: 'Fluffy rice cakes & crispy lentil donuts', isVeg: true, isAvailable: true },
          { id: 'D_TOD_B3', name: 'Boiled Eggs / Omelette', description: 'Fresh farm eggs prepared to order', isVeg: false, containsEgg: true, isAvailable: true },
          { id: 'D_TOD_B4', name: 'Fresh Hot Masala Chai & Milk', description: 'Brewed cardamom tea & fresh milk', isVeg: true, isAvailable: true }
        ];
      case 'LUNCH':
        return [
          { id: 'D_TOD_L1', name: 'Steamed Basmati Rice & Dal Tadka', description: 'Long grain basmati rice served with cumin yellow dal', isVeg: true, isAvailable: true },
          { id: 'D_TOD_L2', name: 'Paneer Butter Masala', description: 'Fresh cottage cheese in creamy tomato gravy', isVeg: true, isAvailable: true },
          { id: 'D_TOD_L3', name: 'Aloo Gobi & Chapati', description: 'Spiced potato cauliflower fry with hot chapatis', isVeg: true, isAvailable: true },
          { id: 'D_TOD_L4', name: 'Fresh Green Salad & Sweet Curd', description: 'Cucumber, carrots, tomatoes & thick curd', isVeg: true, isAvailable: true }
        ];
      case 'SNACKS':
        return [
          { id: 'D_TOD_S1', name: 'Crispy Hot Vegetable Samosa', description: 'Golden fried pastry filled with spiced potatoes & peas', isVeg: true, isAvailable: true },
          { id: 'D_TOD_S2', name: 'Hot Ginger Tea & Coffee', description: 'Freshly brewed hot beverages', isVeg: true, isAvailable: true }
        ];
      case 'DINNER':
        return [
          { id: 'D_TOD_D1', name: 'Hot Butter Chapati & Rice', description: 'Fresh wheat chapatis served with steamed rice', isVeg: true, isAvailable: true },
          { id: 'D_TOD_D2', name: 'Kadhai Paneer / Egg Curry', description: 'Paneer cubes or boiled egg in rich bell pepper gravy', isVeg: true, containsEgg: true, isAvailable: true },
          { id: 'D_TOD_D3', name: 'Yellow Dal Fry & Mix Veg', description: 'Tempered yellow lentils with seasonal mixed vegetables', isVeg: true, isAvailable: true },
          { id: 'D_TOD_D4', name: 'Gulab Jamun Dessert', description: 'Warm milk solid dumplings in sugar syrup', isVeg: true, isAvailable: true }
        ];
    }
  }
};
