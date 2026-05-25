import { VIEW_MODES } from "../model/model";

//////////////////////////////////////////////////////
// View
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Atoms
//////////////////////////////////////////////////////
export const createButtonElement = (textContent) => {
  const button = document.createElement("button");
  button.textContent = textContent;

  return button;
};

export const createGroupList = () => {
  const groupList = document.createElement("ul");

  return groupList;
};

//////////////////////////////////////////////////////
// Compounds
//////////////////////////////////////////////////////
export const createStatusBar = () => {
  const bar = document.createElement("div");
  bar.id = "status-bar";
  bar.style.position = "fixed";
  bar.style.bottom = "0";
  bar.style.left = "0";
  bar.style.right = "0";
  bar.style.padding = "0.5rem";
  bar.style.background = "#f2f2f2";
  bar.style.fontSize = "0.9rem";
  bar.style.textAlign = "center";
  bar.textContent = "Status: Idle";

  return bar;
};

export const updateStatusBar = (statusText) => {
  const bar = document.getElementById("status-bar");
  if (bar) {
    bar.textContent = `Status: ${statusText}`;
  }
};

export const createDropdown = (options, onChange) => {
  const dropdown = document.createElement("select");

  Object.values(options).forEach((value) => {
    const option = document.createElement("option");
    option.textContent = value;
    option.value = value;
    dropdown.append(option);
  });

  dropdown.addEventListener("change", (e) => onChange(e.target.value));

  return dropdown;
};

export const createGroupEntry = (timestamp, onCheckboxToggle) => {
  const entryWrapper = document.createElement("li");
  entryWrapper.className = "flex-row";
  entryWrapper.dataset.id = timestamp;

  const entryText = document.createElement("p");
  entryText.textContent = timestamp;

  const entryCheckbox = document.createElement("input");
  entryCheckbox.type = "checkbox";
  entryCheckbox.addEventListener("change", () => onCheckboxToggle()); // TODO: align with implementation of other checkbox and use that to define boundaries

  entryWrapper.append(entryCheckbox, entryText);

  return { entryWrapper, entryText, entryCheckbox };
};

export const createInputElements = () => {
  const inputWrapper = document.createElement("div");
  inputWrapper.className = "flex-row";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "group name";

  const inputButton = createButtonElement("enter");

  inputWrapper.append(inputField, inputButton);

  return { inputWrapper, inputField, inputButton };
};

export const createGroupElements = (id, name, onCheckboxToggle) => {
  const groupWrapper = document.createElement("div");
  groupWrapper.id = id;

  const groupHeaderWrapper = document.createElement("div");
  groupHeaderWrapper.classList.add("flex-row");

  const groupCheckbox = document.createElement("input");
  groupCheckbox.type = "checkbox";
  groupCheckbox.addEventListener("change", () => onCheckboxToggle(id));

  const groupName = document.createElement("h3");
  groupName.textContent = name;

  const groupSubtext = document.createElement("p");
  groupSubtext.classList.add("group-subtext");

  groupHeaderWrapper.append(groupCheckbox, groupName, groupSubtext);

  const groupEntries = document.createElement("ul");

  groupWrapper.append(groupHeaderWrapper, groupEntries);

  return { groupWrapper, groupName, groupSubtext, groupCheckbox, groupEntries };
};

export const createManualTimestampInput = () => {
  const manualTimestampWrapper = document.createElement("div");
  manualTimestampWrapper.classList.add("flex-row");

  const manualTimestampButton = createButtonElement("enter");

  const manualTimestampInput = document.createElement("input");
  manualTimestampInput.type = "datetime-local";

  manualTimestampWrapper.append(manualTimestampInput, manualTimestampButton);

  return {
    manualTimestampWrapper,
    manualTimestampButton,
    manualTimestampInput,
  };
};

export const createAppView = (
  onViewModeChange,
  onAddGroup,
  onAddTimestamp,
  onDelete,
  onManualTimestamp,
) => {
  const root = document.createElement("div");

  const title = document.createElement("h1");
  title.textContent = "Streaks";

  const { inputWrapper, inputField, inputButton } = createInputElements();
  const list = document.createElement("div");

  const addTimestampButton = createButtonElement("addTimestamp");
  const deleteButton = createButtonElement("delete");

  const {
    manualTimestampWrapper,
    manualTimestampButton,
    manualTimestampInput,
  } = createManualTimestampInput();

  const dropdown = createDropdown(VIEW_MODES, onViewModeChange);

  // Footer wrapper
  const footerWrapper = document.createElement("div");
  footerWrapper.classList.add("footer-wrapper");

  const deleteAddRow = document.createElement("div");
  deleteAddRow.classList.add("footer-row");
  deleteAddRow.append(deleteButton, addTimestampButton);

  manualTimestampWrapper.classList.add("footer-row");

  const dropdownRow = document.createElement("div");
  dropdownRow.classList.add("footer-row");
  dropdownRow.append(dropdown);

  footerWrapper.append(deleteAddRow, manualTimestampWrapper, dropdownRow);

  // Event handlers
  inputButton.addEventListener("click", () => onAddGroup(inputField, list));
  addTimestampButton.addEventListener("click", () => onAddTimestamp(list));
  deleteButton.addEventListener("click", () => onDelete(list));
  manualTimestampButton.addEventListener("click", () =>
    onManualTimestamp(manualTimestampInput, list),
  );

  root.append(title, inputWrapper, list, footerWrapper);

  return {
    root,
    list,
    inputField,
    manualTimestampInput,
  };
};
