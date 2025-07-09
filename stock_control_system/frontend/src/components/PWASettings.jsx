import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function PWASettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Configurações PWA</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">Online</Badge>
            <p className="text-sm text-gray-500 mt-2">Conectado</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Modo PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Navegador</Badge>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="warning">Desativadas</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Notificações Push</p>
                <p className="text-sm text-gray-500">Receber alertas de estoque e vencimento</p>
              </div>
              <Switch />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Modo Offline</p>
                <p className="text-sm text-gray-500">Permitir uso sem conexão com internet</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do PWA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Manifest Configurado</span>
              <Badge variant="success">✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Worker Ativo</span>
              <Badge variant="success">✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache Habilitado</span>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p><strong>Como instalar</strong></p>
              <p>No Chrome mobile, toque no menu (⋮) e selecione "Adicionar à tela inicial".</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
