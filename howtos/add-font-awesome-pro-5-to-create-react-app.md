# How to add Font Awesome Pro 5 to a Create React App

<tt>Author: [favmd](https://github.com/favmd)</tt> <tt>Reviewer: [favph](https://github.com/favph)</tt>

The following document describes the steps that we took to add Font Awesome Pro 5 to a [Create React App](https://create-react-app.dev).

We've basically tried to follow the official docs (["Installing the Pro version of Font Awesome"](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers#installing-pro) and ["React"](https://fontawesome.com/how-to-use/on-the-web/using-with/react)), but quickly had to realize that they were not *that* clear, concise and complete, mostly describing the usage of the Free version of Font Awesome.

We ended up finding [this helpful GitHub issue comment](https://github.com/FortAwesome/react-fontawesome/issues/16#issuecomment-485281397) and finally did the following:

## Table of Contents

- [`.npmrc`](#npmrc)
- [`package.json`](#packagejson)
- [`src/App.js`](#srcappjs)
- [`src/components/Example.js`](#srccomponentsexamplejs)

### `.npmrc`

```npmrc
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=<TOKEN>
```

### `package.json`

```json
"dependencies": {
  "@fortawesome/fontawesome-svg-core": "^1.2.28",
  "@fortawesome/free-brands-svg-icons": "^5.13.0",
  "@fortawesome/pro-duotone-svg-icons": "^5.14.0",
  "@fortawesome/pro-light-svg-icons": "^5.14.0",
  "@fortawesome/pro-regular-svg-icons": "^5.14.0",
  "@fortawesome/pro-solid-svg-icons": "^5.14.0",
  "@fortawesome/react-fontawesome": "^0.1.9",
  "...": "..."
}
```

### `src/App.js`

```jsx
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fad } from '@fortawesome/pro-duotone-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import { far } from '@fortawesome/pro-regular-svg-icons'
import { fas } from '@fortawesome/pro-solid-svg-icons'

library.add(fab, fad, fal, far, fas)
```

### `src/components/Example.js`

```jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
```

```jsx
// Regular folder:
<FontAwesomeIcon icon={['far', 'folder']} />
// Solid square:
<FontAwesomeIcon icon={['fas', 'square']} />
```

Check out [https://fontawesome.com/how-to-use/on-the-web/using-with/react](https://fontawesome.com/how-to-use/on-the-web/using-with/react)
<br>
to learn more about fine-tuning icon usage and more advanced features.
