import { getAll } from '../db/db';

export const Admin = async (): Promise<string> => {
  const feeds = await getAll();
  const renderedFeeds =
    feeds
      .map(
        ({ title, url }) =>
          `<li>
            <a href="${url}">${title}</a>
            <button type="submit" onclick="deleteFeed(event, \'${title}\')">X</button>
          </li>`,
      )
      .join('\n') || '<li>No feeds found</li>';

  return `<html>
  <body>
    <h1>Admin</h1>
    <a href="/logout">Logout</a>

    <h2>Add Feeds</h2>
    <form id="addForm" action="/admin" method="post">
      <label for="titleInput">Title</label>
      <input id="titleInput" name="title" type="text" required>
      <label for="linkInput">Link</label>
      <input id="linkInput" name="link" type="text" required>
      <button type="submit">Add new feed</button>
    </form>

    <form action="/feeds/import" method="post" enctype="multipart/form-data">
      <input type="file" name="file">
      <button type="submit">Import Feeds</button>
    </form>

    <form action="/feeds/export">
      <button type="submit">Export Feeds</button>
    </form>

    <h2>Feeds</h2>
    <form id="deleteForm" action="/delete" method="post">
      <ul>
        ${renderedFeeds}
      </ul>
    </form>

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
