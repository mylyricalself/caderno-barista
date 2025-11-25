import React, { useState, useRef } from 'react';
import { BrewMethod, Recipe } from '../types';
import { saveRecipe, deleteRecipe } from '../services/storage';
import { enhanceRecipeNotes } from '../services/geminiService';
import { Button } from './Button';

interface RecipeEditorProps {
  userEmail: string;
  initialRecipe?: Recipe;
  onSave: () => void;
  onCancel: () => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ userEmail, initialRecipe, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [method, setMethod] = useState(initialRecipe?.method || BrewMethod.V60);
  const [notes, setNotes] = useState(initialRecipe?.notes || '');
  const [rating, setRating] = useState(initialRecipe?.rating || 0);
  const [categories, setCategories] = useState<string[]>(initialRecipe?.categories || []);
  const [currentCategory, setCurrentCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(initialRecipe?.imageUrl || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe: Recipe = {
      id: initialRecipe?.id || Date.now().toString(),
      title,
      method,
      notes,
      rating,
      categories,
      imageUrl,
      createdAt: initialRecipe?.createdAt || Date.now(),
    };
    saveRecipe(userEmail, recipe);
    onSave();
  };

  const handleDelete = () => {
    if (initialRecipe && window.confirm('Tem certeza que deseja excluir esta receita?')) {
      deleteRecipe(initialRecipe.id);
      onSave(); // Acts as close/refresh
    }
  };

  const handleAiEnhance = async () => {
    if (!notes.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceRecipeNotes(notes, method);
      setNotes(enhanced);
    } catch (error) {
      alert("Não foi possível conectar com a IA no momento.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddCategory = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentCategory.trim()) {
      e.preventDefault();
      const val = currentCategory.trim();
      if (!categories.includes(val)) {
        setCategories([...categories, val]);
      }
      setCurrentCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 600px width/height to save LocalStorage space
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 600;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrl(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-coffee-50 flex flex-col">
      <header className="bg-white border-b border-coffee-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} className="flex items-center gap-1 pl-0 hover:bg-transparent hover:text-coffee-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
          <h2 className="text-lg font-bold text-coffee-900">
            {initialRecipe ? 'Editar Receita' : 'Nova Receita'}
          </h2>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
          
          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center mb-6">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`relative w-full h-48 md:h-64 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${imageUrl ? 'border-coffee-300' : 'border-coffee-200 hover:bg-coffee-50'}`}
             >
               {imageUrl ? (
                 <>
                   <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Trocar Foto
                      </span>
                   </div>
                 </>
               ) : (
                 <div className="text-center p-6">
                    <svg className="mx-auto h-12 w-12 text-coffee-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-coffee-500">Clique para adicionar uma foto</p>
                 </div>
               )}
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept="image/*"
                 onChange={handleImageUpload}
               />
             </div>
             {imageUrl && (
                <button type="button" onClick={() => setImageUrl('')} className="mt-2 text-xs text-red-500 hover:text-red-700 hover:underline">
                  Remover foto
                </button>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-coffee-700 mb-1">Nome da Receita</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                placeholder="Ex: Etiópia Yirgacheffe Manhã"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">Método</label>
              <select
                className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none bg-white"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {Object.values(BrewMethod).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-coffee-50/50 p-4 rounded-lg border border-coffee-100">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Categorias (Tags)</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                {categories.map(cat => (
                  <span key={cat} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-coffee-800 border border-coffee-200 shadow-sm">
                    {cat}
                    <button type="button" onClick={() => removeCategory(cat)} className="ml-1.5 text-coffee-400 hover:text-red-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-coffee-300 rounded-md focus:ring-1 focus:ring-coffee-500 outline-none"
                placeholder="Digite e Enter para adicionar..."
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                onKeyDown={handleAddCategory}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Avaliação</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 transition-all duration-200 transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-coffee-200 hover:text-yellow-200'}`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-xs text-coffee-500 mt-1 block">
                {rating > 0 ? `${rating} de 5 estrelas` : 'Toque para avaliar'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-coffee-700">Anotações / Receita</label>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={handleAiEnhance}
                isLoading={isEnhancing}
                className="text-xs py-1 px-3 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              >
                {!isEnhancing && (
                  <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {isEnhancing ? 'Aprimorando...' : 'Melhorar com IA'}
              </Button>
            </div>
            <textarea
              required
              rows={12}
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all font-mono text-sm leading-relaxed"
              placeholder="Escreva sua receita aqui. Ex: 20g de café, 300ml de água..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-6 border-t border-coffee-100 flex items-center justify-between">
            {initialRecipe ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-md transition-colors"
              >
                Excluir
              </button>
            ) : (
              <div></div> // Spacer
            )}
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Receita
              </Button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};
