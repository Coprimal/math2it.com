# Math2IT with Next.js

## Infos & setting up

- Vercel site: https://math2it-nextjs.vercel.app
- Site built in dev branch:
- [Project on Notion](https://www.notion.so/math2it/4f043a41b36c4e09a0c915af847f1224?v=e09c3a2b734041ab8dfdcbabf18abae6).
- Env vars: check [this file](./example.env.local).
- Check quota Vercel: https://vercel.com/dashboard/usage
- **Notes**: Trong trường hợp cái ý tưởng dùng get all posts trong `getStaticProps()` để phân trang (pagination) mà không hiệu quả (khi luợng bài quá nhiều chẳng hạn) -> Có thể dùng đến ý tưởng là đánh số thư tự cho rows trên Notion. Sau đó chỉ cần fetch theo STT này thui. Nhuợc điểm của cách này là khi luợng bài trên Notion quá nhiều thì load trang database khá chậm!

## ‼️ Rules

1. Using `id` (or `slug`) for `key={}`.
2. Query only neccessary fields, not all!
3. Types in `additional.d.ts` for customized types.
4. **BEFORE PUSHING**: run `yarn run check` to check if there are errors!
5. **DON'T** comment on the right side of the variable in `.env.local`!!!
6. Change something in `.env.local`, MUST restart manually the `yarn dev`!

## Installation & Dev

```bash
# Global tools
npm install -g yarn
npm install -g fontello-cli
```

```bash
# install
yarn

# run dev server
yarn dev
yarn dev --turbo

# build
yarn build
yarn buuld --turbo

# run production server
yarn start

# lint
yarn lint

# prettier
yarn prettier

# clean
yarn clean

# reinstall
yarn reinstall
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

For an example of an api request, let's make a `GET` to `http://localhost:3001/api/hello`.

## React Icons

[Official website & used to search icons](https://react-icons.github.io/react-icons/).

How to use?

```tsx
import { BiRightArrow } from 'react-icons/bi'

<BiRightArrow className="mr-1 text-lg" />
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