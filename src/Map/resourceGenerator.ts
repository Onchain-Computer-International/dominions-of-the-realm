interface Resources {
  gold: number;
  production: number;
  food: number;
  science: number;
}

export function generateResources(): Resources {
  return {
    gold: 0,
    production: 0,
    food: 0,
    science: 0
  };
} 