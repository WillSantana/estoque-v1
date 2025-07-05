export const Product = {
  name: "Product",
  type: "object",
  properties: {
    tipo_produto: {
      type: "string",
      description: "Tipo do produto (ração, medicamento, acessório, etc.)",
    },
    marca: {
      type: "string",
      description: "Marca do produto",
    },
    nome_produto: {
      type: "string",
      description: "Nome específico do produto",
    },
    quantidade: {
      type: "number",
      description: "Quantidade em estoque",
    },
    peso: {
      type: "number",
      description: "Peso do produto em kg",
    },
    fornecedor: {
      type: "string",
      description: "Nome do fornecedor",
    },
    preco: {
      type: "number",
      description: "Preço de compra do produto",
    },
    data_compra: {
      type: "string",
      format: "date",
      description: "Data da compra",
    },
    data_validade: {
      type: "string",
      format: "date",
      description: "Data de validade do produto",
    },
    observacoes: {
      type: "string",
      description: "Observações adicionais sobre o produto",
    },
  },
  required: [
    "tipo_produto",
    "marca",
    "nome_produto",
    "quantidade",
    "fornecedor",
    "preco",
    "data_compra",
  ],
};
