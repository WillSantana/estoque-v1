// src/services/products.js
import { api } from "@/lib/api";

export const productsService = {
  list: async (ordering = "-created_at") => {
    try {
      const response = await api.get(`/produtos/?ordering=${ordering}`);
      // fallback para response.data.results ou response.data ou array vazio
      return response.data.results ?? response.data ?? [];
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  // Outros métodos como criar, editar, deletar podem ser adicionados aqui
  // Exemplo básico de create:
  create: async (productData) => {
    try {
      const response = await api.post("/produtos/", productData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw error;
    }
  },

  // Exemplo básico de update:
  update: async (id, productData) => {
    try {
      const response = await api.put(`/produtos/${id}/`, productData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  },

  // Exemplo básico de delete:
  delete: async (id) => {
    try {
      await api.delete(`/produtos/${id}/`);
      return true;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      throw error;
    }
  }
};

export const getMovimentacoes = async (params = {}) => {
  try {
    const response = await api.get("/movimentacoes/", { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return [];
  }
};

export const createMovimentacao = async (movimentacaoData) => {
  try {
    const response = await api.post("/movimentacoes/", movimentacaoData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    throw error;
  }
};
