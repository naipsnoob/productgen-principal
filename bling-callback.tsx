import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { apiService } from './services';

const BlingCallbackHandler = () => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code || !state) {
                setError("Parâmetros de callback inválidos do Bling. A autenticação falhou.");
                setStatus('error');
                return;
            }

            try {
                await apiService.handleBlingCallback(code, state);
                setStatus('success');
                setTimeout(() => {
                    // Redirect to the settings page inside the main app (using hash)
                    window.location.href = '/#/settings';
                }, 3000);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao conectar com o Bling.";
                setError(message);
                setStatus('error');
            }
        };
        handleAuth();
    }, []);

    const Card = ({ children }: {children: React.ReactNode}) => (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 max-w-lg mx-auto my-16 text-center">
            {children}
        </div>
    );

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (status === 'processing') {
        return (
            <Card>
                <LoadingSpinner />
                <h2 className="text-xl font-semibold mt-4 text-gray-800">Processando autorização do Bling...</h2>
                <p className="text-gray-600">Por favor, aguarde um momento.</p>
            </Card>
        );
    }

    if (status === 'success') {
        return (
            <Card>
                <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-semibold mt-4 text-green-700">Conexão com Bling bem-sucedida!</h2>
                <p className="text-gray-600">Você será redirecionado para as configurações em instantes.</p>
            </Card>
        );
    }

    // status === 'error'
    return (
        <Card>
            <div className="mx-auto bg-red-100 rounded-full h-16 w-16 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-xl font-semibold mt-4 text-red-700">Falha na Conexão</h2>
            <p className="text-gray-600 mt-2">{error || 'Ocorreu um erro inesperado.'}</p>
            <a href="/#/settings" className="inline-block mt-6 px-6 py-2.5 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700">
                Voltar para Configurações
            </a>
        </Card>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <BlingCallbackHandler />
    </React.StrictMode>
);
