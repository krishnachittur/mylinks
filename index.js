import Links from './links'
import Router from './router'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

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
        .join(''), 
      { html: true })
  }
}

async function httpHandler(request) {
  const source_url = 'https://static-links-page.signalnerve.workers.dev'
  let page = await fetch(source_url)
  const title_rewriter = {
    element: (element) => {
      element.setInnerContent("Krishna Chittur's links")
    }
  }
  return new HTMLRewriter()
    .on("div#links", new LinksRewriter(Links))
    .on("title", title_rewriter)
    .transform(page)
}

async function handleRequest(request) {
  const r = new Router()
  r.get('/links', request => jsonHandler(request))
  r.get('/*', request => httpHandler(request))

  const resp = await r.route(request)
  return resp
}