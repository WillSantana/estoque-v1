import { useQuery } from '@tanstack/react-query'
import { getRelatorios } from '../services/products'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Relatorios = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['relatorios'],
    queryFn: getRelatorios,
  })
  
  if (isLoading) return <div>Carregando relatórios...</div>
  
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Estoque Baixo</h3>
        <p className="text-3xl font-bold text-red-600">{data?.produtos_baixo_estoque || 0}</p>
        <p className="text-sm text-gray-500 mt-1">produtos com quantidade ≤ 5</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Próximo do Vencimento</h3>
        <p className="text-3xl font-bold text-yellow-600">{data?.produtos_proximo_vencer || 0}</p>
        <p className="text-sm text-gray-500 mt-1">produtos com validade em 30 dias</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Movimentações</h3>
        <p className="text-3xl font-bold text-primary-600">{data?.movimentacoes_recentes || 0}</p>
        <p className="text-sm text-gray-500 mt-1">últimos 30 dias</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Valor em Estoque</h3>
        <p className="text-3xl font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(data?.valor_total_estoque || 0)}
        </p>
        <p className="text-sm text-gray-500 mt-1">valor total calculado</p>
      </div>
    </div>
  )
}

export default Relatorios