<template>
    <div>
        <Button label="登入 Spotify" icon="pi pi-sign-in" iconPos="right" @click="login" :loading="loading" />
        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script setup>
const loading = ref(false);
const error = ref('');
const emit = defineEmits(['login-success']);

let loginWindow = null;

function handleMessage(event) {      
    if (event.data.type === 'spotify-login-success') {
        loading.value = false;
        if (loginWindow) {
            loginWindow.close();
        }
        emit('login-success');
    }
}

onMounted(() => {
    window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
});

async function login() {
    loading.value = true;
    error.value = '';
    try {
        const { url } = await $fetch('/api/spotify/login');
        loginWindow = window.open(url, 'Spotify Login', 'width=800,height=600');
        
        const checkLoginStatus = setInterval(() => {
            if (loginWindow.closed) {
                clearInterval(checkLoginStatus);
                loading.value = false;
            }
        }, 1000);
    } catch (e) {
        error.value = '登入失敗，請稍後再試';
        loading.value = false;
    }
}
</script>
