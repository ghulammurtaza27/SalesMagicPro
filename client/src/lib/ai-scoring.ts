interface LeadData {
  budgetRange?: string;
  timeline?: string;
  employeeCount?: string;
  industry?: string;
}

export function calculateAIScore(lead: LeadData): number {
  let score = 50; // Base score

  // Budget scoring
  if (lead.budgetRange?.includes("$150K+")) score += 25;
  else if (lead.budgetRange?.includes("$75K - $150K")) score += 20;
  else if (lead.budgetRange?.includes("$30K - $75K")) score += 15;
  else if (lead.budgetRange?.includes("$15K - $30K")) score += 10;

  // Timeline scoring
  if (lead.timeline === "Immediate") score += 20;
  else if (lead.timeline === "1-3 months") score += 15;
  else if (lead.timeline === "3-6 months") score += 10;

  // Employee count scoring
  if (lead.employeeCount?.includes("1000+")) score += 15;
  else if (lead.employeeCount?.includes("201-1000")) score += 12;
  else if (lead.employeeCount?.includes("51-200")) score += 8;
  else if (lead.employeeCount?.includes("11-50")) score += 5;

  // Industry fit
  const highValueIndustries = ["Healthcare", "Technology", "Finance"];
  if (lead.industry && highValueIndustries.includes(lead.industry)) score += 10;

  return Math.min(100, Math.max(0, score));
}
