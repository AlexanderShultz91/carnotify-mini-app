import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Admin from './Admin.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#0D0D0D',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#FF6E40' }}>Что-то пошло не так</h2>
          <p style={{ opacity: 0.8, fontSize: '14px' }}>Приложение столкнулось с ошибкой. Пожалуйста, перезагрузите его.</p>
          <pre style={{ 
            marginTop: '20px', 
            padding: '10px', 
            background: '#1A1A1A', 
            borderRadius: '8px',
            fontSize: '10px',
            maxWidth: '100%',
            overflow: 'auto',
            textAlign: 'left'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#FF6E40',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {path === '/admin' ? <Admin /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
