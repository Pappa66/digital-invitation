/** Satu-satunya akun yang diizinkan mengakses area internal. */
export const ALLOWED_EMAIL = 'digitalprasha@gmail.com';

export function isAllowedEmail(email: string | null | undefined): boolean {
  return typeof email === 'string' && email.trim().toLowerCase() === ALLOWED_EMAIL;
}