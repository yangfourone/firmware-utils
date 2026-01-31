import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import MacroCalculator from './pages/MacroCalculator';
import BitFieldViewer from './pages/BitFieldViewer';
import MemoryViewer from './pages/MemoryViewer';

const App: React.FC = () => {
  // Simple hash-based routing for a static SPA feel without complex router dependencies
  const [currentPath, setCurrentPath] = useState(window.location.hash || '/');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      setCurrentPath(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial path if hash exists on load
    if (window.location.hash) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/macro-calc':
        return <MacroCalculator onBack={() => navigate('/')} />;
      case '/bit-fields':
        return <BitFieldViewer onBack={() => navigate('/')} />;
      case '/memory-dump':
        return <MemoryViewer onBack={() => navigate('/')} />;
      case '/':
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <Layout onNavigateHome={() => navigate('/')}>
      {renderContent()}
    </Layout>
  );
};

export default App;