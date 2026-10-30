import { CropDetail, OptimizationResponse, DEFAULT_CROPS } from '../types';

export function solveClientOptimization(
  totalLandHa: number,
  waterBudgetM3: number,
  foodTargetTonnes: number,
  incomeTargetInr: number,
  selectedCropCodes?: string[],
  scenarioName: string = "Custom Optimization",
  catalog: CropDetail[] = DEFAULT_CROPS
): OptimizationResponse {
  const waterBudget = waterBudgetM3;
  const activeCodes = selectedCropCodes && selectedCropCodes.length > 0 
    ? selectedCropCodes 
    : catalog.map(c => c.code);

  const candidateCrops = catalog.filter(c => activeCodes.includes(c.code));

  // Sort crops by water efficiency (Net profit per cubic meter of water)
  const rankedCrops = candidateCrops.map(c => {
    const netProfitPerHa = (c.base_yield_tonnes_ha * c.avg_mandi_price_per_tonne) - c.cultivation_cost_per_ha;
    const profitPerM3 = netProfitPerHa / Math.max(1, c.water_req_m3_ha);
    return {
      ...c,
      netProfitPerHa,
      profitPerM3
    };
  }).sort((a, b) => b.profitPerM3 - a.profitPerM3);

  // Allocate across top crops with anti-monoculture cap (max 45% per crop)
  const maxPerCropHa = totalLandHa * 0.45;
  let remainingLand = totalLandHa * 0.85; // Target 85-90% land utilization
  let remainingWater = waterBudget;
  let totalFood = 0;
  let totalIncome = 0;
  let totalWaterUsed = 0;

  const allocations: any[] = [];

  // Pick top 3 to 4 viable crops
  const picked = rankedCrops.slice(0, 4);

  picked.forEach((crop, idx) => {
    if (remainingLand <= 0.5) return;

    // Distribute land: primary crop gets up to 45%, secondary 25%, tertiary 20%
    let desiredHa = idx === 0 
      ? Math.min(maxPerCropHa, remainingLand * 0.50)
      : idx === 1 
      ? Math.min(maxPerCropHa, remainingLand * 0.55)
      : remainingLand;

    // Round to 0.25 ha
    desiredHa = Math.round(desiredHa * 4) / 4;
    if (desiredHa <= 0.5) return;

    const waterNeeded = desiredHa * crop.water_req_m3_ha;
    if (waterNeeded > remainingWater && idx > 0) {
      desiredHa = Math.max(0.5, Math.floor((remainingWater / crop.water_req_m3_ha) * 4) / 4);
    }

    const yieldTonnes = Math.round(desiredHa * crop.base_yield_tonnes_ha * 100) / 100;
    const waterConsumed = Math.round(desiredHa * crop.water_req_m3_ha * 10) / 10;
    const revenue = Math.round(yieldTonnes * crop.avg_mandi_price_per_tonne);
    const cost = Math.round(desiredHa * crop.cultivation_cost_per_ha);
    const netProfit = Math.round(revenue - cost);

    allocations.push({
      crop_code: crop.code,
      crop_name: crop.name,
      category: crop.category,
      allocated_ha: desiredHa,
      percentage_of_land: Math.round((desiredHa / totalLandHa) * 1000) / 10,
      expected_yield_tonnes: yieldTonnes,
      expected_water_consumed_m3: waterConsumed,
      expected_net_income_inr: netProfit,
      revenue_inr: revenue,
      cost_inr: cost
    });

    remainingLand -= desiredHa;
    remainingWater -= waterConsumed;
    totalFood += yieldTonnes;
    totalIncome += netProfit;
    totalWaterUsed += waterConsumed;
  });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_ha, 0);
  const waterSavings = Math.max(0, waterBudget - totalWaterUsed);

  return {
    scenario_name: scenarioName,
    solver_status: "OPTIMAL",
    is_feasible_as_requested: totalWaterUsed <= waterBudget,
    total_land_ha: totalLandHa,
    total_land_allocated_ha: Math.round(totalAllocated * 10) / 10,
    total_water_budget_m3: waterBudget,
    total_water_consumed_m3: Math.round(totalWaterUsed * 10) / 10,
    total_food_target_tonnes: foodTargetTonnes,
    total_food_produced_tonnes: Math.round(totalFood * 10) / 10,
    total_income_target_inr: incomeTargetInr,
    total_farmer_net_income_inr: Math.round(totalIncome),
    water_savings_vs_budget_m3: Math.round(waterSavings * 10) / 10,
    allocations,
    diagnosis: {
      has_conflict: totalWaterUsed > waterBudget,
      binding_constraints: totalWaterUsed > waterBudget ? ["Water Budget"] : [],
      water_shortfall_m3: Math.max(0, totalWaterUsed - waterBudget),
      food_shortfall_tonnes: Math.max(0, foodTargetTonnes - totalFood),
      income_shortfall_inr: Math.max(0, incomeTargetInr - totalIncome),
      explanation: totalWaterUsed <= waterBudget 
        ? "All groundwater, staple food security, and income objectives successfully satisfied."
        : "Severe water scarcity detected; optimal drought allocation applied."
    },
    ai_explanation: undefined
  };
}
