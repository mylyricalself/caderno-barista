import { GoogleGenAI } from "@google/genai";

// Declaração para evitar erro do TypeScript no build
declare const process: { env: { API_KEY: string } };

// Inicializa a IA com a chave segura processada pelo Vite
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceRecipeNotes = async (currentNotes: string, method: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Atue como um barista profissional campeão mundial e amigável.
      Eu tenho algumas anotações rascunhadas sobre uma receita de café usando o método ${method}.
      
      Minhas anotações atuais:
      "${currentNotes}"
      
      Por favor, formate essas anotações em uma receita estruturada, elegante e fácil de ler.
      Use emojis para deixar mais visual (ex: 🌡️ para temperatura, ☕ para dose).
      
      Inclua seções para:
      - ⚖️ Dose (Café/Água)
      - ⚙️ Moagem
      - 🌡️ Temperatura
      - ⏱️ Passo a passo detalhado
      
      Se faltar alguma informação crítica (como temperatura ou tempo), sugira um valor padrão razoável para o método ${method} entre parênteses.
      Mantenha o tom sofisticado mas prático. Responda em Português.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        // Thinking budget removido para o modelo flash para evitar erros de compatibilidade
      }
    });

    return response.text || currentNotes;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    // Retorna as notas originais se der erro, para o usuário não perder nada
    return currentNotes;
  }
};

export const suggestRecipeByBean = async (beanDescription: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Eu tenho este café: "${beanDescription}".
      Sugira uma receita completa para extrair o melhor sabor dele.
      Escolha o método de preparo que você acha que melhor se adapta a este grão e explique o porquê.
      Responda em Português.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
};
