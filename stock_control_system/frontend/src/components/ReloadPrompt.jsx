// Crie o arquivo: src/components/ReloadPrompt.jsx

import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/button'; // Importe seu componente de botão

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.log('Erro no registro do Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady) {
    return (
      <div className="fixed right-4 bottom-4 z-50 p-4 rounded-lg shadow-lg bg-white border">
        <h3 className="font-bold">App pronto para uso offline!</h3>
        <p className="text-sm text-gray-600">O conteúdo foi salvo para uso sem internet.</p>
        <Button onClick={close} variant="outline" size="sm" className="mt-2">
          Fechar
        </Button>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div className="fixed right-4 bottom-4 z-50 p-4 rounded-lg shadow-lg bg-white border">
        <h3 className="font-bold">Nova versão disponível!</h3>
        <p className="text-sm text-gray-600">Recarregue para aplicar as atualizações.</p>
        <div className="flex gap-2 mt-3">
          <Button onClick={() => updateServiceWorker(true)} size="sm">
            Atualizar
          </Button>
          <Button onClick={close} variant="outline" size="sm">
            Ignorar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;
