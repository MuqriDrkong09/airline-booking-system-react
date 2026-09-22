export type { Addon, AddonPassengerType } from './constants/addons';
export { ADDON_CATALOG, formatAddonPrice } from './constants/addons';
export type { AddonPassenger, AddonSelection } from './types/addon';
export {
  addonsForPassenger,
  calculateAddonTotal,
  calculateBookingTotal,
  getAddonById,
  hasAddonSelection,
  isAddonApplicable,
  removeAddon,
  selectAddon,
  toggleAddon,
  validateAddonSelections,
} from './utils/addonRules';
export type { AddonValidationResult } from './utils/addonRules';
export { AddonCard } from './components/AddonCard';
export type { AddonCardProps } from './components/AddonCard';
export { AddonSelector } from './components/AddonSelector';
export type { AddonSelectorProps } from './components/AddonSelector';
export { AddonSummary } from './components/AddonSummary';
export type { AddonSummaryProps } from './components/AddonSummary';
export { AddonSelectionPanel } from './components/AddonSelectionPanel';
export type { AddonSelectionPanelProps } from './components/AddonSelectionPanel';
