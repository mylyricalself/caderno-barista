import React, { useState } from 'react';
import { loginUser, saveUser } from '../services/storage';
import { Button } from './Button';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        loginUser(email, password);
      } else {
        saveUser(email, password);
        loginUser(email, password); // Auto login after signup
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-coffee-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-coffee-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coffee-800 mb-4 text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <path d="M6 1v3"/>
              <path d="M10 1v3"/>
              <path d="M14 1v3"/>
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">Caderno do Barista</h1>
          <p className="text-coffee-600 mt-3 text-sm leading-relaxed">
            Seu espaço digital para registrar receitas, aprimorar métodos com IA e criar o café perfeito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-1">E-mail</label>
            <input
              type="email"
              required
              placeholder="exemplo@cafe.com"
              className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-1">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-base shadow-md hover:shadow-lg transform transition-all active:scale-95">
            {isLogin ? 'Entrar no Caderno' : 'Criar Nova Conta'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-coffee-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-coffee-600 hover:text-coffee-900 hover:underline font-medium"
          >
            {isLogin ? 'Primeira vez aqui? Crie sua conta' : 'Já possui anotações? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};
