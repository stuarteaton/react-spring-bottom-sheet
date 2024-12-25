# Vue Spring Bottom Sheet

**vue-spring-bottom-sheet** is built on top of **[@vueuse/gesture]** and **[@vueuse/motion]**.

😎 **Modern** and 🚀 **Performant** Bottom Sheet for Vue.js

# Installation

```
npm install @douxcode/vue-bottom-sheet
```

# Getting started

## Basic usage

```vue
<script setup>
import BottomSheet from '@douxcode/vue-bottom-sheet'
import '@douxcode/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'

const bottomSheet = ref(null)

const open = () => {
  bottomSheet.value.open()
}

const close = () => {
  bottomSheet.value.close()
}
</script>

<template>
  <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
</template>
```

## Basic usage `setup` + TS

```vue
<script setup lang="ts">
import BottomSheet from '@douxcode/vue-bottom-sheet'
import '@douxcode/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()

const open = () => {
  bottomSheet.value.open()
}

const close = () => {
  bottomSheet.value.close()
}
</script>

<template>
  <BottomSheet ref="bottomSheet"> Your content </BottomSheet>
</template>
```

## Usage in Nuxt 3

For Nuxt 3, just wrap component in `<client-only>`

```vue
<template>
  <ClientOnly>
    <template>
      <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
    </template>
  </ClientOnly>
</template>
```

## CSS Custom Properties

```css
:root {
  --rsbs-backdrop-bg: rgba(0, 0, 0, 0.6);
  --rsbs-bg: #fff;
  --rsbs-handle-bg: hsla(0, 0%, 0%, 0.14);
  --rsbs-max-w: auto;
  --rsbs-ml: env(safe-area-inset-left);
  --rsbs-mr: env(safe-area-inset-right);
  --rsbs-overlay-rounded: 16px;
}
```

## Props

| Prop                | Type     | Description                                                                   | Example                          | Defaults |
| ------------------- | -------- | ----------------------------------------------------------------------------- | -------------------------------- | -------- |
| snapPoints          | Number[] | Defines custom snapping positions for the bottom sheet                        | `:snapPoints="[300, 600, 900]"`  | true     |
| defaultSnapPoint    | Number   | Specifies the default snap point                                              | `:default-snap-point="600"`      | true     |
| blocking            | Boolean  | Controls whether the bottom sheet blocks interactions with underlying content | `:blocking="true"`               | true     |
| canSwipeClose       | Boolean  | Enables or disables swipe gestures for closing the sheet                      | `:can-swipe-close="true"`        | true     |
| canOverlayClose     | Boolean  | Allows tapping the overlay to close the sheet                                 | `:can-overlay-close="true"`      | true     |
| expandOnContentDrag | Boolean  | Enables expanding the sheet by dragging its content                           | `:expand-on-content-drag="true"` | true     |

## Exposed methods

Assuming there is `const bottomSheet = ref()`

| Method      | Description                          | Example                              |
| ----------- | ------------------------------------ | ------------------------------------ |
| snapToPoint | Snaps the sheet to a specified point | `bottomSheet.value.snapToPoint(300)` |
| open        | Opens the bottom sheet               | `bottomSheet.value.open()`           |
| close       | Closes the bottom sheet              | `bottomSheet.value.close()`          |

## Events

| Event      | Description                                                                           | Example                   |
| ---------- | ------------------------------------------------------------------------------------- | ------------------------- |
| min-height | Fires when the minimum height of the sheet changes. Passes the value as an argument.  | `@min-height="(n) => {}"` |
| max-height | Fires when the maximum height of the window changes. Passes the value as an argument. | `@max-height="(n) => {}"` |
| opened     | Fires when the bottom sheet is opened                                                 | `@opened="() => {}"`      |
| closed     | Fires when the bottom sheet is closed                                                 | `@closed="() => {}"`      |

## Acknowledgments

This project was inspired by the following:

- [react-spring-bottom-sheet]: Accessible ♿️, Delightful ✨, & Fast 🚀
- [@webzlodimir/vue-bottom-sheet]: 🔥 A nice clean and touch-friendly bottom sheet component based on Vue.js and Hammer.js for Vue 3

[@vueuse/gesture]: https://gesture.vueuse.org/
[@vueuse/motion]: https://motion.vueuse.org/
[react-spring-bottom-sheet]: https://react-spring.bottom-sheet.dev/
[@webzlodimir/vue-bottom-sheet]: https://github.com/vaban-ru/vue-bottom-sheet
