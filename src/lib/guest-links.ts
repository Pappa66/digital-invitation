/** Helper murni untuk link & pesan undangan personal (tanpa UI). */

/** Link undangan personal: `{origin}/{slug}?to={nama}`. */
export function guestLink(origin: string, slug: string | undefined, name: string): string {
  return `${origin}/${slug ?? ''}?to=${encodeURIComponent(name)}`;
}

/** Isi template pesan dengan nama & link. Mendukung placeholder `{nama}` dan `{link}`. */
export function guestMessage(template: string | undefined, name: string, link: string): string {
  return (template ?? 'Assalamualaikum {nama}, kami mengundang Anda ke acara pernikahan kami: {link}')
    .split('{nama}')
    .join(name)
    .split('{link}')
    .join(link);
}
