# Vue Spring Bottom Sheet

**vue-spring-bottom-sheet** is built on top of **[@vueuse/gesture]** and **[@vueuse/motion]**.

😎 **Modern** and 🚀 **Performant** Bottom Sheet for Vue.js

- **Fluid Transitions:** Snap points ensure smooth and performant animations.
- **Optimized for Accessibility:** Keyboard support for a seamless user experience.
- **Adaptable Interaction Models:** Blocking and non-blocking for different use cases.

# Installation

```
npm install @douxcode/vue-bottom-sheet
```

# Getting started

## Basic usage

```vue
<script setup>
import VueBottomSheet from '@douxcode/vue-bottom-sheet'
import '@douxcode/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'

const myBottomSheet = ref(null)

const open = () => {
  myBottomSheet.value.open()
}

const close = () => {
  myBottomSheet.value.close()
}
</script>

<template>
  <BottomSheet ref="myBottomSheet"> Your awesome content </BottomSheet>
</template>
```

## Basic usage `setup` + TS

```vue
<script setup lang="ts">
import VueBottomSheet from '@douxcode/vue-bottom-sheet'
import '@douxcode/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'

const myBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()

const open = () => {
  myBottomSheet.value.open()
}

const close = () => {
  myBottomSheet.value.close()
}
</script>

<template>
  <BottomSheet ref="myBottomSheet"> Your content </BottomSheet>
</template>
```

## Usage in Nuxt 3

For Nuxt 3, just wrap component in `<client-only>`

```vue
<template>
  <ClientOnly>
    <template>
      <BottomSheet ref="myBottomSheet"> Your awesome content </BottomSheet>
    </template>
  </ClientOnly>
</template>
```

## Props

| Prop                | Type    | Description                                                                      | Example                                 | Defaults  |
| ------------------- | ------- | -------------------------------------------------------------------------------- | --------------------------------------- | --------- |
| snapPoints          | Number  | Define custom snapping positions for the bottom sheet                            | `:default-breakpoint="[300, 600, 900]"` | true      |
| defaultBreakpoint   | Number  | Specify the default breakpoint                                                   | `:default-breakpoint="600"`             | true      |
| blocking            | Boolean | Control whether the bottom sheet blocks interactions with the underlying content | `:blocking="true"`                      | true      |
| canSwipeClose       | Boolean | Enable or disable swiping gestures to close the sheet                            | `:can-swipe-close="true"`               | true      |
| canOverlayClose     | Boolean | Allow tapping on overlay to close it                                             | `:can-overlay-close="false"`            | true      |
| expandOnContentDrag | Boolean | Enable expanding the sheet by dragging its content                               | `:expand-on-content-drag="#0000004D"`   | #0000004D |

## Exposed methods

| Method      | Description                                                              | Example                             |
| ----------- | ------------------------------------------------------------------------ | ----------------------------------- |
| snapToPoint | Fire when card component is opened                                       | `myBottomSheet.value.snapToPoint()` |
| open        | Fires when min-height of sheet has changed and passes it as an argument  | `myBottomSheet.value.open()`        |
| close       | Fires when max-height of window has changed and passes it as an argument | `myBottomSheet.value.close()`       |

## Events

| Event      | Description                                                              | Example                   |
| ---------- | ------------------------------------------------------------------------ | ------------------------- |
| min-height | Fires when min-height of sheet has changed and passes it as an argument  | `@min-height="(n) => {}"` |
| max-height | Fires when max-height of window has changed and passes it as an argument | `@max-height="(n) => {}"` |
| opened     | Fire when card component is opened                                       | `@opened="() => {}"`      |
| closed     | Fire when card component is closed                                       | `@closed="() => {}"`      |

[@vueuse/gesture]: https://gesture.vueuse.org/
[@vueuse/motion]: https://motion.vueuse.org/
