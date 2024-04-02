const STATE = {
  defaultVisiblePostsCount: 3,
  fetchFeedsLoading: false,
  fetchFeedsError: false,
};

const kebabCase = (string) => string.toLowerCase().replaceAll(' ', '-');

const toggleFeed = (title) => {
  const formattedTitle = kebabCase(title);
  const recentPosts = STATE[`${kebabCase(title)}-posts`]
  const canCollapse = recentPosts.length > STATE.defaultVisiblePostsCount;
  const isCollapsed = STATE[`${kebabCase(title)}-collapsed`];
  STATE[`${kebabCase(title)}-collapsed`] = !isCollapsed;

  const posts = createPosts(title, recentPosts)
  const postHtml = renderPosts(title, posts, canCollapse, !isCollapsed);
  const feedPostWrapper = document.querySelectorAll(
    `.feed-post-wrapper.${formattedTitle}`,
  )[0];
  feedPostWrapper.innerHTML = postHtml;
};

const filterRecentPosts = (posts) => {
  const currentDate = new Date();
  const lastWeekTimestamp = currentDate.setUTCDate(new Date().getUTCDate() - 7);

  return posts.filter(
    ({ pubDate }) => new Date(pubDate).getTime() > lastWeekTimestamp,
  );
};

const createPosts = (title, posts) => {
  const isCollapsed = STATE[`${kebabCase(title)}-collapsed`];
  const visiblePostsCount = isCollapsed
    ? STATE.defaultVisiblePostsCount
    : posts.length;

  return posts.slice(0, visiblePostsCount).reduce(
    (acc, { title, link, pubDate }) =>
      (acc += `<div class="feed-post">
      <a class="feed-post-header" href="${link}">${title}</a>
      <div class="feed-post-published">
        <label><b/>Published:</b> </label><span>${new Date(pubDate).toDateString()}</span>
      </div>
    </div>`),
    '',
  );
};

const renderPosts = (title, htmlPosts, canCollapse, isCollapsed) => `
  ${htmlPosts}
  ${
    canCollapse
      ? `<button 
        class="collapsable-feed ${isCollapsed ? 'collapsed' : 'expanded'}"
        onClick="toggleFeed('${title}')"
      >
        ${isCollapsed ? 'Expand' : 'Collapse'}
      </button>`
      : ''
  }`;

const createFeed = ({ title, posts }) => {
  const recentPosts = filterRecentPosts(posts);
  
  if (!recentPosts.length) return;
  STATE[`${kebabCase(title)}-posts`] = recentPosts;
  const canCollapse = recentPosts.length > STATE.defaultVisiblePostsCount;
  const isCollapsed = STATE[`${kebabCase(title)}-collapsed`];

  const htmlPosts = createPosts(title, recentPosts);
  return `<div id="feed-wrapper">
    <h3>${title}</h3>
    <div class="feed-post-wrapper ${kebabCase(title)}">
      ${renderPosts(title, htmlPosts, canCollapse, isCollapsed)}
    </div>
  </div>`;
};

const populateFeeds = (feeds) => {
  if (!feeds) return '<div class="empty-feeds">No Feeds Found</div>';

  const feedsWrapper = document.getElementById('feeds-wrapper');
  feedsWrapper.innerHTML = '';

  // Set first feed to show full contents, collapse rest
  feeds.forEach(
    ({ title }, idx) => (STATE[`${kebabCase(title)}-collapsed`] = !!idx),
  );

  const htmlFeeds = feeds
    .map((feed) => createFeed(feed))
    .filter(Boolean)
    .join('');

  feedsWrapper.innerHTML = htmlFeeds;
};

const fetchFeeds = async () => {
  STATE.fetchFeedsLoading = true;
  try {
    console.log('Fetching feeds from server');
    fetch('http://localhost:3000/feeds')
      .then((response) => response.json())
      .then((feeds) => populateFeeds(feeds))
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.error('Error fetching feeds:', e.message);
    STATE.fetchFeedsError = true;
  } finally {
    STATE.fetchFeedsLoading = false;
  }
};

document.addEventListener('DOMContentLoaded', fetchFeeds);
