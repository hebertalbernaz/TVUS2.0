import React from 'react';

export default function CardioModule() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Módulo Cardiologia</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="font-bold text-lg">Ecocardiograma</h2>
          <p className="text-gray-500">Medidas e Cálculos</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="font-bold text-lg">Eletrocardiograma</h2>
          <p className="text-gray-500">Análise de Ritmo</p>
        </div>
      </div>
    </div>
  );
}
