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
      <input 
        type="checkbox" 
        id="checkbox-all" 
        class="filter-checkbox-hidden"
        name="feed-filter" 
        value="all" 
        checked 
        onchange="selectCategory('all')">
      <label class="filter-checkbox-label" for="checkbox-all">All</label><br>

      <input 
        type="checkbox"
        id="checkbox-code" 
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="code"
        checked
        onchange="selectCategory('code')">
      <label class="filter-checkbox-label" for="checkbox-code">Code</label><br>

      <input 
        type="checkbox"
        id="checkbox-tech"
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="tech"
        checked
        onchange="selectCategory('tech')">
      <label class="filter-checkbox-label" for="checkbox-tech">Tech</label><br>

      <input 
        type="checkbox"
        id="checkbox-ocean" 
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="ocean"
        checked
        onchange="selectCategory('ocean')">
      <label class="filter-checkbox-label" for="checkbox-ocean">Ocean</label><br>
    </div>
    <div id="feeds-wrapper">
      <div class="feeds-loading">Loading...</div>
    </div>
  </div>

  <script src="js/state.js"></script>
  <script src="js/filterCategories.js"></script>
  <script src="js/fetchFeeds.js"></script>
  </body>
  </html>`;
};
