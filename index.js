import Links from './links'
import Router from './router'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// for /links endpoint
function jsonHandler(request) {
  const init = {
    headers: { 'content-type': 'application/json' },
  }
  const body = JSON.stringify(Links)
  return new Response(body, init)
}

class LinksRewriter {
  constructor(links) {
    this.links = links
  }
  async element(element) {
    element.setInnerContent(
      this.links
        .map(item => `<a href=${item.url}>${item.name}</a>`)
        .join('\n'),
      { html: true })
  }
}

// rewrite source page to contain personal links
async function httpHandler(request) {
  const source_url = 'https://static-links-page.signalnerve.workers.dev'
  let page = await fetch(source_url)
  const title_rewriter = {
    element: (element) => {
      element.setInnerContent("Krishna Chittur's links")
    }
  }
  const profile_rewriter = {
    element: (element) => {
      element.removeAttribute('style')
    }
  }
  const name_rewriter = {
    element: (element) => {
      element.setInnerContent("Krishna Chittur")
    }
  }
  const avatar_rewriter = {
    element: (element) => {
      element.setAttribute('src', 'https://chittur.dev/myface.jpg')
    }
  }
  const body_rewriter = {
    element: (element) => {
      element.setAttribute('class', 'bg-teal-800')
    }
  }
  return new HTMLRewriter()
    .on("div#links", new LinksRewriter(Links))
    .on("title", title_rewriter)
    .on('div#profile', profile_rewriter)
    .on('h1#name', name_rewriter)
    .on('img#avatar', avatar_rewriter)
    .on('body', body_rewriter)
    .transform(page)
}

async function handleRequest(request) {
  const r = new Router()
    .get('/links', request => jsonHandler(request))

  const resp = await r.route(request, httpHandler)
  return resp
}