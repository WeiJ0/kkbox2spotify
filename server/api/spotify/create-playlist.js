import { defineEventHandler, readBody, getCookie } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "spotify_access_token");
    if (!accessToken) {
        throw createError({
            statusCode: 401,
            statusMessage: "尚未登入 spotify",
        });
    }

    const body = await readBody(event);
    const { playlistName, tracks } = body;

    try {
        const userResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userId = userResponse.data.id;

        // 创建新播放列表
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: playlistName,
                public: false,
                description: "從 KKBOX 播放清單導入",
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const playlistId = playlistResponse.data.id;

        // 搜尋歌曲
        const trackUris = await Promise.all(
            tracks.map(async (track) => {
                const searchResponse = await axios.get(
                    "https://api.spotify.com/v1/search",
                    {
                        params: {
                            q: `track:${track.name} artist:${track.album.artist.name}`,
                            type: "track",
                            limit: 1,
                        },
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                return searchResponse.data.tracks.items[0]?.uri;
            })
        );

        // 有找到的歌曲
        const validTrackUris = trackUris.filter((uri) => uri);

        // 加入播放清單
        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                uris: validTrackUris,
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        // 額外整理未找到的歌曲
        const notFoundTracks = tracks.filter((track, index) => !trackUris[index]).map(track => `${track.name} - ${track.album.artist.name}`);

        return {
            success: true,
            playlistId,
            addedTracks: validTrackUris.length,
            notFoundTracks: notFoundTracks
        };
    } catch (error) {
        console.error("建立 Spotify 播放清單失敗:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "建立 Spotify 播放清單失敗",
        });
    }
});
