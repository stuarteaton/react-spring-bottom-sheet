<script setup lang="ts">
useHead({
  bodyAttrs: {
    id: 'root',
  },
})

const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

const config = useRuntimeConfig()

interface PostMeta {
  src: string
  code: string
}

interface Post {
  id: string
  title: string
  description: string
  path: string
  meta: PostMeta
}

const { data: posts }: { data: Ref<Post[]> } = await useAsyncData('pages', () =>
  queryCollection('content').select('id', 'title', 'description', 'meta', 'path').all(),
)

onMounted(() => {
  window.addEventListener('touchstart', (event) => {
    const element = event.target as HTMLElement

    if (element) {
      window.parent.document.body.style.overflow = ''
    }
  })
})
</script>

<template>
  <UContainer class="mb-12">
    <div class="flex justify-between py-4 items-center">
      <h1 class="text-xl xl:text-2xl font-bold">Vue Spring Bottom Sheet</h1>
      <div class="flex gap-4">
        <UButton
          :to="config.public.githubRepositoryLink"
          :icon="'lucide-github'"
          color="neutral"
          variant="outline"
        />
        <ClientOnly v-if="!colorMode?.forced">
          <UButton
            :icon="isDark ? 'lucide-moon' : 'lucide-sun'"
            color="neutral"
            variant="outline"
            @click="isDark = !isDark"
          >
            {{ isDark ? 'Light' : 'Dark' }}
          </UButton>
          <template #fallback>
            <div class="size-8" />
          </template>
        </ClientOnly>
      </div>
    </div>
    <div v-for="post in posts" :key="post.id">
      <ExampleSnippet
        :to="'/examples' + post.path"
        :src="post.meta.src"
        :code="post.meta.code"
        :description="post.description"
      >
        <template #title>
          {{ post.title }}
        </template>
      </ExampleSnippet>
    </div>
  </UContainer>
</template>
