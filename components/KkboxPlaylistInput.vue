<template>
    <div>
        <InputText class="w-1/2" type="text" v-model="playlistUrl" placeholder="請貼上 KKBOX 播放清單連結" />
        <Button type="button" :disabled="!playlistUrl" class="ms-3" label="載入清單" icon="pi pi-cloud-download" :loading="loading" @click="loadPlaylist" />        
        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script setup>
const playlistUrl = ref('')
const loading = ref(false)
const error = ref('')
const emit = defineEmits(['playlist-loaded'])

async function loadPlaylist() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await useFetch('/api/kkbox', {
            method: 'POST',
            body: { playlistUrl: playlistUrl.value }
        })
        emit('playlist-loaded', data.value)
    } catch (e) {
        error.value = '獲得歌曲失敗，請確認網址是否正確'
    } finally {
        loading.value = false
    }
}
</script>
