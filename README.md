# RSS Reader

## Description

This is a personal learning project to build an RSS reader and 
feed manager. It includes a feed list Home Page, with filtering
options, an authenticated Admin Panel, and service for storing
and fetching RSS / Atom feeds. 

Feel free to fork and develop your own improvements, or open a PR
if you'd like!

## TODOs

### Home Page

- Filtering by day / week / month
- Latest feeds first option
- Fix issue with filter breaking feed state if interacted with while loading
- Refactor UI templating

### Admin Dash

- Show days since last publish (if possible)
- Store date added (show days since added & no publish if days since last publish is unavailable)
- Desktop styles
- Mobile styles
- Allow update of Feed name
- Allow update of Feed link
- Allow update of Feed category
- Allow new category addition
  - How to handle many categories with UI filter?
- Show error icon next to feeds who have failed to fetch

### Hosting

- Move to AWS ECS or similar to improve availability and load times
- Prefer SQLite 
- If Postgres required, containerize with app? 
- Potentially break up UI and Server hosting? (Major Refactor)