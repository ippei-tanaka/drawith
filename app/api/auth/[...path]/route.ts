import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { POST, GET } = toNextJsHandler(auth);
// export const { POST, GET } = toNextJsHandler({handler: async (request) => {
//     console.log("test", request.url);
//     // console.log(await request.);
//     const res = new Response();
//     return Promise.resolve(res);
// }});
