# Math2IT with Next.js

## ‼️ Rules & Notes

1. **BEFORE PUSHING**: run `yarn run check` to check if there are errors!
2. **DON'T** comment on the right side of the variable in `.env.local`!!!
3. Change something in `.env.local`, MUST restart manually the `yarn dev`!
4. **Dev tags** (used to search globally in the project)
   1. `###M`: useful in dev mode, not prod mode.
   2. `###TODO`: to to.
   3. `###R`: remarks!
   4. `###Thi` or `###R`: should be removed before building.


## Dev

**First time only**,

```bash
# Global tools
npm install -g yarn
npm install -g fontello-cli

# install
yarn

# clone submodule too
git submodule update --init --recursive
```

Daily dev,

```bash
yarn dev # port 3003

# build before deploying
yarn build
# serve locally what are built
yarn start # port 3003

# lint
yarn prettier

# ud notion-x lib
yarn getlib
```

## imgur

**UPDATE 25/9/23**: This step is nolonger needed.

<details>
<summary>Show the content</summary>

__For updating cover and book cover and images in post__!

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
</details>

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

<details>
 <summary>Custom svg icon</summary>

- Drag and drop svg to fontello.
- If having problem "If image looks not as expected please convert to compound path manually" -> use [this site](https://jakearchibald.github.io/svgomg/) to fix the svg and then download the fixed svg and try again!
</details>

## Update package version

```bash
# Version: 1.2.3
# means: breaking.feature.fix

npm version patch # 1.0.0 -> 1.0.1 (fixes)
npm version minor # 1.0.1 -> 1.1.0 (new features )
npm version major # 1.1.0 -> 2.0.0 (completely new APIs)
```

## 🧰 Troubleshooting

Check [Notion Note](https://www.notion.so/math2it/Math2IT-Notes-a3b8e234fabc4e2c86c07355097303f3?pvs=4).
