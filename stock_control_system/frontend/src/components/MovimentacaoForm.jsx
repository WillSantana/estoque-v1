import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMovimentacao } from '../services/products'
import { useAuth } from '../context/AuthContext'

const MovimentacaoForm = ({ produto, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      produto: produto?.id,
      tipo: 'ENTRADA',
      motivo: 'COMPRA',
      quantidade: 1,
      preco_unitario: produto?.preco_compra || 0,
    }
  })
  
  const tipo = watch('tipo')
  
  const mutation = useMutation({
    mutationFn: createMovimentacao,
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['movimentacoes'])
      onSuccess?.()
    }
  })
  
  const onSubmit = (data) => {
    mutation.mutate(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Movimentação
          </label>
          <select
            {...register('tipo')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Motivo
          </label>
          <select
            {...register('motivo')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
            <option value="AJUSTE">Ajuste</option>
            <option value="PERDA">Perda/Descarte</option>
            <option value="DEVOLUCAO">Devolução</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantidade
          </label>
          <input
            type="number"
            {...register('quantidade', { 
              valueAsNumber: true,
              min: { value: 1, message: 'Quantidade mínima é 1' }
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {errors.quantidade && (
            <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preço Unitário (R$)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('preco_unitario', {
              valueAsNumber: true,
              min: { value: 0, message: 'Preço não pode ser negativo' }
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {errors.preco_unitario && (
            <p className="mt-1 text-sm text-red-600">{errors.preco_unitario.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          {...register('observacoes')}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {mutation.isLoading ? 'Registrando...' : 'Registrar Movimentação'}
        </button>
      </div>
    </form>
  )
}

export default MovimentacaoForm