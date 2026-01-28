"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BuildingIcon,
  ComputerIcon,
  DatabaseIcon,
  FolderIcon,
  FileIcon,
  SettingsIcon,
  UserIcon,
  ShoppingBagIcon,
  HomeIcon,
  FactoryIcon,
  HospitalIcon,
  StoreIcon,
  SchoolIcon,
  BankIcon,
  HotelIcon,
  RestaurantIcon,
  CoffeeIcon,
  OfficeIcon,
  ServerStackIcon,
  MedicalFileIcon,
} from "@hugeicons/core-free-icons";

// Map of icon names to icon components
const iconMap: Record<string, any> = {
  BuildingIcon,
  ComputerIcon,
  ServerStackIcon,
  DatabaseIcon,
  FolderIcon,
  FileIcon,
  SettingsIcon,
  UserIcon,
  ShoppingBagIcon,
  HomeIcon,
  FactoryIcon,
  HospitalIcon,
  StoreIcon,
  SchoolIcon,
  BankIcon,
  HotelIcon,
  RestaurantIcon,
  CoffeeIcon,
  MedicalFileIcon,
  OfficeIcon,
};

// Default icon if none specified
const DEFAULT_ICON = ComputerIcon;

export const DEFAULT_ICON_NAME = "ComputerIcon";

interface DynamicIconProps {
  iconName?: string | null;
  strokeWidth?: number;
  className?: string;
}

export function DynamicIcon({
  iconName,
  strokeWidth = 2,
  className,
}: DynamicIconProps) {
  // Si pas d'icône spécifiée, ne rien afficher
  if (!iconName) {
    return null;
  }

  const Icon = iconMap[iconName] ? iconMap[iconName] : DEFAULT_ICON;

  return (
    <HugeiconsIcon
      icon={Icon}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}

// Export the icon map for use in the icon selector
export { iconMap };

// Export array of icon names for the selector
export const availableIcons = Object.keys(iconMap);
