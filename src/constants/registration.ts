export const USER_TITLES = [
  { value: 'MR', label: 'Mr' },
  { value: 'MRS', label: 'Mrs' },
  { value: 'MS', label: 'Ms' },
  { value: 'MISS', label: 'Miss' },
  { value: 'MX', label: 'Mx' },
  { value: 'DR', label: 'Dr' },
] as const;

export type UserTitleValue = (typeof USER_TITLES)[number]['value'];

export const NATIONALITIES = [
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CA', label: 'Canada' },
  { value: 'CN', label: 'China' },
  { value: 'DE', label: 'Germany' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IN', label: 'India' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MX', label: 'Mexico' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Türkiye' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'US', label: 'United States' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'ZA', label: 'South Africa' },
] as const;

export const MIN_REGISTRATION_AGE = 18;
