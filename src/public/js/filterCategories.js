const checkboxAll = document.getElementById('checkbox-all');
const checkboxCode = document.getElementById('checkbox-code');
const checkboxTech = document.getElementById('checkbox-tech');
const checkboxOcean = document.getElementById('checkbox-ocean');
const checkboxes = [checkboxAll, checkboxCode, checkboxTech, checkboxOcean];

const selectCategory = (input) => {
  switch (input) {
    case 'code': {
      STATE.showCategories.code = checkboxCode.checked
      if (!checkboxCode.checked)
        checkboxAll.checked = false
      break;
    }
    case 'tech':
      STATE.showCategories.tech = checkboxTech.checked
      if (!checkboxTech.checked)
        checkboxAll.checked = false
      break;
    case 'ocean':
      STATE.showCategories.ocean = checkboxOcean.checked
      if (!checkboxOcean.checked)
        checkboxAll.checked = false
      break;
    case 'all':
    default: {
      checkboxes.forEach((el) => {
        el.checked = checkboxAll.checked;
      });
      Object.keys(STATE.showCategories).forEach((key) => {
        STATE.showCategories[key] = checkboxAll.checked;
      })
    }
  }
  
  const allChecked = checkboxes.slice(1, checkboxes.length).every((checkbox) => checkbox.checked);
  if (allChecked) {
    checkboxAll.checked = true;
  }

  console.log(STATE.showCategories);

  redrawFeeds();
};
