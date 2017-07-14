<template>
  <v-app light>
    <v-toolbar class="indigo" dark>
      <v-toolbar-title>Workdone</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </main>
    <v-footer>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {

  }
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
