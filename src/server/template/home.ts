export const Home = (): string => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <title>RSS Reader</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta
      name="description"
      content="Stay updated with curated RSS feeds from timpepper.dev blog topics and beyond.
        Discover interesting content aligned with Tim Pepper's interests, studies, and work.">

    <link rel="stylesheet" type="text/css" href="css/feeds.css">
    <style>
      html {
        display: flex;
        justify-content: space-around;
        font-family: 'Lucida Console', Monaco, monospace;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: .02rem;
      }
      
      body {
        display: flex;
        flex-direction: column;
        width: 50vw;
      }
      
      @media (max-width: 750px) {
        html {
          line-height: 22px;
        }
        body {
          width: 100%;
          margin-top: 10px;
        }
        header {
          font-size: 18px;
          height: 40px;
        }
        h1 {
          font-size: 25px;
        }
        
        h2 {
          font-size: 23px;
        }
      
        h3 {
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
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
        tabindex="0"
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
        tabindex="0"
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
        tabindex="0"
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
        tabindex="0"
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
  <style>
    @media (max-width: 750px) {
      html {
        font-size: 16px;
        line-height: 22px;
      }
      body {
        width: 100%;
        margin-top: 10px;
      }
      header {
        font-size: 18px;
        height: 40px;
      }
      h1 {
        font-size: 25px;
      }
      
      h2 {
        font-size: 23px;
      }
    
      h3 {
        font-size: 20px;
      }
    }
  </style>
  </html>`;
};
