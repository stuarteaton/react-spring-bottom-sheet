<template>
  <nav class="navbar">
    <ul class="nav-list">
      <RouterLink to="/" class="nav-item">Basic</RouterLink>
      <RouterLink to="/snap" class="nav-item">Snap point & content drag</RouterLink>
      <RouterLink to="/sticky" class="nav-item">Sticky Header & Footer</RouterLink>
      <RouterLink to="/blocking" class="nav-item">Non-blocking mode</RouterLink>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #e6e6e6;
  font-size: 14px;
}

.nav-list {
  list-style: none;
  display: flex;
  justify-content: space-around;
  margin: 0;
}

.nav-item {
  color: black;
  text-decoration: none;
  padding: 1rem;
  transition:
    color 150ms ease-in-out,
    background-color 150ms ease-in-out;
}

.nav-item:hover {
  background-color: #cfcfcf;
}

.nav-item.router-link-active {
  color: #646cff;
}
</style>
