fetch("test.xml")
  .then((response) => response.text())
  .then((text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");

    const [rss] = doc.children
    const [channel] = rss.children
    const [
      { textContent: title }, 
      { textContent: link }, 
      { textContent: description }, 
      { textContent: lastBuildDate }, 
      { textContent: docs }, 
      { textContent: generator }, 
      { textContent: language }, 
      ...items
    ] = channel.children

    const parsedItems = [...items].map(({children: [
      { textContent: title }, 
      { textContent: link }, 
      { textContent: guid }, 
      { textContent: pubDate }, 
    ]}) => ({
      title,
      link,
      guid,
      pubDate
    })).slice(0, 5)

    const node = {
      title,
      link,
      description,
      lastBuildDate,
      docs,
      generator,
      language,
      items: parsedItems
    };

    const section = document.getElementById('section')
    const titleEl = document.createElement('span')
    titleEl.innerHTML = `<h2>${node.title}</h2>`
    section.appendChild(titleEl)

    node.items.forEach(({title, link, pubDate}) => {
      const itemEl = document.createElement('article')
      itemEl.innerHTML = `<a href="${link}">${title}</a></br><span>Published: ${pubDate}</span></br>`
      section.appendChild(itemEl)
    })
  });


