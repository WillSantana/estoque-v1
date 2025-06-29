import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import '../App.css';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    tipo_produto: '',
    marca: '',
    quantidade: '',
    peso: '',
    fornecedor: '',
    preco: '',
    data_compra: '',
    data_validade: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [id, isEditing]);

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const product = await productsAPI.getById(id);
      setFormData({
        tipo_produto: product.tipo_produto || '',
        marca: product.marca || '',
        quantidade: product.quantidade?.toString() || '',
        peso: product.peso?.toString() || '',
        fornecedor: product.fornecedor || '',
        preco: product.preco?.toString() || '',
        data_compra: product.data_compra || '',
        data_validade: product.data_validade || '',
        observacoes: product.observacoes || '',
      });
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setErrors({ general: 'Erro ao carregar produto' });
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipo_produto) {
      newErrors.tipo_produto = 'Tipo do produto é obrigatório';
    }

    if (!formData.marca) {
      newErrors.marca = 'Marca é obrigatória';
    }

    if (!formData.quantidade) {
      newErrors.quantidade = 'Quantidade é obrigatória';
    } else if (parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (!formData.peso) {
      newErrors.peso = 'Peso é obrigatório';
    } else if (parseFloat(formData.peso) <= 0) {
      newErrors.peso = 'Peso deve ser maior que zero';
    }

    if (!formData.fornecedor) {
      newErrors.fornecedor = 'Fornecedor é obrigatório';
    }

    if (!formData.preco) {
      newErrors.preco = 'Preço é obrigatório';
    } else if (parseFloat(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (!formData.data_compra) {
      newErrors.data_compra = 'Data de compra é obrigatória';
    }

    if (!formData.data_validade) {
      newErrors.data_validade = 'Data de validade é obrigatória';
    }

    if (formData.data_compra && formData.data_validade) {
      if (new Date(formData.data_validade) <= new Date(formData.data_compra)) {
        newErrors.data_validade = 'Data de validade deve ser posterior à data de compra';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        quantidade: parseInt(formData.quantidade),
        peso: parseFloat(formData.peso),
        preco: parseFloat(formData.preco),
      };

      if (isEditing) {
        await productsAPI.update(id, productData);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        await productsAPI.create(productData);
        setSuccess('Produto criado com sucesso!');
      }

      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Erro ao salvar produto' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para produtos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="mr-2 h-5 w-5" />
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Atualize as informações do produto'
              : 'Preencha as informações do novo produto'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_produto">Tipo do Produto *</Label>
                <Input
                  id="tipo_produto"
                  name="tipo_produto"
                  placeholder="Ex: Ração, Suplemento, Brinquedo"
                  value={formData.tipo_produto}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.tipo_produto && (
                  <p className="text-sm text-destructive">{errors.tipo_produto}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  name="marca"
                  placeholder="Ex: Royal Canin, Pedigree"
                  value={formData.marca}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.marca && (
                  <p className="text-sm text-destructive">{errors.marca}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  placeholder="Ex: 10"
                  value={formData.quantidade}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.quantidade && (
                  <p className="text-sm text-destructive">{errors.quantidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  name="peso"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 15.5"
                  value={formData.peso}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.peso && (
                  <p className="text-sm text-destructive">{errors.peso}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 89.90"
                  value={formData.preco}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.preco && (
                  <p className="text-sm text-destructive">{errors.preco}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                name="fornecedor"
                placeholder="Ex: Distribuidora Pet ABC"
                value={formData.fornecedor}
                onChange={handleChange}
                disabled={loading}
                required
              />
              {errors.fornecedor && (
                <p className="text-sm text-destructive">{errors.fornecedor}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_compra">Data de Compra *</Label>
                <Input
                  id="data_compra"
                  name="data_compra"
                  type="date"
                  value={formData.data_compra}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.data_compra && (
                  <p className="text-sm text-destructive">{errors.data_compra}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_validade">Data de Validade *</Label>
                <Input
                  id="data_validade"
                  name="data_validade"
                  type="date"
                  value={formData.data_validade}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.data_validade && (
                  <p className="text-sm text-destructive">{errors.data_validade}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Observações adicionais sobre o produto..."
                value={formData.observacoes}
                onChange={handleChange}
                disabled={loading}
                rows={3}
              />
              {errors.observacoes && (
                <p className="text-sm text-destructive">{errors.observacoes}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

