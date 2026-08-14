/** Kategori standar template + makna/filosofi yang dilambangkannya. */
export const CATEGORIES = [
  {
    key: 'classic',
    label: 'Classic',
    desc: 'Mewah dan abadi, seperti warisan yang turun-temurun. Melambangkan kesetiaan yang tidak lekang oleh waktu: emas, tradisi, dan keanggunan yang santun.'
  },
  {
    key: 'modern',
    label: 'Modern',
    desc: 'Bersih dan berani, seperti cinta yang tegas dan apa adanya. Melambangkan kesederhanaan yang cerdas: ruang kosong berbicara, hierarki yang jernih, masa kini.'
  },
  {
    key: 'outdoor',
    label: 'Outdoor',
    desc: 'Sejuk dan bebas, seperti taman, pantai, dan langit terbuka. Melambangkan kebersamaan yang hangat dan kebebasan merayakan cinta di alam — dekat dan penuh cahaya.'
  },
  {
    key: 'romance',
    label: 'Romance',
    desc: 'Lembut dan puitis, seperti kisah dongeng yang berakhir bahagia. Melambangkan kelembutan, kasih sayang, dan hati yang terbuka untuk jatuh cinta.'
  }
] as const;

export type TemplateCategory = (typeof CATEGORIES)[number]['key'];

const LABELS: Record<TemplateCategory, string> = {
  classic: 'Classic',
  modern: 'Modern',
  outdoor: 'Outdoor',
  romance: 'Romance'
};

/** Label aman untuk nilai category dari index.json (bisa saja label lama). */
export function categoryLabel(category: string | undefined): string {
  if (!category) return 'Classic';
  const key = category.toLowerCase();
  return LABELS[key as TemplateCategory] ?? 'Classic';
}