const addFeed = async (event) => {
  event.preventDefault();

  const form = event.target.form;
  const title = form.title.value;
  const link = form.link.value;
  const category = form.category.value;

  const response = await fetch('/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, link, category }),
  });

  if (response.status == 500) {
    const text = await response.text();
    const addError = document.getElementById('add-error');
    addError.innerHTML = '[ERROR] ' + text;
    addError.hidden = false;
  } else {
    window.location.reload();
  }
};

const importFeeds = async (event) => {
  event.preventDefault();

  const form = event.target.form;
  const file = form.file.files[0];

  if (!file) {
    const importError = document.getElementById('import-error');
    importError.innerHTML = '[ERROR] No file provided for import';
    importError.hidden = false;
    return;
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/feeds/import', {
    method: 'POST',
    body: formData,
  });

  if (response.status == 500) {
    const text = await response.text();
    const importError = document.getElementById('import-error');
    importError.innerHTML = '[ERROR] ' + text;
    importError.hidden = false;
  } else {
    window.location.reload();
  }
};
