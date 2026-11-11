import { useI18n } from 'vue-i18n';
export function useFormat() {
  const { locale, t, te } = useI18n();
  const number = value => new Intl.NumberFormat(locale.value).format(value);
  const money = (value, currency = 'USD') => new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(value);
  const date = value => value ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value)) : '—';
  const status = value => te('statuses.' + value) ? t('statuses.' + value) : value;
  return { number, money, date, status };
}
