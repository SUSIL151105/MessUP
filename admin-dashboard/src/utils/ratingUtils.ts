import type { MealRating } from '../types/models';

export const getEffectiveRating = (r: MealRating): number => {
  if (r.ratings?.overall && r.ratings.overall > 0) {
    return r.ratings.overall;
  }
  if (r.ratings) {
    const values = [r.ratings.taste, r.ratings.quality, r.ratings.hygiene, r.ratings.portion].filter(
      (v): v is number => typeof v === 'number' && v > 0
    );
    if (values.length > 0) {
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
  }
  return 0;
};
