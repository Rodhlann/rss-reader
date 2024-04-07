import { DBFeed, datasource } from '../db/datasource';

export const Admin = async (): Promise<string> => {
  const feeds = await datasource.getAll();
  const feedsCollection = feeds.reduce(
    (acc: Record<string, any>, { title, url, category }: DBFeed) => {
      if (!acc[category]) acc[category] = '';
      acc[category] += `<li>
          <a href="${url}">${title}</a>
          <button type="submit" onclick="deleteFeed(event, \'${title}\')">X</button>
        </li>\n`;
      return acc;
    },
    {},
  );
  
  const renderedFeeds = Object.keys(feedsCollection).map((key) => {
    let newKey = key.substring(1, key.length);
    const prettyKey = key[0].toUpperCase() + newKey;
    return `<h3>${prettyKey}</h3>
      <ul>${feedsCollection[key]}</ul>`
  }).join('\n') || '<li>No feeds found</li>';

  return `<!DOCTYPE html>
  <html lang="en">
  <body>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="css/admin.css">
  </head>

  <h1>Admin</h1>
  <a href="/logout">Logout</a>
  <a href="/">Home</a>

  <h2>Add Feeds</h2>
  <form id="addForm" action="/admin" method="post">
    <label for="titleInput">Title</label>
    <input id="titleInput" name="title" type="text" required>
    <label for="linkInput">Link</label>
    <input id="linkInput" name="link" type="text" required>
    <label for="categoryInput">Category</label>
    <select id="categoryInput" name="category">
      <option value="code" selected>Code</option>
      <option value="tech">Tech</option>
      <option value="ocean">Ocean</option>
    </select>
    <button type="submit" onClick="addFeed(event, title, link)">Add new feed</button>
    <p id="add-error" class="error" hidden></p>
  </form>

  <form id="importFrom" action="/feeds/import" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit" onClick="importFeeds(event)">Import Feeds</button>
    <p id="import-error" class="error" hidden></p>
  </form>

  <form action="/feeds/export">
    <button type="submit">Export Feeds</button>
  </form>

  <h2>Feeds</h2>
  <form id="deleteForm" action="/delete" method="post">
  ${renderedFeeds}
  </form>

  <script src="/js/admin.js"></script>
  <script>
    function deleteFeed(event, title) {
      event.preventDefault();
      
      const deleteForm = document.getElementById("deleteForm");

      const hiddenDeleteInput = document.createElement('input');
      hiddenDeleteInput.setAttribute('type', 'text');
      hiddenDeleteInput.setAttribute('name', 'title');
      hiddenDeleteInput.setAttribute('value', title);
      hiddenDeleteInput.hidden = true;
      deleteForm.appendChild(hiddenDeleteInput);

      deleteForm.submit();
    }
  </script>
  </body>
  </html>`;
};
