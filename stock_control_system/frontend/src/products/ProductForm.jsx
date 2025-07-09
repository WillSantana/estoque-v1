// src/products/ProductForm.jsx

import React, { useState } from 'react';
// Removendo a importação do Button personalizado para teste
// import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Loader2 } from 'lucide-react'; // Ícone de carregamento

export default function ProductForm() {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [message, setMessage] = useState('');

  const generateProductDescription = async () => {
    console.log('Função generateProductDescription chamada!'); // Adicionado para depuração

    if (!productName.trim()) {
      setMessage('Por favor, insira o nome do produto para gerar uma descrição.');
      return;
    }

    setIsGeneratingDescription(true);
    setMessage('Gerando descrição do produto...');

    try {
      const prompt = `Crie uma descrição de produto detalhada e persuasiva para um item chamado "${productName}". Inclua características, benefícios e um tom de vendas.`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const generatedText = result.candidates[0].content.parts[0].text;
        setProductDescription(generatedText);
        setMessage('Descrição gerada com sucesso!');
      } else {
        setMessage('Não foi possível gerar a descrição. Tente novamente.');
        console.error('Erro na resposta da API Gemini:', result);
      }
    } catch (error) {
      setMessage('Ocorreu um erro ao conectar com a API. Verifique sua conexão.');
      console.error('Erro ao chamar a API Gemini:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Produto a ser salvo:', { productName, productDescription });
    setMessage('Produto salvo (funcionalidade de salvar não implementada nesta versão).');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Adicionar/Editar Produto</h2>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Adicionado id ao formulário */}
          <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto
              </label>
              <Input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Camiseta de Algodão"
                required
              />
            </div>

            <div>
              <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Produto
              </label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Uma breve descrição do produto..."
                rows={5}
              />
            </div>

            {/* Botão HTML simples com estilos adicionais para depuração */}
            <button
              type="button"
              onClick={generateProductDescription}
              disabled={isGeneratingDescription}
              // Adicionado borda e z-index para depuração visual
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-500 relative z-50"
            >
              {isGeneratingDescription ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  {' '}Gerando...
                </>
              ) : (
                'Gerar Descrição ✨'
              )}
            </button>

            {message && (
              <p className={`text-sm mt-2 ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter>
          {/* Botão de submit referenciando o formulário pelo id */}
          <button type="submit" form="productForm" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
            Salvar Produto
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
