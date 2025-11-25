import React, { useState, useEffect } from 'react';
import { Recipe, User } from '../types';
import { getRecipes, logoutUser } from '../services/storage';
import { RecipeEditor } from './RecipeEditor';
import { Button } from './Button';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | undefined>(undefined);

  useEffect(() => {
    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecipes = () => {
    setRecipes(getRecipes(user.email));
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleCreateNew = () => {
    setCurrentRecipe(undefined);
    setIsEditing(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIsEditing(true);
  };

  const handleSaveComplete = () => {
    setIsEditing(false);
    loadRecipes();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Extract unique categories
  const allCategories = Array.from(new Set(recipes.flatMap(r => r.categories || []))).sort();

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory 
      ? (r.categories || []).includes(selectedCategory)
      : true;

    return matchesSearch && matchesCategory;
  });

  if (isEditing) {
    return (
      <RecipeEditor 
        userEmail={user.email} 
        initialRecipe={currentRecipe} 
        onSave={handleSaveComplete} 
        onCancel={handleCancelEdit} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* Header */}
      <header className="bg-white border-b border-coffee-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-coffee-800 rounded-lg text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/><path d="M18 8h1a4 4 0 0 1 0 8h-1"/></svg>
             </div>
             <h1 className="text-xl font-serif font-bold text-coffee-900 hidden sm:block">Caderno do Barista</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-coffee-600 text-sm hidden sm:block">Olá, <span className="font-semibold text-coffee-800">{user.name}</span></span>
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-coffee-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-coffee-300 rounded-md leading-5 bg-white placeholder-coffee-400 focus:outline-none focus:placeholder-coffee-300 focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 sm:text-sm"
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nova Receita
          </Button>
        </div>

        {/* Category Filters */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 items-center bg-white p-3 rounded-lg border border-coffee-100 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-coffee-500 mr-2">Categorias:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!selectedCategory ? 'bg-coffee-800 text-white' : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'}`}
            >
              Todas
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${cat === selectedCategory ? 'bg-coffee-600 text-white' : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-coffee-300">
            <svg className="mx-auto h-12 w-12 text-coffee-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-coffee-900">Nenhuma receita encontrada</h3>
            <p className="mt-1 text-sm text-coffee-500">
              {searchTerm || selectedCategory ? 'Tente ajustar seus filtros.' : 'Comece criando sua primeira anotação de café.'}
            </p>
            {!searchTerm && !selectedCategory && (
              <div className="mt-6">
                <Button variant="outline" onClick={handleCreateNew}>Criar receita</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                onClick={() => handleEdit(recipe)}
                className="bg-white rounded-xl shadow-sm border border-coffee-100 cursor-pointer hover:shadow-lg hover:border-coffee-300 transition-all group relative overflow-hidden flex flex-col h-full"
              >
                {recipe.imageUrl ? (
                  <div className="h-48 w-full overflow-hidden bg-coffee-100 relative">
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                   <div className="h-4 w-full bg-coffee-50 border-b border-coffee-100"></div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-coffee-100 text-coffee-800">
                            {recipe.method}
                        </span>
                        {recipe.rating && recipe.rating > 0 && (
                            <span className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-600 text-xs font-bold border border-yellow-100">
                                <svg className="w-3 h-3 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {recipe.rating}
                            </span>
                        )}
                      </div>
                      <span className="text-[10px] text-coffee-400">
                        {new Date(recipe.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit'})}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-serif font-bold text-coffee-900 mb-2 truncate">{recipe.title}</h3>
                    <p className="text-coffee-600 text-sm line-clamp-3 whitespace-pre-line leading-relaxed mb-4 flex-1">
                      {recipe.notes}
                    </p>

                    {recipe.categories && recipe.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-coffee-50">
                            {recipe.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-[10px] px-2 py-0.5 bg-coffee-50 text-coffee-500 rounded-full border border-coffee-100">
                                    {cat}
                                </span>
                            ))}
                            {recipe.categories.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 text-coffee-400 bg-coffee-50 rounded-full border border-coffee-100">
                                    +{recipe.categories.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
