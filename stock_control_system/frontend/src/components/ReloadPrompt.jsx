// src/components/ReloadPrompt.jsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import PWAInstallButton from './PWAInstallButton';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <PWAInstallButton />
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-6 left-6 bg-white p-4 rounded shadow-md z-50 border border-gray-300">
          <p className="text-sm text-gray-700 mb-2">
            {offlineReady
              ? 'App pronto para uso offline.'
              : 'Nova versão disponível.'}
          </p>
          <div className="flex gap-2">
            {needRefresh && (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => updateServiceWorker(true)}
              >
                Recarregar
              </button>
            )}
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
              onClick={close}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
