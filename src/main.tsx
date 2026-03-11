import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { StoreProvider } from '@app/providers/StoreProvider';
import { RouterProvider } from '@app/providers/RouterProvider';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider />
    </StoreProvider>
  </StrictMode>,
);
