# Math2IT with Next.js

## Infos & setting up

- Vercel site: https://math2it-v-nextjs-html.vercel.app/
- [Project on Notion](https://www.notion.so/math2it/4f043a41b36c4e09a0c915af847f1224?v=e09c3a2b734041ab8dfdcbabf18abae6).
- Repo contains the html files (which is used to serve the main site): https://github.com/dinhanhthi/math2it-v-nextjs-html
- Search server: https://github.com/dinhanhthi/math2it-server
- Env vars: check [this file](./example.env.local).
- Check quota Vercel: https://vercel.com/dashboard/usage

## ‼️ Rules & Notes

1. Types in `additional.d.ts` for customized types.
2. **BEFORE PUSHING**: run `yarn run check` to check if there are errors!
3. **DON'T** comment on the right side of the variable in `.env.local`!!!
4. Change something in `.env.local`, MUST restart manually the `yarn dev`!
5. **Dev tags** (used to search globally in the project)
   1. `###M`: useful in dev mode, not prod mode.
   2. `###TODO`: to to.
   3. `###R`: remarks!
   4. `###Thi` or `###R`: should be removed before building.


## Dev

🚧 We use [static export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) (export to htmls)

1. Clone this repo to `<whatever>/math2it-v-nextjs/`
2. Clone https://github.com/dinhanhthi/math2it-v-nextjs-html to `<whatever>/math2it-v-nextjs-html/` (the name **math2it-v-nextjs-html** is important!)
3. (First time only)
    Make sure to enable [TypeScript Plugin](https://nextjs.org/docs/app/building-your-application/configuring/typescript#typescript-plugin).

    ```bash
    # Global tools
    npm install -g yarn
    npm install -g fontello-cli
    npm install -g http-server

    # install
    yarn
    ```
4. To develop offline: `yarn dev`
    - To use [`yarn dev --turbo`](https://nextjs.org/docs/architecture/turbopack), disable `experimental` and `trailingSlash` in `next.config.mjs`! **It's not working on MacOS**!
    - **TIP**: Because we're using "cache" for requests, if you change something on Notion, don't forget to `Ctrl+Shift+R` (or `cmd+shift+R`) to hard refresh the page.
5. **Workflow**:
    ```
    # dev
    yarn dev

    # build normally (only take last modifed posts)
    yarn ud-site
    # then go to "math2it-v-nextjs-html" and run below to see if everything is ok?
    http-server out -p 3003 -a localhost
    # if ok
    yarn ud-prod

    # build fully (all posts)
    yarn ud-site-full
    # next steps are the same as normally!
    ```
6. `yarn ud-site` to update the html site. 👈 Build & copy html files to `math2it-v-nextjs-html` & update `math2it-v-nextjs-html/lastUpdate.txt` & push!
    **Idea of the technique**: When exporting finish, `math2it-v-nextjs-html/lastUpdate.txt` will be updated with the date of exporting. Next time, we don't fetch the post whose `last_edited_time` is earlier than that date.
7. **Full build**: In case you don't want to use `lastUpdate.txt` technique, just make a full build with `yarn ud-site-full`.
8. To serve html files offline: `http-server out -p 3003 -a localhost` and go to http://localhost:3003

## imgur & update cover and book cover and images in post

If an image on Notion isn't hosted on [imgur](https://imgur.com/), download this image -> upload to imgur -> get the url -> update the corresponding field on notion.

```bash
# Update cover for a single post
yarn ud-cover <postId>

# Update cover for all posts in a database
# (look for posts who need to be updated)
yarn ud-cover-all

# Update book cover for a single post
yarn ud-book-cover <postId>

# For both Cover and Book Cover of a post
yarn ud-header <postId>

# For both Cover and Book Cover of ALL post
yarn ud-header-all

# Update image blocks in post
yarn ud-images-post <postId>
```

## Fontello

For a custom font, use [fontello](https://fontello.com/).

```bash
# ud fontello
# (update file fontello/config.json)
yarn ud-fontello
```

Usage (`ng` is the field `css` in the config file),

```html
<i className="icon-ng"></i>
```

🚸 Make sure the codes are unique! You can check the tab "Customize Codes" on the fontello page.

**Custom svg icon**:

- Drag and drop svg to fontello.
- If having problem "If image looks not as expected please convert to compound path manually" -> use [this site](https://jakearchibald.github.io/svgomg/) to fix the svg and then download the fixed svg and try again!

## Api (`src/api/`)

✳️ Search posts with the unofficial notion api.

**UPDATE 25/07/23**: Because we use static export, we don't use this api anymore, we use https://github.com/dinhanhthi/math2it-server instead.

**POST** `http://localhost:3000/api/search-notion`

```bash
# body
{
    "query": "check",
    "limit": 5
}
```

## React Icons

[Official website & used to search icons](https://react-icons.github.io/react-icons/).

How to use?

```tsx
import { BiRightArrow } from 'react-icons/bi'

;<BiRightArrow className="mr-1 text-lg" />
```

## Update package version

```bash
# Version: 1.2.3
# means: breaking.feature.fix

npm version patch # 1.0.0 -> 1.0.1 (fixes)
npm version minor # 1.0.1 -> 1.1.0 (new features )
npm version major # 1.1.0 -> 2.0.0 (completely new APIs)
```

### Unofficial Notion API for Search

File `pages/api/search-notion.ts` use the api of Notion on the notion page/app, this is not [the official notion api](https://developers.notion.com/). In case there are changes from their side, we can adapt the changes by checking:

1. Open the notion page and open developer mode, go to the Network tab and type "seach" in the filter.
2. On the Notion page, in the root database, press Search (or `cmd` + `K`), type something.
3. On the Network panel, there will be a new "search" item which appears. All the neccessary information are there!

## 🧰 Troubleshooting

Check [Notion Note](https://www.notion.so/math2it/Math2IT-Notes-a3b8e234fabc4e2c86c07355097303f3?pvs=4).
