export const Home = (): string => {
  return `<!DOCTYPE html>
  <html lang="en">
  <body>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="css/home.css">
    <link rel="stylesheet" type="text/css" href="css/feeds.css">
  </head>

  <div class="content-wrapper">
    <h1>My Cool RSS Feeds</h1>
    <a href="/admin">Admin Login</a>

    <h2>This Week's Feeds</h2>
    <div id="feed-selector">
      <input type="radio" id="radio-all" name="options" value="all" checked onchange="selectCategory('all')">
      <label for="option1">All</label><br>

      <input type="radio" id="radio-code" name="options" value="code" onchange="selectCategory('code')">
      <label for="option2">Code</label><br>

      <input type="radio" id="radio-tech" name="options" value="tech" onchange="selectCategory('tech')">
      <label for="option3">Tech</label><br>

      <input type="radio" id="radio-ocean" name="options" value="ocean" onchange="selectCategory('ocean')">
      <label for="option3">Ocean</label><br>
    </div>
    <div id="feeds-wrapper">
      <div class="feeds-loading">Loading...</div>
    </div>
  </div>

  <script src="js/fetchFeeds.js"></script>
  </body>
  </html>`;
};
