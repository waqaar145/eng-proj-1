import { HTTPClient } from "../services"
import nookies from 'nookies'

const setHeaders = (ctx) => {
  const { engToken } = nookies.get(ctx)
  HTTPClient.saveHeader({key: 'Authorization', value: `Bearer ${engToken}`})
  return HTTPClient
}

export const HTTPSSRInstance = (ctx) => {
  let isServer = ctx && !!ctx.req;
  let HTTPServer;
  if (!isServer) {
    HTTPServer = HTTPClient
  } else {
    HTTPServer = setHeaders(ctx);
  }
  return HTTPServer;
}