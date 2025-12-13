import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#B91C1C', backgroundColor: '#FEF2F2', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Something went wrong</h2>
            <p style={{ marginBottom: '20px', color: '#7F1D1D' }}>アプリケーションの起動中にエラーが発生しました。</p>
            <div style={{ backgroundColor: '#FEE2E2', padding: '15px', borderRadius: '8px', overflow: 'auto', border: '1px solid #FECACA' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{this.state.error?.message}</p>
              <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.stack}
              </pre>
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.875rem', color: '#7F1D1D' }}>
              ※ APIキーが正しく設定されているか、環境変数 <code>GEMINI_API_KEY</code> を確認してください。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);