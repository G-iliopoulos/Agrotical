// ─── ΠΡΟΣΘΗΚΗ στο src/app/data/mockData.ts ───────────────────────────────────
// Τοποθετείται στο τέλος του αρχείου, πριν από το getCropById()

export function getFarmerTotals(farmerId: string) {
  const farmerFields = getFieldsByFarmer(farmerId);
  let totalAcres = 0, totalRevenue = 0, totalCosts = 0, totalProfit = 0, totalYield = 0;

  farmerFields.forEach(field => {
    const fin = calculateFieldFinancials(field);
    totalAcres   += field.acres;
    totalRevenue += fin.estimatedRevenue;
    totalCosts   += fin.estimatedCosts;
    totalProfit  += fin.estimatedProfit;
    totalYield   += fin.estimatedYield;
  });

  return {
    totalAcres,
    totalRevenue,
    totalCosts,
    totalProfit,
    totalYield,
    fieldCount:      farmerFields.length,
    avgProfitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
  };
}
