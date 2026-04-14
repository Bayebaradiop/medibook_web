import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/apiClient";

interface CabinetColors {
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
}

const STORAGE_KEY = "medibook_cabinet_theme";

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
  "--accent", "--accent-foreground",
  "--ring",
  "--sidebar-background", "--sidebar-foreground", "--sidebar-border",
  "--sidebar-primary", "--sidebar-primary-foreground",
  "--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-ring",
  "--topbar-background",
  "--chart-1", "--chart-2",
  "--success",
];

function clearThemeVars() {
  const root = document.documentElement.style;
  CSS_VARS.forEach((v) => root.removeProperty(v));
}

function getCachedTheme(): { primaire: string; secondaire: string } | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedTheme(primaire: string, secondaire: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ primaire, secondaire }));
}

function clearCachedTheme() {
  localStorage.removeItem(STORAGE_KEY);
}

function applyThemeColors(couleurPrimaire: string, couleurSecondaire: string | null) {
  const primary = hexToHsl(couleurPrimaire);
  const primaryLight = adjustLightness(primary, 24);
  const primaryDark = adjustLightness(primary, -9);

  const root = document.documentElement.style;

  root.setProperty("--primary", primary);
  root.setProperty("--primary-light", primaryLight);
  root.setProperty("--primary-dark", primaryDark);
  root.setProperty("--ring", primary);
  root.setProperty("--chart-1", primary);

  root.setProperty("--sidebar-background", primary);
  root.setProperty("--sidebar-foreground", "0 0% 100%");
  root.setProperty("--sidebar-border", primaryLight);
  root.setProperty("--sidebar-primary", primary);
  root.setProperty("--sidebar-primary-foreground", "0 0% 100%");
  root.setProperty("--sidebar-ring", primary);

  if (couleurSecondaire) {
    const secondary = hexToHsl(couleurSecondaire);
    const secondaryLight = adjustLightness(secondary, 15);
    root.setProperty("--accent", secondary);
    root.setProperty("--accent-foreground", "0 0% 100%");
    root.setProperty("--sidebar-accent", secondary);
    root.setProperty("--sidebar-accent-foreground", "0 0% 100%");
    root.setProperty("--topbar-background", secondary);
    root.setProperty("--success", secondary);
    root.setProperty("--chart-2", secondaryLight);
  } else {
    root.setProperty("--accent", primaryLight);
    root.setProperty("--sidebar-accent", primaryLight);
    root.setProperty("--topbar-background", primaryDark);
    root.setProperty("--chart-2", primaryLight);
  }
}

export function useCabinetTheme() {
  const { user } = useAuth();
  const appliedRef = useRef(false);

  useEffect(() => {
    const endpointByRole = {
      ADMIN: "/admin/mon-cabinet",
      MEDECIN: "/medecin/mon-cabinet",
      SECRETAIRE: "/secretaire/mon-cabinet",
    } as const;

    if (!user?.role || !(user.role in endpointByRole)) {
      if (appliedRef.current) {
        clearThemeVars();
        clearCachedTheme();
        appliedRef.current = false;
      }
      return;
    }

    const cached = getCachedTheme();
    if (cached && !appliedRef.current) {
      applyThemeColors(cached.primaire, cached.secondaire);
    }

    let cancelled = false;

    const applyTheme = async () => {
      try {
        const endpoint = endpointByRole[user.role];
        const res = await apiClient.get<CabinetColors>(endpoint);
        if (cancelled) return;

        const { couleurPrimaire, couleurSecondaire } = res.data;

        if (!couleurPrimaire) {
          return;
        }

        applyThemeColors(couleurPrimaire, couleurSecondaire);
        setCachedTheme(couleurPrimaire, couleurSecondaire || "");
        appliedRef.current = true;
      } catch (err) {
        console.error("[CabinetTheme] Erreur chargement couleurs:", err);
      }
    };

    applyTheme();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
