# Vue Spring Bottom Sheet

**vue-spring-bottom-sheet** is built on top of **[motion-v]**.

😎 **Modern** and 🚀 **Performant** Bottom Sheet for Vue.js

[Demo](https://vue-spring-bottom-sheet.douxcode.com/) 👀

| ![](https://vue-spring-bottom-sheet.douxcode.com/example_basic.png) | ![](https://vue-spring-bottom-sheet.douxcode.com/example_snap.png) | ![](https://vue-spring-bottom-sheet.douxcode.com/example_blocking.png) | ![](https://vue-spring-bottom-sheet.douxcode.com/example_sticky.png) |
| :-----------------------------------------------------------------: | :----------------------------------------------------------------: | :--------------------------------------------------------------------: | :------------------------------------------------------------------: |

# Installation

```
npm install @douxcode/vue-spring-bottom-sheet
```

```
bun install @douxcode/vue-spring-bottom-sheet
```

# Getting started

## Basic usage

```vue
<script setup>
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'
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
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'
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

For Nuxt 3, just wrap component in `<ClientOnly>`

```vue
<template>
  <ClientOnly>
    <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
  </ClientOnly>
</template>
```

## Slots

```vue
<template>
  <BottomSheet ref="bottomSheet">
    <template #header> Header </template>
    <div>Your content</div>
    <template #footer> Footer </template>
  </BottomSheet>
</template>
```

## CSS Custom Properties

```css
--vsbs-backdrop-bg: rgba(0, 0, 0, 0.5);
--vsbs-shadow-color: rgba(89, 89, 89, 0.2);
--vsbs-background: #fff;
--vsbs-border-radius: 16px;
--vsbs-max-width: 640px;
--vsbs-border-color: rgba(46, 59, 66, 0.125);
--vsbs-padding-x: 16px;
--vsbs-handle-background: rgba(0, 0, 0, 0.28);
```

## Props

### Prop Definitions

| Prop                | Type     | Type        | Description                                |
| ------------------- | -------- | ----------- | ------------------------------------------ |
| duration            | Number   | 250         | Animation duration in milliseconds         |
| snapPoints          | Number[] | [minHeight] | Custom snapping positions                  |
| initialSnapPoint    | Number   | undefined   | Initial snap point index                   |
| blocking            | Boolean  | true        | Block interactions with underlying content |
| canSwipeClose       | Boolean  | true        | Enable swipe-to-close gesture              |
| canOverlayClose     | Boolean  | true        | Allow closing by tapping backdrop          |
| expandOnContentDrag | Boolean  | true        | Enable expanding by dragging content       |

## Exposed methods

Assuming there is `const bottomSheet = ref()`

| Method      | Description               | Example                              |
| ----------- | ------------------------- | ------------------------------------ |
| open        | Opens the bottom sheet    | `bottomSheet.value.open()`           |
| close       | Closes the bottom sheet   | `bottomSheet.value.close()`          |
| snapToPoint | Snaps to a specific point | `bottomSheet.value.snapToPoint(300)` |

## Events

| Event          | Description                           |
| -------------- | ------------------------------------- |
| opened         | Triggered when bottom sheet opens     |
| closed         | Triggered when bottom sheet closes    |
| dragging-up    | Triggered when dragging up            |
| dragging-down  | Triggered when dragging down          |
| instinctHeight | Triggered when content height changes |

## Acknowledgments

This project was inspired by the following:

- [react-spring-bottom-sheet]: Accessible ♿️, Delightful ✨, & Fast 🚀
- [@webzlodimir/vue-bottom-sheet]: 🔥 A nice clean and touch-friendly bottom sheet component based on Vue.js and Hammer.js for Vue 3

[motion-v]: https://motion.unovue.com/
