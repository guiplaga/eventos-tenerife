import { useColorScheme } from "react-native";
import type { Category } from "./types";

// Rejilla de 8pt (plan seccion 9).
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, pill: 100 } as const;

const lightColors = {
  background: "#FFFFFF",
  surface: "#F2F2F2",
  border: "#E2E2E2",
  textPrimary: "#1C1C1E",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#0071CE",
  accentSurface: "#EAF4FD",
  accentContrast: "#FFFFFF",
  danger: "#C0392B",
  dangerSurface: "#FDECEC",
};

const darkColors = {
  background: "#000000",
  surface: "#1C1C1E",
  border: "#2C2C2E",
  textPrimary: "#F2F2F2",
  textSecondary: "#A1A1A6",
  textMuted: "#7C7C80",
  accent: "#3FA2F5",
  accentSurface: "#0F2A3D",
  accentContrast: "#FFFFFF",
  danger: "#FF6B5B",
  dangerSurface: "#3A1F1C",
};

// Color secundario y discreto por categoria (plan seccion 9: "color secundario
// solo para diferenciar categorias mediante puntos/etiquetas discretas").
// El mismo mapa sirve en claro y oscuro -- son tonos ya pensados para
// funcionar sobre superficies neutras de ambos temas.
export const categoryAccents: Record<Category, string> = {
  festival: "#8E5BD8",
  fuegos_artificiales: "#E0A400",
  teatro: "#C0392B",
  concierto: "#0071CE",
  fiesta_popular: "#2E9E5B",
  exposicion: "#8A5A2B",
  familiar: "#D9548F",
  deporte: "#1E8FA6",
  gastronomia: "#D9762B",
  otro: "#6B6B6B",
};

function makeTheme(colors: typeof lightColors, dark: boolean) {
  return { colors, spacing, radius, categoryAccents, dark };
}

const lightTheme = makeTheme(lightColors, false);
const darkTheme = makeTheme(darkColors, true);

export type Theme = typeof lightTheme;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
