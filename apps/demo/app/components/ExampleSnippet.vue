<script lang="ts" setup>
const showExample = ref(false)

defineProps<{
  description: string
  code: string
  to: string
}>()
</script>

<template>
  <UCard class="mt-10">
    <template #header>
      <div class="flex justify-between">
        <h2 class="text-xl font-bold text-pretty"><slot name="title" /></h2>
        <UButton variant="soft" size="lg" :to="to"> Open Example </UButton>
      </div>
    </template>
    <slot />
    <p class="mb-8 leading-loose text-pretty xl:text-lg" v-html="description" />
    <div class="grid lg:grid-cols-[1fr_384px] gap-8">
      <ClientOnly>
        <div class="overflow-x-auto">
          <VCodeBlock
            class="vue-code-block"
            :browser-window="true"
            :code="code"
            highlightjs
            lang="html"
            theme="neon-bunny-carrot"
          />
        </div>
      </ClientOnly>
      <div class="shrink-0">
        <div
          class="rounded-4xl aspect-[9/18.5] border-13 max-w-[384px] mx-auto border-black overflow-hidden"
        >
          <iframe v-if="to && showExample" class="w-full h-full" :src="to" frameborder="0" />
          <button
            v-else
            type="button"
            class="w-full h-full bg-white dark:bg-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors hover:cursor-pointer"
            @click="showExample = true"
          >
            <div class="flex flex-col gap-5 items-center justify-center h-full">
              <Icon name="lucide-circle-play" class="size-40" mode="svg" />
              <span class="text-xl">Load Example</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </UCard>
</template>
