import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';

import { persistLanguage, type Language } from '../../i18n';
import { useThemeMode } from '../../theme/themeContext';
import styles from './SystemControls.module.scss';

// Maps each language to the one the toggle switches to.
const NEXT_LANGUAGE: Record<Language, Language> = { en: 'pt', pt: 'en' };

// Site-wide options placed outside the frame, in the top-right corner.
export function SystemControls() {
  const { t, i18n } = useTranslation();
  const { mode, toggleMode } = useThemeMode();

  const currentLanguage = (i18n.resolvedLanguage ?? 'en') as Language;
  const nextLanguage = NEXT_LANGUAGE[currentLanguage] ?? 'pt';

  const toggleLanguage = useCallback(() => {
    void i18n.changeLanguage(nextLanguage);
    persistLanguage(nextLanguage);
  }, [i18n, nextLanguage]);

  const themeLabel = mode === 'dark' ? t('controls.theme.toLight') : t('controls.theme.toDark');

  return (
    <div className={styles.controls} role="group" aria-label={t('controls.label')}>
      <Tooltip title={t('controls.language')}>
        <IconButton
          className={styles.button}
          onClick={toggleLanguage}
          aria-label={t('controls.language')}
          size="small"
        >
          <TranslateRounded fontSize="small" />
          <span className={styles.code} aria-hidden="true">
            {currentLanguage.toUpperCase()}
          </span>
        </IconButton>
      </Tooltip>

      <Tooltip title={themeLabel}>
        <IconButton
          className={styles.button}
          onClick={toggleMode}
          aria-label={themeLabel}
          aria-pressed={mode === 'dark'}
          size="small"
        >
          {mode === 'dark' ? (
            <LightModeRounded fontSize="small" />
          ) : (
            <DarkModeRounded fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
}
