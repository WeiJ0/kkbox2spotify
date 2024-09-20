<template>
  <div class="container mx-auto">
    <Toolbar>
      <template #start>
        <h1>KKBOX 到 Spotify 播放列表轉換</h1>
      </template>

      <template #end>
        <span v-if="userName">HiHi，{{ userName }}！</span>
        <Button class="ms-3" v-if="isLoggedIn" label="登出" @click="logout"></Button>
      </template>
    </Toolbar>

    <Stepper value="1" linear>
      <StepList>
        <Step value="1">從 KKBOX 選擇要移轉的歌曲</Step>
        <Step value="2">登入 Spotify</Step>
        <Step value="3">新建播放清單</Step>
      </StepList>
      <StepPanel value="1" v-slot="{ activateCallback }">
        <div class="p-5">
          <KkboxPlaylistInput @playlist-loaded="handlePlaylistLoaded" />
          <SongList :songs="songs" @songs-selected="handleSongsSelected" />
          <Button class="mt-5" :disabled="!selectedSongs.length" label="下一步" icon="pi pi-arrow-right" iconPos="right"
            @click="isLoggedIn ? activateCallback('3') : activateCallback('2')" />
        </div>
      </StepPanel>
      <StepPanel value="2" v-slot="{ activateCallback }">
        <div class="p-5">
          <SpotifyLogin v-if="selectedSongs.length && !isLoggedIn"
            @login-success="handleSpotifyLogin(activateCallback)" />
          <Button class="mt-5" label="上一步" icon="pi pi-arrow-left" iconPos="left" @click="activateCallback('1')" />
        </div>
      </StepPanel>
      <StepPanel value="3" v-slot="{ activateCallback }">
        <div class="p-5">

          <div class="flex">
            <InputText type="text" v-model="playlistName" placeholder="请输入播放清單名稱" />
            <Button class="ms-5" label="建立" icon="pi pi-plus" iconPos="right" @click="createSpotifyPlaylist" />
          </div>
          <p v-if="creationMessage">{{ creationMessage }}</p>
          <div v-if="failAddList.length > 0">
            <Message severity="warn">以下歌曲在 Spotify 中並未找到相同歌名及相同歌手</Message>
            <ul>
              <li v-for="song in failAddList">{{ song }}</li>
            </ul>
          </div>
          <div class="flex justify-end">
            <Button severity="secondary" class="mt-10" label="回首頁重新操作" icon="pi pi-home" iconPos="left" @click="home" />
          </div>
        </div>
      </StepPanel>
    </Stepper>
  </div>
</template>

<script setup>
const playListInfo = ref({})
const selectedSongs = ref([])
const isLoggedIn = ref(false)
const userName = ref('')

onMounted(async () => {
  try {
    const { loggedIn, name } = await $fetch('/api/spotify/check-auth')
    isLoggedIn.value = loggedIn
    userName.value = name
  } catch (error) {
    console.error('登入狀態檢查異常:', error)
  }
})

function handlePlaylistLoaded(loadedSongs) {
  playListInfo.value = loadedSongs
}

const songs = computed(() => {
  return playListInfo.value?.tracks?.data || [];
});

function handleSongsSelected(selected) {
  selectedSongs.value = selected
}

function handleSpotifyLogin(callback) {  
  isLoggedIn.value = true
  callback('3');
}

const playlistName = ref('')
const creating = ref(false)
const creationMessage = ref('')
const failAddList = ref([])

async function createSpotifyPlaylist() {
  if (!playlistName.value) {
    creationMessage.value = '請輸入播放清單名稱'
    return
  }

  creating.value = true
  creationMessage.value = '建立播放清單中...'

  try {
    const result = await $fetch('/api/spotify/create-playlist', {
      method: 'POST',
      body: {
        playlistName: playlistName.value,
        tracks: selectedSongs.value
      }
    })
    creationMessage.value = `建好了，並且加入了 ${result.addedTracks} 首歌。`
    failAddList.value = result.notFoundTracks;
  } catch (error) {
    creationMessage.value = '建失敗了，請稍後再試一下。'
  } finally {
    creating.value = false
  }
}

function home() {
  window.location.reload()
}

async function logout() {
  try {
    await $fetch('/api/spotify/logout', { method: 'POST' })
    isLoggedIn.value = false
    userName.value = ''
    // 可能需要重置其他状态或重定向用户
  } catch (error) {
    console.error('登出功能異常:', error)
  }
}
</script>

<style>
@import 'primeicons/primeicons.css';
@tailwind components;
@tailwind utilities;
</style>