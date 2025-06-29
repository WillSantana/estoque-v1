## Esboço dos Modelos de Dados (Django)

### Modelo: Produto
- **tipo_produto**: CharField (Ração, Suplemento, Brinquedo, etc.)
- **marca**: CharField
- **quantidade**: IntegerField
- **peso**: DecimalField
- **fornecedor**: CharField
- **preco**: DecimalField
- **data_compra**: DateField
- **data_validade**: DateField
- **observacoes**: TextField (opcional)

### Modelo: Usuario (para autenticação)
- **email**: EmailField (único)
- **username**: CharField (único)
- **password**: CharField (hashed)
- **is_active**: BooleanField
- **is_staff**: BooleanField
- **date_joined**: DateTimeField


