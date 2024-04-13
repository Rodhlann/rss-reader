export const Home = (): string => {
  return `<!DOCTYPE html>
  <html lang="en" style="display: flex; justify-content: space-around; font-family: 'Lucida Console', Monaco, monospace; font-size: 16px; line-height: 19px; letter-spacing: .02rem">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="css/feeds.css">
  </head>
  <body style="display: flex; flex-direction: column; width: 50vw">
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
      <label 
        class="filter-checkbox-label" 
        for="checkbox-all" 
        tabindex="1"
        onkeypress="handleKeyPress(event, 'all')"
      >All</label>

      <input 
        type="checkbox"
        id="checkbox-code" 
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="code"
        onchange="selectCategory('code')">
      <label 
        class="filter-checkbox-label" 
        for="checkbox-code" 
        tabindex="2"
        onkeypress="handleKeyPress(event, 'code')"
      >Code</label>

      <input 
        type="checkbox"
        id="checkbox-tech"
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="tech"
        onchange="selectCategory('tech')">
      <label 
        class="filter-checkbox-label" 
        for="checkbox-tech" 
        tabindex="3"
        onkeypress="handleKeyPress(event, 'tech')"
      >Tech</label>

      <input 
        type="checkbox"
        id="checkbox-ocean" 
        class="filter-checkbox-hidden"
        name="feed-filter"
        value="ocean"
        onchange="selectCategory('ocean')">
      <label 
        class="filter-checkbox-label" 
        for="checkbox-ocean" 
        tabindex="4"
        onkeypress="handleKeyPress(event, 'ocean')"
      >Ocean</label>
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
