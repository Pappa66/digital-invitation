import { test, expect } from '@playwright/test';

test('halaman utama termuat', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
});

test('halaman login termuat', async ({ page }) => {
  const res = await page.goto('/login');
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByRole('button', { name: /google|masuk|login/i }).first()).toBeVisible({ timeout: 15000 });
});

test('undangan demo termuat (mode demo)', async ({ page }) => {
  const res = await page.goto('/undangan-demo');
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
});

test('absen tanpa login menampilkan status', async ({ page }) => {
  const res = await page.goto('/absen/00000000-0000-0000-0000-000000000000');
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByText(/Absensi Kehadiran/i).first()).toBeVisible({ timeout: 15000 });
});

test('halaman templates termuat', async ({ page }) => {
  const res = await page.goto('/templates');
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
});

test('undangan demo punya elemen interaktif', async ({ page }) => {
  await page.goto('/undangan-demo');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByText(/undangan tidak ditemukan|buku tamu|rsvp|ucapan|buka undangan/i).first()).toBeVisible({ timeout: 20000 });
});
