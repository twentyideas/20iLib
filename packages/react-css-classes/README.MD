# @20i/react-css-classes

Using a MUI theme, provides a lot of CSS classes to make writing React components quicker!


#### Peer Deps
```
"@material-ui/core": "^4.9.0"
"@material-ui/styles": "^4.9.0"
```

### Init

```
// filename: style.ts

import { createMuiTheme } from "@material-ui/core/styles"
import { useClasses } from "@20i/react-css-classes"

export const theme = createMuiTheme({
    // typography,
    // palette,
    // breakpoints,
    // spacing,
    // overrides,
    // props
})

// export the hook!
export const useReactCSSClasses = useClasses(theme)
```

### Usage in a react component

```
import { useReactCSSClasses } from "style"
import React from "react"

const MyReactComponent = () => {
    const rc = useReactCSSClasses()

    // use whatever classes you want. There's a ton!!
    const className = rc.bgPrimaryDark

    return (
        <div className={className}>
            This is my component
        </div>
    )
}
```

### CSS Classes

There's a lot of helper CSS classes. You can view them by category.

[Animation](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Animation.ts)
[Border](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Border.ts)
[Color](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Color.ts)
[Flex](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Flex.ts)
[Handy](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Handy.ts)
[MarginPadding](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/MarginPadding.ts)
[Opacity](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Opacity.ts)
[Positional](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Positional.ts)
[Shadow](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Shadow.ts)
[TextAlignment](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/TextAlignment.ts)
[Transform](https://github.com/twentyideas/20iLib/blob/master/packages/react-css-classes/src/classes/Transform.ts)
