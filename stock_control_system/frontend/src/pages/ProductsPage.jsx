import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getSuppliers } from '../services/products'
import ProductsTable from '../products/ProductsTable'
import Filters from '../components/Filters'
import ProductForm from '../components/ProductForm'
import MovimentacaoForm from '../components/MovimentacaoForm'
import MovimentacoesTable from '../components/MovimentacoesTable'
import { Dialog } from '@headlessui/react'

const ProductsPage = () => {
  const [filters, setFilters] = useState({})
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isMovimentacaoFormOpen, setIsMovimentacaoFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  })

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  })

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setIsProductFormOpen(true)
  }

  const handleMovimentacao = (product) => {
    setSelectedProduct(product)
    setIsMovimentacaoFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsProductFormOpen(false)
    setIsMovimentacaoFormOpen(false)
    setSelectedProduct(null)
    refetch()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button
          onClick={() => {
            setSelectedProduct(null)
            setIsProductFormOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Adicionar Produto
        </button>
      </div>

      <Filters 
        filters={filters} 
        onChange={setFilters} 
        suppliers={suppliers} 
      />

      <ProductsTable 
        products={products} 
        loading={isLoading} 
        onEdit={handleEdit}
        onMovimentacao={handleMovimentacao}
      />

      {/* Modal de Produto */}
      <Dialog
        open={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              {selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </Dialog.Title>
            <ProductForm
              product={selectedProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsProductFormOpen(false)}
              suppliers={suppliers}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Movimentação */}
      <Dialog
        open={isMovimentacaoFormOpen}
        onClose={() => setIsMovimentacaoFormOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Registrar Movimentação - {selectedProduct?.descricao}
            </Dialog.Title>
            <MovimentacaoForm
              produto={selectedProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsMovimentacaoFormOpen(false)}
            />
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Histórico de Movimentações</h3>
              <MovimentacoesTable produtoId={selectedProduct?.id} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

export default ProductsPage