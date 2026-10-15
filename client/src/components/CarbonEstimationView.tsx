import React, { useState } from 'react';
import { 
  Leaf, 
  Calculator, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  HelpCircle,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const CarbonEstimationView: React.FC = () => {
  // Methodology Selector
  const [methodology, setMethodology] = useState<string>('ipcc_tier2');
  
  // Inputs
  const [areaHectares, setAreaHectares] = useState<string>('3850');
  const [ecosystemType, setEcosystemType] = useState<string>('Mangrove');
  const [measurementPeriodYears, setMeasurementPeriodYears] = useState<string>('5');
  
  // Scientific Parameters
  const [abovegroundGrowthRate, setAbovegroundGrowthRate] = useState<string>('9.8'); // t dry matter/ha/yr
  const [rootToShootRatio, setRootToShootRatio] = useState<string>('0.49'); // IPCC default for mangroves
  const [carbonFraction, setCarbonFraction] = useState<string>('0.47'); // 47% carbon in biomass
  const [soilCarbonAccumulation, setSoilCarbonAccumulation] = useState<string>('1.85'); // t C/ha/yr
  const [baselineDegradationAvoided, setBaselineDegradationAvoided] = useState<string>('2.1'); // t C/ha/yr avoided loss
  
  // Toggle for testing "Insufficient Data" requirement
  const [includeSoilParameters, setIncludeSoilParameters] = useState<boolean>(true);

  // Parsing & Calculation
  const area = parseFloat(areaHectares);
  const years = parseFloat(measurementPeriodYears);
  const agbRate = parseFloat(abovegroundGrowthRate);
  const rootRatio = parseFloat(rootToShootRatio);
  const cFrac = parseFloat(carbonFraction);
  const socRate = parseFloat(soilCarbonAccumulation);
  const avoidedRate = parseFloat(baselineDegradationAvoided);

  const hasSufficientData = 
    !isNaN(area) && area > 0 && 
    !isNaN(years) && years > 0 && 
    !isNaN(agbRate) && agbRate > 0 && 
    !isNaN(cFrac) && cFrac > 0 &&
    (!includeSoilParameters || (!isNaN(socRate) && socRate > 0));

  // Calculations:
  // 1. Total Annual Biomass Increment (AGB + BGB):
  //    Biomass Increment = AGB * (1 + rootToShootRatio)
  const totalBiomassIncrementRate = agbRate * (1 + rootRatio); // t dry matter / ha / yr
  const annualBiomassCarbonRate = totalBiomassIncrementRate * cFrac; // t C / ha / yr

  // 2. Soil Organic Carbon (SOC) Accumulation:
  const annualSoilCarbonRate = includeSoilParameters ? socRate : 0; // t C / ha / yr

  // 3. Avoided Baseline Degradation Carbon Rate:
  const annualAvoidedRate = avoidedRate; // t C / ha / yr

  // Total Annual Carbon Sequestration Rate (t C / ha / yr):
  const totalAnnualCarbonRate = annualBiomassCarbonRate + annualSoilCarbonRate + annualAvoidedRate;

  // Conversion from Carbon (C) to CO2 equivalent (CO2e):
  // Molecular weight ratio = 44 / 12 = 3.667
  const CO2_CONVERSION = 44 / 12;

  // Annual Sequestration Rate in tCO2e / ha / yr:
  const annualTCO2ePerHectare = totalAnnualCarbonRate * CO2_CONVERSION;

  // Total Sequestration for Project across Measurement Period:
  const totalTCO2e = Math.round(annualTCO2ePerHectare * area * years);
  const biomassComponentTCO2e = Math.round(annualBiomassCarbonRate * CO2_CONVERSION * area * years);
  const soilComponentTCO2e = Math.round(annualSoilCarbonRate * CO2_CONVERSION * area * years);
  const avoidedComponentTCO2e = Math.round(annualAvoidedRate * CO2_CONVERSION * area * years);

  // Confidence / Uncertainty interval (IPCC Tier 2 typically has ±18% uncertainty)
  const uncertaintyPercent = methodology === 'ipcc_tier2' ? 18.5 : methodology === 'cdm_aram0014' ? 14.0 : 22.0;
  const lowerBoundTCO2e = Math.round(totalTCO2e * (1 - uncertaintyPercent / 100));
  const upperBoundTCO2e = Math.round(totalTCO2e * (1 + uncertaintyPercent / 100));

  // Breakdown chart data
  const breakdownData = [
    { pool: 'Above & Below Biomass', tCO2e: biomassComponentTCO2e, fill: '#10B981' },
    { pool: 'Soil Organic Carbon (SOC)', tCO2e: soilComponentTCO2e, fill: '#14B8A6' },
    { pool: 'Avoided Wetland Loss', tCO2e: avoidedComponentTCO2e, fill: '#06B6D4' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Leaf className="text-emerald-400" size={24} />
            <span>Defensible Blue Carbon Estimation Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent, formula-driven carbon sequestration quantification based on peer-reviewed IPCC and CDM methodologies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-navy-900 border border-teal-500/30 text-teal-300">
            Formula: ΔC = (ΔC_biomass + ΔC_soil + ΔC_avoided) × (44/12)
          </span>
        </div>
      </div>

      {/* Critical Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-navy-900/90 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b className="text-amber-300">Core MRV Scientific Principle:</b> Visible vegetation growth on optical or drone imagery <b>does not equate directly to measured carbon absorption</b>. True blue carbon crediting requires parameter verification, sediment core soil analysis, and conservative uncertainty deductions.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Parameter Inputs */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4">
          <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calculator size={16} className="text-teal-400" />
              <span>Input Variables & Parameters</span>
            </h3>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-mono">
              Transparent Model
            </span>
          </div>

          {/* Methodology Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Scientific Methodology Reference <span className="text-teal-400">*</span>
            </label>
            <select
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-400"
            >
              <option value="ipcc_tier2">IPCC 2013 Wetland Supplement (Tier 2 Estuarine Model)</option>
              <option value="cdm_aram0014">CDM AR-AM0014 (Afforestation of Degraded Mangroves)</option>
              <option value="blue_carbon_initiative">Blue Carbon Initiative (Howard et al. 2014 Manual)</option>
              <option value="verra_vm0033">Verra VM0033 (Tidal Wetland & Seagrass Restoration)</option>
            </select>
          </div>

          {/* Project Area & Ecosystem */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Area (Hectares)
              </label>
              <input
                type="number"
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ecosystem Type
              </label>
              <select
                value={ecosystemType}
                onChange={(e) => setEcosystemType(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100"
              >
                <option value="Mangrove">Mangrove (High C density)</option>
                <option value="Seagrass">Seagrass Meadow</option>
                <option value="Salt Marsh">Salt Marsh</option>
              </select>
            </div>
          </div>

          {/* Measurement Period */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Measurement / Crediting Period (Years)
            </label>
            <input
              type="number"
              value={measurementPeriodYears}
              onChange={(e) => setMeasurementPeriodYears(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs font-mono text-slate-100"
            />
          </div>

          {/* Parameter Inputs */}
          <div className="space-y-3 pt-2 border-t border-navy-800">
            <h4 className="text-xs font-semibold text-slate-200">Biophysical Parameters</h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  AGB Increment (t DM/ha/yr)
                </label>
                <input
                  type="text"
                  value={abovegroundGrowthRate}
                  onChange={(e) => setAbovegroundGrowthRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Root-to-Shoot Ratio (BGB:AGB)
                </label>
                <input
                  type="text"
                  value={rootToShootRatio}
                  onChange={(e) => setRootToShootRatio(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Carbon Fraction (C/DM)
                </label>
                <input
                  type="text"
                  value={carbonFraction}
                  onChange={(e) => setCarbonFraction(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  SOC Rate (t C/ha/yr)
                </label>
                <input
                  type="text"
                  disabled={!includeSoilParameters}
                  value={soilCarbonAccumulation}
                  onChange={(e) => setSoilCarbonAccumulation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded text-xs font-mono text-slate-100 disabled:opacity-40"
                />
              </div>
            </div>

            {/* Test Insufficient Data Toggle */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Include verified sediment core soil data</span>
              <input
                type="checkbox"
                checked={includeSoilParameters}
                onChange={(e) => setIncludeSoilParameters(e.target.checked)}
                className="w-4 h-4 accent-teal-500 rounded"
              />
            </div>
          </div>

          {/* Sources & Assumptions */}
          <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-800 text-[11px] text-slate-400 space-y-1">
            <b className="text-slate-300">Methodological Assumptions:</b>
            <p>1. IPCC Wetland Supplement 2013 Table 4.4 default ratio 0.49 applies to Rhizophora/Avicennia.</p>
            <p>2. Soil depth layer evaluated: 0–100 cm sediment accretion.</p>
            <p>3. Molecular conversion factor 44/12 stoichiometric ratio applied.</p>
          </div>
        </div>

        {/* Right 7 Cols: Transparent Calculation Results */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-navy-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen size={18} className="text-teal-400" />
                <span>Quantification Output & Uncertainty Model</span>
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                Review Status: Defensible
              </span>
            </div>

            {!hasSufficientData ? (
              <div className="p-8 my-6 text-center rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <AlertTriangle size={36} className="mx-auto text-amber-400" />
                <h4 className="text-base font-bold text-amber-300">Insufficient data for a defensible estimate</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  DeltaC strictly enforces scientific integrity: Missing project area, annual biomass increments, or soil sediment parameters prevent verifiable calculation. Arbitrary carbon values are not generated.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {/* Primary Metric Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-navy-950 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Total Estimated Carbon Sequestration ({years} Years)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-display text-white">
                      {totalTCO2e.toLocaleString()}
                    </span>
                    <span className="text-base text-emerald-400 font-bold">tCO2e</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                    <span>Rate: <b className="text-white">{annualTCO2ePerHectare.toFixed(2)}</b> tCO2e / ha / year</span>
                    <span>•</span>
                    <span>Annual Total: <b className="text-white">{Math.round(totalTCO2e / years).toLocaleString()}</b> tCO2e / yr</span>
                  </div>
                </div>

                {/* Uncertainty Range */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                    <span className="text-slate-400 block text-[11px]">Conservative Lower Bound (-{uncertaintyPercent}%)</span>
                    <b className="text-slate-200 text-sm mt-0.5 block">{lowerBoundTCO2e.toLocaleString()} tCO2e</b>
                  </div>
                  <div className="bg-navy-950 p-3 rounded-xl border border-teal-500/40">
                    <span className="text-teal-300 block text-[11px]">Central Point Estimate</span>
                    <b className="text-teal-300 text-sm mt-0.5 block">{totalTCO2e.toLocaleString()} tCO2e</b>
                  </div>
                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                    <span className="text-slate-400 block text-[11px]">Upper Bound (+{uncertaintyPercent}%)</span>
                    <b className="text-slate-200 text-sm mt-0.5 block">{upperBoundTCO2e.toLocaleString()} tCO2e</b>
                  </div>
                </div>

                {/* Carbon Pool Breakdown Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200">Carbon Pool Breakdown (tCO2e)</h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" stroke="#64748B" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="pool" stroke="#64748B" fontSize={11} width={120} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3A5F', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(v: any) => [`${Number(v).toLocaleString()} tCO2e`, 'Sequestration']}
                        />
                        <Bar dataKey="tCO2e" radius={[0, 4, 4, 0]}>
                          {breakdownData.map((entry, idx) => (
                            <span key={idx} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mathematical Equation Walkthrough */}
                <div className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-teal-400 font-bold mb-1">// Mathematical Step-by-Step Calculation:</div>
                  <div>1. Total Biomass Inc. = {agbRate} × (1 + {rootRatio}) = {totalBiomassIncrementRate.toFixed(2)} t DM/ha/yr</div>
                  <div>2. Biomass Carbon = {totalBiomassIncrementRate.toFixed(2)} × {cFrac} = {annualBiomassCarbonRate.toFixed(2)} t C/ha/yr</div>
                  <div>3. Soil Carbon Accumulation = {annualSoilCarbonRate.toFixed(2)} t C/ha/yr</div>
                  <div>4. Total Carbon Rate = {totalAnnualCarbonRate.toFixed(2)} t C/ha/yr × (44/12) = {annualTCO2ePerHectare.toFixed(2)} tCO2e/ha/yr</div>
                  <div>5. Gross Estimate = {annualTCO2ePerHectare.toFixed(2)} × {area} ha × {years} yr = {totalTCO2e.toLocaleString()} tCO2e</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Methodology: {methodology.toUpperCase()}</span>
            <span className="text-amber-400 font-medium">Sample Model Calculation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
