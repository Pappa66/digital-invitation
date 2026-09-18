/** Confetti ringan (dynamic import agar tidak masuk bundle awal). */
export async function fireConfetti() {
  try {
    const mod = await import('canvas-confetti');
    const confetti = mod.default;
    confetti({
      particleCount: 120,
      spread: 80,
      startVelocity: 42,
      origin: { y: 0.6 },
      colors: ['#C9A227', '#D9A7A4', '#3B5BA5', '#FBF7F1']
    });
  } catch {
    /* abaikan bila gagal */
  }
}
