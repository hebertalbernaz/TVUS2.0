import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calculator, Clock, Pill, ChevronDown } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';
import { getDrugsByPractice } from '@/modules/prescription/drugs_db';
import { toast } from 'sonner';

/**
 * DrugSelector - Painel inteligente de adição de medicamentos com calculadora.
 *
 * @param {Object} props
 * @param {number|null} props.patientWeight - Peso do paciente (kg)
 * @param {Function} props.onAdd - Callback ao adicionar: (formattedItem) => void
 */
export function DrugSelector({ patientWeight, onAdd }) {
  const { practice } = useLicense();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Selected drug + calculator state
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [editBaseDose, setEditBaseDose] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('dias');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered drug list
  const filteredDrugs = useMemo(() => {
    const drugs = getDrugsByPractice(practice);
    if (!searchTerm.trim()) return drugs;
    const lower = searchTerm.toLowerCase();
    return drugs.filter((d) => d.name.toLowerCase().includes(lower));
  }, [practice, searchTerm]);

  // Auto-calculation
  const calculation = useMemo(() => {
    if (!selectedDrug) return null;
    const dose = parseFloat(editBaseDose) || 0;
    const isPerKg = selectedDrug.doseUnit === 'mg/kg';
    const weight = parseFloat(patientWeight) || 0;

    let totalDoseMg = isPerKg ? dose * weight : dose;

    // Parse concentration to get numeric value and unit
    const concMatch = selectedDrug.concentration.match(/^([\d.]+)(mg)\/(ml|comp|caps|drg)$/i);
    let volumeText = null;

    if (concMatch) {
      const concValue = parseFloat(concMatch[1]);
      const concUnit = concMatch[3].toLowerCase();
      if (concValue > 0 && totalDoseMg > 0) {
        const qty = totalDoseMg / concValue;
        const formattedQty = Number.isInteger(qty) ? qty : qty.toFixed(2);
        if (concUnit === 'ml') {
          volumeText = `${formattedQty} ml`;
        } else {
          volumeText = `${formattedQty} ${concUnit === 'comp' ? 'comprimido(s)' : concUnit === 'caps' ? 'cápsula(s)' : 'unidade(s)'}`;
        }
      }
    }

    return {
      totalDoseMg: Number.isInteger(totalDoseMg) ? totalDoseMg : parseFloat(totalDoseMg.toFixed(2)),
      volumeText,
      isPerKg,
      weight,
    };
  }, [selectedDrug, editBaseDose, patientWeight]);

  const handleSelectDrug = (drug) => {
    setSelectedDrug(drug);
    setEditBaseDose(String(drug.baseDose));
    setDuration('');
    setDurationUnit('dias');
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleAdd = () => {
    if (!selectedDrug) {
      toast.warning('Selecione um medicamento primeiro.');
      return;
    }

    // Build formatted string
    const parts = [];
    parts.push(selectedDrug.name);

    // Dose info
    if (calculation) {
      if (calculation.isPerKg && calculation.weight > 0) {
        parts.push(`${calculation.totalDoseMg}mg total (${editBaseDose}mg/kg x ${calculation.weight}kg)`);
      } else {
        parts.push(`${calculation.totalDoseMg}mg`);
      }
      if (calculation.volumeText) {
        parts.push(`Administrar ${calculation.volumeText}`);
      }
    }

    parts.push(`${selectedDrug.route} - ${selectedDrug.frequency}`);

    // Duration
    if (duration.trim()) {
      if (durationUnit === 'contínuo') {
        parts.push('Uso contínuo');
      } else {
        parts.push(`por ${duration} ${durationUnit}`);
      }
    }

    const formattedText = parts.join(' - ');

    onAdd({
      drugId: selectedDrug.id,
      drugName: selectedDrug.name,
      formattedText,
      dosage: editBaseDose,
      doseUnit: selectedDrug.doseUnit,
      totalDoseMg: calculation?.totalDoseMg || 0,
      volumeText: calculation?.volumeText || '',
      route: selectedDrug.route,
      frequency: selectedDrug.frequency,
      duration: duration.trim() ? (durationUnit === 'contínuo' ? 'Uso contínuo' : `${duration} ${durationUnit}`) : '',
    });

    toast.success(`${selectedDrug.name} adicionado à receita.`);
    setSelectedDrug(null);
    setEditBaseDose('');
    setDuration('');
    setSearchTerm('');
  };

  return (
    <Card className="p-5 space-y-4 border-primary/20" data-testid="drug-selector-panel">
      <div className="flex items-center gap-2 mb-1">
        <Pill className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
          Adicionar Medicamento
        </h3>
        <Badge variant="outline" className="ml-auto text-[10px]" data-testid="drug-selector-practice-badge">
          {practice === 'vet' ? 'VET' : 'HUMANO'}
        </Badge>
      </div>

      {/* ── SEARCH ── */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            data-testid="drug-search-input"
            placeholder="Buscar medicamento (ex: Meloxicam)..."
            className="pl-9 pr-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        {showDropdown && filteredDrugs.length > 0 && (
          <div
            className="absolute w-full mt-1 max-h-52 overflow-auto rounded-md border bg-popover shadow-lg z-50"
            data-testid="drug-search-results"
          >
            {filteredDrugs.map((drug) => (
              <div
                key={drug.id}
                data-testid={`drug-option-${drug.id}`}
                className="px-3 py-2.5 hover:bg-accent cursor-pointer border-b last:border-none flex items-center justify-between gap-2"
                onClick={() => handleSelectDrug(drug)}
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{drug.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {drug.baseDose}{drug.doseUnit} | {drug.route} | {drug.frequency}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-primary flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {showDropdown && searchTerm.trim() && filteredDrugs.length === 0 && (
          <div className="absolute w-full mt-1 p-3 rounded-md border bg-popover shadow-lg z-50 text-sm text-muted-foreground text-center">
            Nenhum medicamento encontrado.
          </div>
        )}
      </div>

      {/* ── CALCULATOR PANEL (visible when drug selected) ── */}
      {selectedDrug && (
        <div className="space-y-3 p-4 rounded-lg border bg-muted/30" data-testid="drug-calculator-panel">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Calculator className="h-4 w-4" />
            Calculadora: {selectedDrug.name}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Base Dose */}
            <div>
              <Label className="text-xs text-muted-foreground">Dose Base ({selectedDrug.doseUnit})</Label>
              <Input
                data-testid="drug-base-dose-input"
                type="number"
                step="any"
                value={editBaseDose}
                onChange={(e) => setEditBaseDose(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Patient Weight (read-only or info) */}
            {selectedDrug.doseUnit === 'mg/kg' && (
              <div>
                <Label className="text-xs text-muted-foreground">Peso do Paciente</Label>
                <div className="mt-1 flex items-center h-9 px-3 rounded-md border bg-background text-sm" data-testid="drug-patient-weight">
                  {patientWeight ? `${patientWeight} kg` : 'Não informado'}
                </div>
              </div>
            )}
          </div>

          {/* Calculated result */}
          {calculation && calculation.totalDoseMg > 0 && (
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-1" data-testid="drug-calculation-result">
              <div className="text-sm font-semibold text-foreground">
                Dose Total: <span className="text-primary">{calculation.totalDoseMg} mg</span>
                {calculation.isPerKg && calculation.weight > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({editBaseDose}mg/kg x {calculation.weight}kg)
                  </span>
                )}
              </div>
              {calculation.volumeText && (
                <div className="text-sm text-foreground">
                  Administrar: <span className="font-semibold text-primary">{calculation.volumeText}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Via: {selectedDrug.route} | Frequência: {selectedDrug.frequency}
              </div>
            </div>
          )}

          {/* Duration */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Duração do Tratamento
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-testid="drug-duration-input"
                type="text"
                placeholder="Ex: 7"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1"
                disabled={durationUnit === 'contínuo'}
              />
              <select
                data-testid="drug-duration-unit-select"
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="dias">dias</option>
                <option value="semanas">semanas</option>
                <option value="meses">meses</option>
                <option value="contínuo">Uso contínuo</option>
              </select>
            </div>
          </div>

          {/* Add Button */}
          <Button
            data-testid="drug-add-button"
            onClick={handleAdd}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar à Receita
          </Button>
        </div>
      )}
    </Card>
  );
}
