import { Recipe, User } from '../types';

const USERS_KEY = 'barista_users';
const RECIPES_KEY = 'barista_recipes';
const CURRENT_USER_KEY = 'barista_current_user';

export const saveUser = (email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (users[email]) {
    throw new Error('Usuário já existe.');
  }
  const newUser: User = { email, name: email.split('@')[0] };
  users[email] = { ...newUser, password }; // storing password in plain text is unsafe in prod, ok for mock
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  const user = users[email];
  if (!user || user.password !== password) {
    throw new Error('Credenciais inválidas.');
  }
  const { password: _, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getSessionUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const getRecipes = (email: string): Recipe[] => {
  const allRecipes = JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]');
  // Filter recipes by user ownership (using email as FK for this simple mock)
  // In a real app, we'd use IDs.
  return allRecipes.filter((r: any) => r.userId === email).sort((a: Recipe, b: Recipe) => b.createdAt - a.createdAt);
};

export const saveRecipe = (email: string, recipe: Recipe): void => {
  const allRecipes = JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]');
  const existingIndex = allRecipes.findIndex((r: any) => r.id === recipe.id);
  
  const recipeWithUser = { ...recipe, userId: email };

  if (existingIndex >= 0) {
    allRecipes[existingIndex] = recipeWithUser;
  } else {
    allRecipes.push(recipeWithUser);
  }
  
  localStorage.setItem(RECIPES_KEY, JSON.stringify(allRecipes));
};

export const deleteRecipe = (id: string): void => {
  let allRecipes = JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]');
  allRecipes = allRecipes.filter((r: any) => r.id !== id);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(allRecipes));
};
