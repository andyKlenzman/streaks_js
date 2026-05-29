// ABOUTME: Weekly view controller — wires the weekly UI to the Firebase-backed Model
// ABOUTME: Manages week offset, day toggle (add/remove timestamps), and info popup

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { Model } from '../model/model';
import {
  createAddHabitRow,
  createAccountBar,
  createHabitCard,
  createWeekNav,
  createInfoPopup,
  createWeeklyAppShell,
} from '../view/weeklyView';
import { createAboutOverlay } from '../view/aboutView';

//////////////////////////////////////////////////////
// Date helpers
//////////////////////////////////////////////////////

// Returns 'YYYY-MM-DD' for a Date object in local time
const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Returns the 7 day descriptors for the week at the given offset (0 = current week)
const getWeekDates = (weekOffset) => {
  const today = new Date();
  const todayStr = toDateStr(today);
  // Sunday of the current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = toDateStr(d);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    return {
      date: dateStr,
      dayOfWeek: i, // 0 = Su, 6 = Sa
      isToday,
      isFuture,
      isPast: !isToday && !isFuture,
    };
  });
};

const formatWeekLabel = (weekDates) => {
  const fmt = (s) => s.slice(5).replace('-', '.');
  return `${fmt(weekDates[0].date)} – ${fmt(weekDates[6].date)}`;
};

// Returns true if any timestamp falls on the given 'YYYY-MM-DD' date
const isCompletedOnDate = (timestamps, dateStr) =>
  timestamps.some((ts) => ts.startsWith(dateStr));

// Returns the first timestamp that falls on the given date, or undefined
const findTimestampForDate = (timestamps, dateStr) =>
  timestamps.find((ts) => ts.startsWith(dateStr));

//////////////////////////////////////////////////////
// Module state
//////////////////////////////////////////////////////

let weekOffset = 0;
let groups = {}; // local mirror of Model state: { [id]: { groupName, timestamps[] } }
let habitListEl = null;
let weekNavEl = null;
let infoPopup = null;
let openInfoGroupId = null;
let pastEditToast = null;
let pastEditToastTimer = null;

const showPastEditWarning = () => {
  if (!pastEditToast) {
    pastEditToast = document.createElement('div');
    pastEditToast.className = 'past-edit-toast';
    pastEditToast.textContent = '⚠ Editing past entry';
    document.body.append(pastEditToast);
  }
  clearTimeout(pastEditToastTimer);
  pastEditToast.classList.add('visible');
  pastEditToastTimer = setTimeout(() => pastEditToast.classList.remove('visible'), 2500);
};

//////////////////////////////////////////////////////
// Info popup
//////////////////////////////////////////////////////

const renderInfoPopup = (e, groupId) => {
  // Toggle: clicking the same group closes the popup
  if (openInfoGroupId === groupId) {
    infoPopup.classList.remove('visible');
    openInfoGroupId = null;
    return;
  }

  const data = Model.getStreakDataForGroup(groupId);
  if (!data) return;

  infoPopup.innerHTML = `
    <div class="info-popup-row">
      <span class="info-popup-label">Current</span>
      <span class="info-popup-value">${data.currentStreak} days</span>
    </div>
    <div class="info-popup-row">
      <span class="info-popup-label">Best</span>
      <span class="info-popup-value">${data.largestStreak} days</span>
    </div>
    <div class="info-popup-row">
      <span class="info-popup-label">Total</span>
      <span class="info-popup-value">${data.totalCompletions} / ${data.totalIntervals}</span>
    </div>
  `;

  // Position below the info button
  const rect = e.currentTarget.getBoundingClientRect();
  infoPopup.style.top = `${rect.bottom + window.scrollY + 8}px`;
  // Align right edge of popup with right edge of button
  const rightOffset = document.documentElement.clientWidth - rect.right;
  infoPopup.style.right = `${rightOffset}px`;
  infoPopup.style.left = 'auto';

  infoPopup.classList.add('visible');
  openInfoGroupId = groupId;
};

// Close popup when clicking outside
document.addEventListener('click', (e) => {
  if (openInfoGroupId && !e.target.closest('.habit-info-btn')) {
    infoPopup?.classList.remove('visible');
    openInfoGroupId = null;
  }
});

//////////////////////////////////////////////////////
// Day toggle
//////////////////////////////////////////////////////

