import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme as antdTheme } from 'antd';
import './index.css';
import App from './App.tsx';
import { useAppStore } from './store/useAppStore';

// Theme wrapper component that uses Zustand
function ThemedApp() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    // Update body background when theme changes
    document.body.style.backgroundColor = theme === 'dark' ? '#141414' : '#f0f2f5';
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
);
