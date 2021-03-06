import {
  serve,
  Response,
} from "https://deno.land/std@0.69.0/http/server.ts";
import { Accepts } from "../mod.ts";

const server = serve("127.0.0.1:3000");
console.log("Server listening on: 3000");

for await (const req of server) {
  const accept = new Accepts(req.headers);
  const res: Response = {
    headers: new Headers(),
  };
  let type = accept.types(["json", "html"]);
  if (type) {
    type = typeof type === "string" ? type : type[0];
    switch (type) {
      case "json":
        res.body = '{"hello":"world!"}';
        res.headers!.set("Content-Type", "application/json");
        break;
      case "html":
        res.body = "<b>hello, world!</b>";
        res.headers!.set("Content-Type", "text/html");
        break;
    }
  } else {
    // the fallback is text/plain, so no need to specify it above
    res.body = "hello, world!";
    res.headers!.set("Content-Type", "text/plain");
  }
  req.respond(res).catch(() => {});
}