const toggleDay = async (groupId, dateStr, circleEl, isPast) => {
  const group = groups[groupId];
  if (!group) return;

  if (isPast) showPastEditWarning();

  const existingTs = findTimestampForDate(group.timestamps, dateStr);

  if (existingTs) {
    // Optimistic update
    circleEl.classList.remove('completed');
    circleEl.setAttribute('aria-pressed', 'false');
    group.timestamps = group.timestamps.filter((ts) => ts !== existingTs);

    // Persist via Model selection API
    Model.toggleTimestampSelection(groupId, existingTs);
    await Model.deleteSelectedTimestamps();
  } else {
    // Noon UTC timestamp for that day
    const ts = `${dateStr}T12:00:00.000Z`;

    // Optimistic update
    circleEl.classList.add('completed');
    circleEl.setAttribute('aria-pressed', 'true');
    group.timestamps.push(ts);

    // Persist via Model selection API
    Model.toggleGroupSelection(groupId);
    await Model.addTimestampToSelectedGroups(ts);
    Model.toggleGroupSelection(groupId); // deselect after write
  }
};

//////////////////////////////////////////////////////
// Rendering
//////////////////////////////////////////////////////

const buildWeekDaysForGroup = (group, weekDates) =>
  weekDates.map((day) => ({
    ...day,
    isCompleted: isCompletedOnDate(group.timestamps || [], day.date),
    isPast: day.isPast,
  }));

const renderHabitList = () => {
  habitListEl.innerHTML = '';
  const weekDates = getWeekDates(weekOffset);
  const entries = Object.entries(groups);

  // In past weeks, filter to habits that existed then; check after filtering
  const endOfWeek = weekDates[6].date;
  const visibleEntries = weekOffset < 0
    ? entries.filter(([, group]) =>
        (group.timestamps || []).some((ts) => ts.slice(0, 10) <= endOfWeek)
      )
    : entries;

  if (visibleEntries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = weekOffset === 0 ? 'No habits yet — add your first one.' : 'No streaks.';
    habitListEl.append(empty);
    return;
  }

  visibleEntries.forEach(([id, group]) => {
    const weekDays = buildWeekDaysForGroup(group, weekDates);
    const card = createHabitCard({
      id,
      name: group.groupName,
      weekDays,
      onDayToggle: toggleDay,
      onInfo: renderInfoPopup,
    });
    habitListEl.append(card);
  });
};

const updateWeekNav = () => {
  if (!weekNavEl) return;
  const weekDates = getWeekDates(weekOffset);
  const label = weekNavEl.querySelector('.week-nav-label');
  if (label) label.textContent = formatWeekLabel(weekDates);
  const nextBtn = weekNavEl.querySelector('.week-nav-btn:last-child');
  if (nextBtn) nextBtn.disabled = weekOffset >= 0;
};

const renderWeekNav = (container) => {
  const weekDates = getWeekDates(weekOffset);
  const { nav } = createWeekNav({
    weekLabel: formatWeekLabel(weekDates),
    canGoNext: weekOffset < 0,
    onPrev: () => {
      weekOffset--;
      renderHabitList();
      updateWeekNav();
    },
    onNext: () => {
      if (weekOffset < 0) {
        weekOffset++;
        renderHabitList();
        updateWeekNav();
      }
    },
  });
  weekNavEl = nav;
  container.append(nav);
};

//////////////////////////////////////////////////////
// Add habit
//////////////////////////////////////////////////////

const handleAddHabit = async (name) => {
  const id = await Model.addGroup(name);
  groups[id] = { groupName: name, timestamps: [] };
  renderHabitList();
};

//////////////////////////////////////////////////////
// Entry point
//////////////////////////////////////////////////////

const renderWeeklyApp = async (user) => {
  const state = await Model.init(user.uid);
  groups = state.groups;

  const { app, habitList } = createWeeklyAppShell();
  habitListEl = habitList;
  infoPopup = createInfoPopup();

  const addRow = createAddHabitRow(handleAddHabit);
  app.prepend(addRow);

  renderHabitList();
  renderWeekNav(app);

  const { show: showAbout } = createAboutOverlay();
  const accountBar = createAccountBar({
    userEmail: user.email,
    onSignOut: () => signOut(auth).then(() => window.location.reload()),
    onAbout: showAbout,
  });
  app.append(accountBar);

  document.body.append(app);
};

export default renderWeeklyApp;
