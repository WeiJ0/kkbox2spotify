<template>
    <div>
        <h2>歌曲列表 <span v-if="songList">(共 {{songList[0].length }}首)</span></h2>
        <p>選擇要移轉的歌曲</p>
        <PickList v-model="songList" dataKey="id" breakpoint="1400px" scrollHeight="35rem" :showSourceControls="false">
            <template #option="{ option, selected }">
                <div class="flex flex-wrap p-1 items-center gap-4 w-full">
                    <img class="w-12 shrink-0 rounded" :src="option.album?.images[0]?.url" v-if="option.album?.images" />
                    <div class="flex-1 flex flex-col">
                        <span class="font-medium text-sm">{{ option.name }}</span>
                        <span
                            :class="['text-sm', { 'text-surface-500 dark:text-surface-400': !selected, 'text-inherit': selected }]">{{
                                option.album?.artist.name }}</span>
                    </div>
                </div>
            </template>
        </PickList>
    </div>
</template>

<script setup>
const props = defineProps(['songs'])
const emit = defineEmits(['songs-selected'])

const selectedSongs = ref([])
const songList = ref([props.songs, []]);

watch(() => props.songs, (newSongs) => {
    songList.value = [newSongs, []];
});

watch(() => songList.value[1], (newSelectedSongs) => {
    emit('songs-selected', newSelectedSongs);
}, { deep: true });

</script>