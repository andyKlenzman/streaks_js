// ABOUTME: About page overlay — minimal structure, content to be populated later
// ABOUTME: Renders as a full-screen overlay toggled from the account bar

export const createAboutOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'about-overlay';

  overlay.innerHTML = `
    <div class="about-panel">
      <button class="about-close-btn" aria-label="Close">✕</button>

      <h1 class="about-title">Streaks</h1>

      <section class="about-section">
        <h2 class="about-section-title">What is this?</h2>
        <p class="about-section-body about-placeholder">Coming soon.</p>
      </section>

      <section class="about-section">
        <h2 class="about-section-title">How it works</h2>
        <p class="about-section-body about-placeholder">Coming soon.</p>
      </section>

      <section class="about-section">
        <h2 class="about-section-title">Credits</h2>
        <p class="about-section-body about-placeholder">Coming soon.</p>
      </section>
    </div>
  `;

  document.body.append(overlay);

  const close = () => overlay.classList.remove('visible');
  const show = () => overlay.classList.add('visible');

  overlay.querySelector('.about-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { show, close };
};
