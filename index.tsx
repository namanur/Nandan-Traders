import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const AppToRender = window.location.pathname.startsWith('/admin') ? <Admin /> : <App />;


root.render(
  <React.StrictMode>
    {AppToRender}
  </React.StrictMode>
);
