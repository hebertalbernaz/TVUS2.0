import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';
import { getDatabase } from '@/core/database/db'; 

export function DrugSelector({ onSelect }) {
  const { practice } = useLicense();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const search = async () => {
      // Evita buscas desnecessárias com menos de 2 caracteres
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
          const db = await getDatabase();
          
          // --- CORREÇÃO DO ERRO QU16 AQUI ---
          // O RxDB exige que o regex seja uma STRING, e não um objeto new RegExp().
          // Usamos $options: 'i' para ignorar maiúsculas/minúsculas.
          const trimmedSearch = searchTerm.trim();
          if (!trimmedSearch) {
            setResults([]);
            return;
          }
          
          const docs = await db.drugs.find({
            selector: {
              name: { 
                $regex: trimmedSearch,  // Garantir que é uma string válida
                $options: 'i'        
              },
              type: practice 
            },
            limit: 10
          }).exec();
          
          setResults(docs.map(d => d.toJSON()));
          setShowResults(true);
      } catch (e) {
          console.error("Search error:", e);
      }
    };

    // Delay para evitar chamadas excessivas enquanto digita
    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, practice]);

  return (
    <div className="relative z-50">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          data-testid="drug-selector-input"
          placeholder="Buscar medicamento (ex: Dipirona)..." 
          className="pl-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute w-full mt-1 max-h-60 overflow-auto shadow-xl border-primary/20 bg-card z-50" data-testid="drug-selector-results">
          {results.map(drug => (
            <div 
              key={drug.id}
              data-testid={`drug-selector-item-${drug.id}`}
              className="p-3 hover:bg-accent cursor-pointer border-b last:border-none flex justify-between items-center"
              onClick={() => {
                onSelect(drug);
                setSearchTerm('');
                setResults([]);
                setShowResults(false);
              }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm truncate">{drug.name}</div>
                  {drug.category ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground whitespace-nowrap" data-testid={`drug-category-${drug.id}`}>
                      {drug.category}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{drug.default_dosage}</div>
              </div>
              <Plus className="h-4 w-4 text-primary flex-shrink-0" />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}