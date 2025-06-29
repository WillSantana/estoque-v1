export const getMovimentacoes = async (params = {}) => {
  const response = await api.get('/movimentacoes/', { params })
  return response.data
}

export const createMovimentacao = async (movimentacaoData) => {
  const response = await api.post('/movimentacoes/', movimentacaoData)
  return response.data
}