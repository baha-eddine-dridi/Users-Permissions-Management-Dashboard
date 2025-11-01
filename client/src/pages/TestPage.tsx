import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Test de styles - Page de diagnostic
      </h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#666', fontSize: '18px', marginBottom: '10px' }}>
          Styles inline (devraient fonctionner)
        </h2>
        <p>Ce texte utilise des styles inline et devrait être visible correctement.</p>
      </div>

      <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-2">
          Test TailwindCSS
        </h2>
        <p className="text-blue-100">
          Si ce bloc a un fond bleu, TailwindCSS fonctionne !
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-red-500 h-20 rounded"></div>
        <div className="bg-green-500 h-20 rounded"></div>
        <div className="bg-yellow-500 h-20 rounded"></div>
      </div>

      <button 
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => alert('Button clicked!')}
      >
        Bouton TailwindCSS
      </button>
    </div>
  );
};

export default TestPage;
