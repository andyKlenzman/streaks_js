// ABOUTME: Pure DOM factory functions for the weekly habit tracker UI
// ABOUTME: Builds habit cards with 7-day circles, add-habit input, and week navigation

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CHECKMARK_SVG = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M4.5 9.5L7.5 12.5L13.5 6" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const INFO_SVG = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>
  <rect x="4.85" y="4.5" width="1.3" height="3.5" rx="0.65" fill="currentColor"/>
  <circle cx="5.5" cy="3.2" r="0.7" fill="currentColor"/>
</svg>`;

//////////////////////////////////////////////////////
// Add habit row
//////////////////////////////////////////////////////

export const createAddHabitRow = (onAdd) => {
  const row = document.createElement('div');
  row.className = 'add-habit-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'add-habit-input';
  input.placeholder = 'New habit…';
  input.setAttribute('aria-label', 'New habit name');

  const btn = document.createElement('button');
  btn.className = 'add-habit-btn';
  btn.textContent = '+ Add';

  const submit = () => {
    const name = input.value.trim();
    if (!name) return;
    onAdd(name);
    input.value = '';
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  row.append(input, btn);
  return row;
};

//////////////////////////////////////////////////////
// Day cell (label + circle)
//////////////////////////////////////////////////////

export const createDayCell = ({ dayOfWeek, isToday, isCompleted, isFuture, onToggle }) => {
  const cell = document.createElement('div');
  cell.className = 'day-cell';

  const label = document.createElement('span');
  label.className = 'day-label' + (isToday ? ' today' : '');
  label.textContent = DAY_LABELS[dayOfWeek];

  const circle = document.createElement('button');
  circle.className =
    'day-circle' +
    (isCompleted ? ' completed' : '') +
    (isFuture ? ' future' : '');
  circle.innerHTML = `<span class="checkmark">${CHECKMARK_SVG}</span>`;
  circle.setAttribute('aria-label', DAY_LABELS[dayOfWeek] + (isCompleted ? ' (done)' : ''));
  circle.setAttribute('aria-pressed', String(isCompleted));

  if (!isFuture) {
    circle.addEventListener('click', () => onToggle(circle));
  }

  cell.append(label, circle);
  return { cell, circle };
};

//////////////////////////////////////////////////////
// Habit card
//////////////////////////////////////////////////////

export const createHabitCard = ({ id, name, weekDays, onDayToggle, onInfo }) => {
  const card = document.createElement('div');
  card.className = 'habit-card';
  card.dataset.groupId = id;

  // Header
  const header = document.createElement('div');
  header.className = 'habit-card-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'habit-card-name';
  nameEl.textContent = name;

  const infoBtn = document.createElement('button');
  infoBtn.className = 'habit-info-btn';
  infoBtn.innerHTML = INFO_SVG;
  infoBtn.setAttribute('aria-label', `Info for ${name}`);
  infoBtn.addEventListener('click', (e) => onInfo(e, id));

  header.append(nameEl, infoBtn);

  // Day row
  const dayRow = document.createElement('div');
  dayRow.className = 'day-row';

  weekDays.forEach((day) => {
    const { cell } = createDayCell({
      dayOfWeek: day.dayOfWeek,
      isToday: day.isToday,
      isCompleted: day.isCompleted,
      isFuture: day.isFuture,
      onToggle: (circleEl) => onDayToggle(id, day.date, circleEl),
    });
    dayRow.append(cell);
  });

  card.append(header, dayRow);
  return card;
};

//////////////////////////////////////////////////////
// Week navigation
//////////////////////////////////////////////////////

export const createWeekNav = ({ weekLabel, canGoNext, onPrev, onNext }) => {
  const nav = document.createElement('div');
  nav.className = 'week-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'week-nav-btn';
  prevBtn.textContent = '← Previous';
  prevBtn.addEventListener('click', onPrev);

  const label = document.createElement('span');
  label.className = 'week-nav-label';
  label.textContent = weekLabel;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'week-nav-btn';
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = !canGoNext;
  nextBtn.addEventListener('click', onNext);

  nav.append(prevBtn, label, nextBtn);
  return { nav, prevBtn, nextBtn, label };
};

//////////////////////////////////////////////////////
// Info popup (singleton, positioned by JS)
//////////////////////////////////////////////////////

export const createInfoPopup = () => {
  const popup = document.createElement('div');
  popup.className = 'info-popup';
  document.body.append(popup);
  return popup;
};

//////////////////////////////////////////////////////
// App shell
//////////////////////////////////////////////////////

export const createWeeklyAppShell = () => {
  const app = document.createElement('div');
  app.id = 'weekly-app';

  const habitList = document.createElement('div');
  habitList.className = 'habit-list';

  app.append(habitList);
  return { app, habitList };
};

export const createAccountBar = ({ userEmail, onSignOut, onAbout }) => {
  const bar = document.createElement('div');
  bar.className = 'account-bar';

  const emailEl = document.createElement('span');
  emailEl.className = 'account-email';
  emailEl.textContent = userEmail || '';

  const right = document.createElement('div');
  right.className = 'account-bar-right';

  const aboutBtn = document.createElement('button');
  aboutBtn.className = 'account-about-btn';
  aboutBtn.textContent = 'About';
  aboutBtn.addEventListener('click', onAbout);

  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'account-signout-btn';
  signOutBtn.textContent = 'Sign out';
  signOutBtn.addEventListener('click', onSignOut);

  right.append(aboutBtn, signOutBtn);
  bar.append(emailEl, right);
  return bar;
};
