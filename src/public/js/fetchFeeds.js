// Spaces and periods become dashes
const kebabCase = (string) => string.toLowerCase().replaceAll(/[ .]/g, '-');

const toggleFeed = (title) => {
  const formattedTitle = kebabCase(title);
  const recentPosts = STATE[`${kebabCase(title)}-feed`]?.posts || [];
  const canCollapse = recentPosts.length > STATE.defaultVisiblePostsCount;
  const isCollapsed = STATE[`${kebabCase(title)}-collapsed`];
  STATE[`${kebabCase(title)}-collapsed`] = !isCollapsed;

  const posts = createPosts(title, recentPosts);
  const postHtml = renderPosts(title, posts, canCollapse, !isCollapsed);
  const feedPostWrapper = document.querySelectorAll(
    `.feed-post-wrapper.${formattedTitle}`,
  )[0];
  feedPostWrapper.innerHTML = postHtml;
};

const redrawFeeds = () => {
  const feedsWrapper = document.getElementById('feeds-wrapper');

  const feeds = Object.keys(STATE)
    .filter((key) => key.includes('feed'))
    .map((key) => STATE[`${kebabCase(key)}`]);

  const htmlFeeds = feeds
    .filter(filterCategories)
    .map(createFeed)
    .filter(Boolean)
    .join('');

  if (!htmlFeeds?.length) {
    feedsWrapper.innerHTML = '<div class="empty-feeds">No Feeds Found</div>';
    return;
  }

  feedsWrapper.innerHTML = htmlFeeds;
}

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
        ${isCollapsed ? 'Show more' : 'Show less'}
      </button>`
      : ''
  }`;

const filterRecentPosts = ({ title, posts, category }) => {
  const currentDate = new Date();
  const lastWeekTimestamp = currentDate.setUTCDate(new Date().getUTCDate() - 7);

  const recentPosts = posts?.filter(
    ({ pubDate }) => new Date(pubDate).getTime() > lastWeekTimestamp,
  );

  return {
    title,
    posts: recentPosts,
    category
  };
};

const filterCategories = ({ category }) => STATE.showCategories[category]

const createFeed = ({ title, posts: recentPosts, category }) => {
  if (!recentPosts?.length) return;
  if (!STATE.showCategories[category]) return;
  
  STATE[`${kebabCase(title)}-feed`] = { title, posts: recentPosts, category};
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
  const feedsWrapper = document.getElementById('feeds-wrapper');
  feedsWrapper.innerHTML = '';

  if (!feeds?.length) {
    feedsWrapper.innerHTML = '<div class="empty-feeds">No Feeds Found</div>';
    return;
  }

  // Set first feed to show full contents, collapse rest
  feeds.forEach(({ title }) => (STATE[`${kebabCase(title)}-collapsed`] = true));

  const htmlFeeds = feeds
    .map(filterRecentPosts)
    .map(createFeed)
    .filter(Boolean)
    .join('');

  feedsWrapper.innerHTML = htmlFeeds;
};

const fetchFeeds = async () => {
  STATE.fetchFeedsLoading = true;
  try {
    console.log('Fetching feeds from server');
    fetch('/feeds')
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
