import { test, expect } from '@playwright/test';

test('landing menampilkan template', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ivory Gold')).toBeVisible();
});

test('detail template merender undangan', async ({ page }) => {
  await page.goto('/templates/ivory-gold');
  await expect(page.getByText('Sena Ayudia').first()).toBeVisible();
  await expect(page.getByText('Panca Priyantoro').first()).toBeVisible();
});

test('builder demo memuat editor Puck + blok', async ({ page }) => {
  await page.goto('/builder/demo-x');
  await expect(page.locator('.invitation-canvas')).toBeVisible();
  await expect(page.getByText('Mempelai').first()).toBeVisible();
});

test('guest demo: cover → buka undangan → share muncul', async ({ page }) => {
  const canvas = {
    root: {
      props: {
        primary: '#3b5ba5',
        secondary: '#c9a227',
        background: '#fbf7f1',
        text: '#4a4036',
        fontHeading: 'Cormorant Garamond',
        fontBody: 'Jost',
        decor: [],
        guestBookEnabled: 'no',
        checkinEnabled: 'no',
        musicUrl: '',
        musicAutoplay: 'no'
      }
    },
    content: [
      {
        type: 'Cover',
        props: {
          id: 'c1',
          caption: 'The Wedding of',
          bride: 'Sena Ayudia',
          groom: 'Panca Priyantoro',
          date: '12 Desember 2026',
          buttonText: 'Buka Undangan',
          coverStyle: 'floral',
          entrance: 'none',
          position: { mode: 'flow', x: 0, y: 0 }
        }
      },
      {
        type: 'Hero',
        props: {
          id: 'h1',
          caption: 'The Wedding of',
          bride: 'Sena Ayudia',
          groom: 'Panca Priyantoro',
          date: '12 Desember 2026',
          bgImage: '',
          entrance: 'fade',
          position: { mode: 'flow', x: 0, y: 0 }
        }
      }
    ]
  };

  await page.addInitScript((data) => {
    const now = new Date().toISOString();
    window.localStorage.setItem(
      'di_demo_projects',
      JSON.stringify([{ id: 'e2e1', user_id: 'demo', title: 'E2E', slug: 'e2e-undangan', status: 'published', thumbnail: null, created_at: now, updated_at: now }])
    );
    window.localStorage.setItem('di_demo_designs', JSON.stringify({ e2e1: data }));
  }, canvas);

  await page.goto('/e2e-undangan');
  const openBtn = page.getByRole('button', { name: 'Buka Undangan', exact: true });
  await expect(openBtn).toBeVisible();
  await openBtn.click();
  await expect(page.getByLabel('Bagikan undangan')).toBeVisible();
});
