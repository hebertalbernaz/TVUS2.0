import React, { useState } from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UltrasoundModule() {
  const { practice } = useLicense();
  
  const vetOrgans = [
    "Fígado", "Baço", "Rins", "Bexiga", "Próstata", "Adrenais", "Pâncreas", "Linfonodos"
  ];

  const humanOrgans = [
    "Fígado", "Vesícula Biliar", "Pâncreas", "Rins", "Bexiga", "Próstata", "Útero", "Tireoide", "Apêndice"
  ];

  const organs = practice === 'vet' ? vetOrgans : humanOrgans;

  const [selectedOrgan, setSelectedOrgan] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Módulo de Ultrassonografia ({practice === 'vet' ? 'Veterinária' : 'Humana'})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Órgãos */}
        <div className="space-y-2">
            <h2 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Estruturas ({practice === 'vet' ? 'Animais' : 'Humanas'})</h2>
            <div className="bg-white border rounded overflow-hidden">
                {organs.map(organ => (
                    <div 
                        key={organ}
                        className={`px-4 py-3 border-b last:border-none cursor-pointer hover:bg-gray-50 ${selectedOrgan === organ ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
                        onClick={() => setSelectedOrgan(organ)}
                    >
                        {organ}
                    </div>
                ))}
            </div>
        </div>

        {/* Editor (Mock) */}
        <div className="md:col-span-2">
            <Card className="h-full p-6 flex flex-col">
                {selectedOrgan ? (
                    <>
                        <h3 className="text-xl font-bold mb-4">{selectedOrgan}</h3>
                        <div className="flex-1 bg-gray-50 border border-dashed rounded p-4 text-gray-500">
                            [Área do Editor de Texto Rico]
                            <br/><br/>
                            Aqui apareceriam os templates específicos para {selectedOrgan} ({practice === 'vet' ? 'Canino/Felino' : 'Adulto/Pediátrico'}).
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button>Salvar Laudo</Button>
                            <Button variant="outline">Adicionar Imagem</Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Selecione uma estrutura ao lado para iniciar o laudo.
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
