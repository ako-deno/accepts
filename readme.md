# accepts

[![tag](https://img.shields.io/github/tag/ako-deno/accepts.svg)](https://github.com/ako-deno/accepts/tags)
![accepts-ci](https://github.com/ako-deno/accepts/workflows/accepts-ci/badge.svg)

Higher level content negotiation using [negotiator](https://deno.land/x/negotiator). Based on `https://github.com/jshttp/accepts`.

In addition to negotiator, it allows:

- Allows type shorthands such as `json`.
- Returns `[]` when no types match
- Treats non-existent headers as `*`

## API

```js
import { Accepts } from "https://raw.githubusercontent.com/ako-deno/accepts/master/mod.ts";
```

### Accepts(headers: Headers)

Create a new `Accepts` object for the given `header`.

```js
const accept = new Accepts(header);
```

#### accept.charsets(charsets?: string[]): string[]

Return the first accepted charset. If nothing in `charsets` is accepted,
then `[]` is returned.

Return the charsets that the request accepts, in the order of the client's
preference (most preferred first).

#### accept.encodings(encodings?: string[]): string[]

Return the first accepted encoding. If nothing in `encodings` is accepted,
then `[]` is returned.

Return the encodings that the request accepts, in the order of the client's
preference (most preferred first).

#### accept.languages(languages?: string[]): string[]

Return the first accepted language. If nothing in `languages` is accepted,
then `[]` is returned.

Return the languages that the request accepts, in the order of the client's
preference (most preferred first).

#### accept.types(types?: string[]): string[]

Return the first accepted type (and it is returned as the same text as what
appears in the `types` array). If nothing in `types` is accepted, then `[]`
is returned.

The `types` array can contain full MIME types or file extensions. Any value
that is not a full MIME types is passed to [mime_types](https://deno.land/x/media_types)'s.lookup`.

Return the types that the request accepts, in the order of the client's
preference (most preferred first).

## Examples

### Simple type negotiation

This simple example shows how to use `accepts` to return a different typed
respond body based on what the client wants to accept. The server lists it's
preferences in order and will get back the best match between the client and
server.

```js
import {
  serve,
  Response,
} from "https://deno.land/std/http/server.ts";
import { Accepts } from "https://raw.githubusercontent.com/ako-deno/accepts/master/mod.ts";

const server = serve("127.0.0.1:3000");
console.log("Server listening on: 3000");

for await (const req of server) {
  const accept = new Accepts(req.headers);
  const res: Response = {
    headers: new Headers(),
  };
  const type = accept.types(["json", "html"]);
  switch (type[0]) {
    case "json":
      res.body = '{"hello":"world!"}';
      res.headers!.set("Content-Type", "application/json");
      break;
    case "html":
      res.body = "<b>hello, world!</b>";
      res.headers!.set("Content-Type", "text/html");
      break;
    default:
      // the fallback is text/plain, so no need to specify it above
      res.body = "hello, world!";
      res.headers!.set("Content-Type", "text/plain");
      break;
  }
  req.respond(res).catch(() => {});
}
```

You can test this out with the cURL program:
```sh
curl -I -H'Accept: text/html' http://localhost:3000/
```

# License

[MIT](./LICENSE)
