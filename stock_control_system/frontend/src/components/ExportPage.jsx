import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, FileText, FileArchive, Loader2 } from 'lucide-react';
import api from '../lib/api'; // ✅ CORRETO: default import

export default function ExportPage() {
  const [loading, setLoading] = useState(null);

  const handleExport = async (format, endpoint) => {
    setLoading(endpoint);
    try {
      const response = await api.get(`/api/${endpoint}/?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      let fileName = `export_${endpoint}.${format}`;
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match?.[1]) {
          fileName = match[1];
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Erro ao exportar ${endpoint}:`, error);
      alert(`Erro ao exportar ${endpoint}.`);
    } finally {
      setLoading(null);
    }
  };

  const ExportButton = ({ format, endpoint }) => {
    const isLoading = loading === `${endpoint}-${format}`;
    return (
      <Button onClick={() => handleExport(format, endpoint)} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Exportar {format.toUpperCase()}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Exportar Dados e Backup</h1>
        <p className="text-gray-500 mt-1">
          Faça o download dos dados em diferentes formatos ou gere um backup completo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Produtos */}
        <Card className="shadow-md border-none rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              Exportar Produtos
            </CardTitle>
            <CardDescription>
              Exporta a lista de produtos em CSV ou XLSX.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <ExportButton format="csv" endpoint="products/export" />
            <ExportButton format="xlsx" endpoint="products/export" />
          </CardContent>
        </Card>

        {/* Movimentações */}
        <Card className="shadow-md border-none rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-yellow-600" />
              Exportar Movimentações
            </CardTitle>
            <CardDescription>
              Exporta movimentações do estoque (entradas e saídas).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <ExportButton format="csv" endpoint="movements/export" />
            <ExportButton format="xlsx" endpoint="movements/export" />
          </CardContent>
        </Card>
      </div>

      {/* Backup */}
      <Card className="shadow-md border-none rounded-xl bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="text-red-600" />
            Backup Completo
          </CardTitle>
          <CardDescription>
            Gere um arquivo ZIP com backup do banco de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => handleExport('zip', 'backup')}
            disabled={loading === 'backup'}
          >
            {loading === 'backup' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Gerar Backup Completo (.zip)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
