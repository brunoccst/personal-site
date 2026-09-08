import { useTranslation } from 'react-i18next';

// Reads an array value out of the locale files and types its entries.
export function useTranslatedList<T>(key: string): T[] {
  const { t } = useTranslation();
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? (value as T[]) : [];
}
