import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import {
  prepareExercisesData,
  mapChangedDataToCategories,
  getExerciseFieldByCategory,
  processExerciseChanges,
  resetUserExercises
} from '../utils/exerciseUtils.js';
import { User } from '@shared/models/user.js';
import { ApiData } from '@shared/models/apiData.js';
import { ExerciseCategories } from '@shared/models/training/enum/exerciseCategories.js';

export interface UserClaimsSet {
  id: string;
}

// Typing the getUserExercises function
export async function getUserExercises(userDAO: MongoGenericDAO<User>, userClaimsSet: UserClaimsSet) {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('User not found');
  }

  return prepareExercisesData(user);
}

// Typing the updateUserExercises function
export async function updateUserExercises(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  changedData: ApiData
): Promise<void> {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('User not found');
  }

  const changedCategoriesMap = mapChangedDataToCategories(changedData);

  Object.entries(changedCategoriesMap).forEach(([category, { fieldNames, newValues }]) => {
    const userExerciseField = getExerciseFieldByCategory(category as ExerciseCategories, user);

    for (let index = 0; index < fieldNames.length; index++) {
      processExerciseChanges(fieldNames[index], index, newValues, userExerciseField);
    }
  });

  await userDAO.update(user);
}

// Typing the resetUserExerciseData function
export async function resetUserExerciseData(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet
): Promise<void> {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('User not found');
  }

  resetUserExercises(user);
  await userDAO.update(user);
}
