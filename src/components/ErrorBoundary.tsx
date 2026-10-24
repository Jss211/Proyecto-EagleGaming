import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Algo no salió como esperábamos
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Ocurrió un error inesperado al renderizar esta vista. Puedes intentar recargar la página o volver a la tienda.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-semibold transition-colors"
              >
                <RefreshCw size={16} />
                Recargar página
              </button>
              <a
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
              >
                <Home size={16} />
                Ir al Inicio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
