# @20i/react-css-classes

Using a MUI theme, provides a lot of CSS classes to make writing React components quicker!

### Init

```
// filename: style.ts

import { createMuiTheme, makeStyles } from "@material-ui/core/styles"
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

    // use whatever classes you have!
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

[Animation](./src/classes/Animation.ts)
[Border](./src/classes/Border.ts)
[Color](./src/classes/Color.ts)
[Flex](./src/classes/Flex.ts)
[Handy](./src/classes/Handy.ts)
[MarginPadding](./src/classes/MarginPadding.ts)
[Opacity](./src/classes/Opacity.ts)
[Positional](./src/classes/Positional.ts)
[Shadow](./src/classes/Shadow.ts)
[TextAlignment](./src/classes/TextAlignment.ts)
[Transform](./src/classes/Transform.ts)
