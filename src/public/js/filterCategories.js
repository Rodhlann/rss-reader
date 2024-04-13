const selectCategory = (input) => {
  if (input === 'all') {
    document.getElementById('checkbox-all').checked = true;
  } else {
    document.getElementById('checkbox-all').checked = false;
  }

  Object.keys(STATE.showCategories).forEach((key) => {
    if (input === 'all') {
      STATE.showCategories[key] = true
      document.getElementById(`checkbox-${key}`).checked = false;
    } else {
      document.getElementById(`checkbox-${key}`).checked = (key === input);
      STATE.showCategories[key] = (key === input)
    }
  })

  redrawFeeds();
};

const handleKeyPress = (event, input) => {
  if (event.key === 'Enter') {
    selectCategory(input);
  }
}
