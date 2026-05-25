import { Model } from "../model/model";
import {
  createAppView,
  createGroupElements,
  createGroupEntry,
} from "../view/view";

//////////////////////////////////////////////////////
// View State
//////////////////////////////////////////////////////

export const VIEW_MODES = {
  FOCUS: "Focus",
  EDIT: "Edit",
};

let currentView = VIEW_MODES.FOCUS;

//////////////////////////////////////////////////////
// Utilities
//////////////////////////////////////////////////////

const applyViewMode = (el, allowedViewModes) => {
  el.dataset.viewMode = allowedViewModes.join(",");
  if (!allowedViewModes.includes(currentView)) {
    el.classList.add("hidden");
  } else {
    el.classList.remove("hidden");
  }
};

const changeViewMode = (baseElement, viewMode) => {
  const elements = baseElement.querySelectorAll("[data-view-mode]");
  elements.forEach((el) => {
    const modes = el.dataset.viewMode.split(",").map((m) => m.trim());
    if (modes.includes(viewMode)) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
};

// Einheitlicher Formatter + Subtext-Updater
const formatStreak = ({
  currentStreak,
  totalCompletions,
  totalIntervals,
} = {}) =>
  currentStreak !== undefined
    ? `🔥${currentStreak} | ✅ ${totalCompletions}/${totalIntervals}`
    : "";

const updateGroupStreakSubtext = (groupId, groupComponent) => {
  const data = Model.getStreakDataForGroup(groupId);
  const sub = groupComponent.querySelector(".group-subtext");
  if (sub) sub.textContent = formatStreak(data);
};

const buildGroupElement = (id, group) => {
  // Hinweis: Uneinheitliche DOM-Behandlung bewusst belassen; später refactoren.
  const { groupWrapper, groupEntries, groupSubtext } = createGroupElements(
    id,
    group.groupName,
    () => Model.toggleGroupSelection(id),
  );

  const data = Model.getStreakDataForGroup(id);
  groupSubtext.classList.add("group-subtext");
  groupSubtext.textContent = formatStreak(data);

  applyViewMode(groupEntries, [VIEW_MODES.EDIT]);

  if (group.timestamps) {
    group.timestamps.forEach((timestamp) => {
      const { entryWrapper } = createGroupEntry(timestamp, () => {
        Model.toggleTimestampSelection(id, timestamp);
      });
      groupEntries.append(entryWrapper);
    });
  }

  return groupWrapper;
};

//////////////////////////////////////////////////////
// Controller Callbacks for View
//////////////////////////////////////////////////////

const handleViewModeChange = (newMode) => {
  currentView = newMode;
  changeViewMode(document, newMode);
};

const handleAddGroup = async (inputField, list) => {
  const groupName = inputField.value.trim();
  if (!groupName) return;

  const id = await Model.addGroup(groupName);
  const groupWrapper = buildGroupElement(id, { groupName, timestamps: [] });
  list.append(groupWrapper);
  inputField.value = "";
};

const handleAddTimestamp = async (list) => {
  const { timestamp, updatedGroups } =
    await Model.addTimestampToSelectedGroups();

  updatedGroups.forEach(({ id }) => {
    const groupComponent = list.querySelector(`[id="${id}"]`);
    if (!groupComponent) return;

    const { entryWrapper } = createGroupEntry(timestamp, () => {
      Model.toggleTimestampSelection(id, timestamp);
    });

    const groupEntries = groupComponent.querySelector("ul");
    if (groupEntries) groupEntries.append(entryWrapper);

    updateGroupStreakSubtext(id, groupComponent);
  });
};

const handleDelete = async (list) => {
  const groupsToDelete = Model.getSelectedGroups();
  const timestampsToDelete = Model.getSelectedTimestamps();

  await Model.deleteSelectedGroups();
  await Model.deleteSelectedTimestamps();

  // Remove deleted groups from the DOM
  for (const id of groupsToDelete) {
    list.querySelector(`[id="${id}"]`)?.remove();
  }

  // Remove deleted timestamps from remaining group elements
  for (const [groupId, timestamps] of Object.entries(timestampsToDelete)) {
    const groupComponent = list.querySelector(`[id="${groupId}"]`);
    if (!groupComponent) continue;

    for (const ts of timestamps) {
      groupComponent.querySelector(`[data-id="${ts}"]`)?.remove();
    }

    updateGroupStreakSubtext(groupId, groupComponent);
  }
};

const handleManualTimestamp = async (input, list) => {
  const value = input.value;
  if (!value) return;

  const timestamp = new Date(value).toISOString();
  await Model.addTimestampToSelectedGroups(timestamp);

  Model.getSelectedGroups().forEach((groupId) => {
    const groupComponent = list.querySelector(`[id="${groupId}"]`);
    const ul = groupComponent?.querySelector("ul");
    if (!ul) return;

    const { entryWrapper } = createGroupEntry(timestamp, () => {
      Model.toggleTimestampSelection(groupId, timestamp);
    });

    ul.append(entryWrapper);

    // 🔄 Streak neu berechnen + anzeigen
    updateGroupStreakSubtext(groupId, groupComponent);
  });
};

//////////////////////////////////////////////////////
// Controller Entry Point
//////////////////////////////////////////////////////

const renderApp = async (user) => {
  const state = await Model.init(user.uid);

  const { root, list } = createAppView(
    VIEW_MODES,
    handleViewModeChange,
    handleAddGroup,
    handleAddTimestamp,
    handleDelete,
    handleManualTimestamp,
  );

  document.body.append(root);

  // 
  for (const [id, group] of Object.entries(state.groups)) {
    const groupWrapper = buildGroupElement(id, group);
    list.append(groupWrapper);
  }
};

export default renderApp;
