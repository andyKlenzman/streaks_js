import { VIEW_MODES } from "../model/model";

//////////////////////////////////////////////////////
// View
//////////////////////////////////////////////////////
//todo: createAppView()
//////////////////////////////////////////////////////
// Atoms
//////////////////////////////////////////////////////
export const createButtonElement = (textContent) => {
  let button = document.createElement("button");
  button.textContent = textContent;

  return button;
};

export const createGroupList = () => {
  let groupList = document.createElement("ul");

  return groupList;
};

//////////////////////////////////////////////////////
// Compounds
//////////////////////////////////////////////////////
export const createDropdown = (options, onChange) => {
  const dropdown = document.createElement("select");

  Object.values(options).forEach((value) => {
    console.log(value); // "Streaks", "Edit Timestamps"
    const option = document.createElement("option");
    option.textContent = value;
    option.value = value;
    dropdown.append(option);
  });

  dropdown.addEventListener("change", (e) => onChange(e.target.value));

  return dropdown;
};

export const createGroupEntry = (timestamp, onCheckboxToggle) => {
  let entryWrapper = document.createElement("li");
  entryWrapper.className = "flex-row";
  entryWrapper.dataset.id = timestamp;

  let entryText = document.createElement("p");
  entryText.textContent = timestamp;

  let entryCheckbox = document.createElement("input");
  entryCheckbox.type = "checkbox";
  entryCheckbox.addEventListener("change", () => onCheckboxToggle()); // TODO: align with implementation of other checkbox and use that to define boundaries

  entryWrapper.append(entryCheckbox, entryText);

  return { entryWrapper, entryText, entryCheckbox };
};

export const createInputElements = () => {
  let inputWrapper = document.createElement("div");
  inputWrapper.className = "flex-row";

  let inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "group name";

  let inputButton = createButtonElement("enter");

  inputWrapper.append(inputField, inputButton);

  return { inputWrapper, inputField, inputButton };
};

export const createGroupElements = (id, name, onCheckboxToggle) => {
  let groupWrapper = document.createElement("div");
  groupWrapper.id = id;

  let groupHeaderWrapper = document.createElement("div");
  groupHeaderWrapper.classList.add("flex-row");

  let groupCheckbox = document.createElement("input");
  groupCheckbox.type = "checkbox";
  groupCheckbox.addEventListener("change", () => onCheckboxToggle(id));

  let groupName = document.createElement("h2");
  groupName.textContent = name;

  groupHeaderWrapper.append(groupCheckbox, groupName);

  let groupEntries = document.createElement("ul");

  groupWrapper.append(groupHeaderWrapper, groupEntries);

  return { groupWrapper, groupName, groupCheckbox, groupEntries };
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
  onManualTimestamp
) => {
  const root = document.createElement("div");

  const dropdown = createDropdown(VIEW_MODES, onViewModeChange);
  const { inputWrapper, inputField, inputButton } = createInputElements();
  const list = document.createElement("div");
  const addTimestampButton = createButtonElement("addTimestamp");
  const deleteButton = createButtonElement("delete");
  const {
    manualTimestampWrapper,
    manualTimestampButton,
    manualTimestampInput,
  } = createManualTimestampInput();

  inputButton.addEventListener("click", () => onAddGroup(inputField, list));
  addTimestampButton.addEventListener("click", () => onAddTimestamp(list));
  deleteButton.addEventListener("click", () => onDelete(list));
  manualTimestampButton.addEventListener("click", () =>
    onManualTimestamp(manualTimestampInput, list)
  );

  root.append(
    dropdown,
    inputWrapper,
    list,
    deleteButton,
    addTimestampButton,
    manualTimestampWrapper
  );

  return {
    root,
    list,
    inputField,
    manualTimestampInput,
  };
};
