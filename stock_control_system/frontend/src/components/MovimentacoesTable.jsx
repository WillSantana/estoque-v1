import { useQuery } from '@tanstack/react-query'
import { getMovimentacoes } from '../services/products'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MovimentacoesTable = ({ produtoId }) => {
  const { data: movimentacoes, isLoading } = useQuery({
    queryKey: ['movimentacoes', { produto: produtoId }],
    queryFn: () => getMovimentacoes({ produto: produtoId, ordering: '-data' }),
    enabled: !!produtoId
  })
  
  if (isLoading) return <div className="text-center py-4">Carregando...</div>
  
  if (!movimentacoes || movimentacoes.length === 0) {
    return <div className="text-center py-4 text-gray-500">Nenhuma movimentação registrada</div>
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Motivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço Unitário
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movimentacoes.map((mov) => (
            <tr key={mov.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(mov.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  mov.tipo === 'ENTRADA' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mov.motivo === 'COMPRA' && 'Compra'}
                {mov.motivo === 'VENDA' && 'Venda'}
                {mov.motivo === 'AJUSTE' && 'Ajuste'}
                {mov.motivo === 'PERDA' && 'Perda/Descarte'}
                {mov.motivo === 'DEVOLUCAO' && 'Devolução'}
                {mov.motivo === 'OUTRO' && 'Outro'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
              }`}>
                {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.quantidade}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mov.preco_unitario ? 
                  new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(mov.preco_unitario) : 
                  'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MovimentacoesTable