import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/apiClient";

interface CabinetColors {
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function adjustLightness(hsl: string, delta: number): string {
  const parts = hsl.split(" ");
  const h = parts[0];
  const s = parts[1];
  const l = parseInt(parts[2]);
  return `${h} ${s} ${Math.max(0, Math.min(100, l + delta))}%`;
}

const CSS_VARS = [
  "--primary", "--primary-light", "--primary-dark",
  "--accent", "--ring", "--foreground",
  "--card-foreground", "--popover-foreground",
  "--sidebar-primary", "--sidebar-accent", "--sidebar-ring",
  "--chart-1", "--chart-2",
];

function clearThemeVars() {
  const root = document.documentElement.style;
  CSS_VARS.forEach((v) => root.removeProperty(v));
}

export function useCabinetTheme() {
  const { user } = useAuth();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      if (appliedRef.current) {
        clearThemeVars();
        appliedRef.current = false;
      }
      return;
    }

    let cancelled = false;

    const applyTheme = async () => {
      try {
        const res = await apiClient.get<CabinetColors>("/admin/mon-cabinet");
        if (cancelled) return;

        const { couleurPrimaire } = res.data;
        if (!couleurPrimaire) return;

        const primary = hexToHsl(couleurPrimaire);
        const primaryLight = adjustLightness(primary, 24);
        const primaryDark = adjustLightness(primary, -9);

        const root = document.documentElement.style;
        root.setProperty("--primary", primary);
        root.setProperty("--primary-light", primaryLight);
        root.setProperty("--primary-dark", primaryDark);
        root.setProperty("--accent", primary);
        root.setProperty("--ring", primary);
        root.setProperty("--foreground", primaryDark);
        root.setProperty("--card-foreground", primaryDark);
        root.setProperty("--popover-foreground", primaryDark);
        root.setProperty("--sidebar-primary", primary);
        root.setProperty("--sidebar-accent", primary);
        root.setProperty("--sidebar-ring", primary);
        root.setProperty("--chart-1", primary);
        root.setProperty("--chart-2", primaryLight);
        appliedRef.current = true;
        console.log("[CabinetTheme] Couleurs appliquées:", couleurPrimaire, "→", primary);
      } catch (err) {
        console.error("[CabinetTheme] Erreur chargement couleurs:", err);
      }
    };

    applyTheme();

    return () => {
      cancelled = true;
      clearThemeVars();
      appliedRef.current = false;
    };
  }, [user]);
}
