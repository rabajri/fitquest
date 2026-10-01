// Standard healthy BMI range
const MIN_HEALTHY_BMI = 18.5;
const MAX_HEALTHY_BMI = 24.9;

export function getHealthyWeightRangeKg(heightCm: number) {
  const heightM = heightCm / 100;
  const min = MIN_HEALTHY_BMI * heightM * heightM;
  const max = MAX_HEALTHY_BMI * heightM * heightM;
  return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
}

export function isWeightInHealthyRange(weightKg: number, heightCm: number) {
  const { min, max } = getHealthyWeightRangeKg(heightCm);
  return weightKg >= min && weightKg <= max;
}

