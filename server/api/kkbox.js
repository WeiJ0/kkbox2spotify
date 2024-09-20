import { defineEventHandler, readBody } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { playlistUrl } = body;

    try {
        const playlistId = extractPlaylistIdFromUrl(playlistUrl);
        const accessToken = await getKkboxAccessToken();

        const response = await axios.get(
            `https://api.kkbox.com/v1.1/shared-playlists/${playlistId}?territory=TW`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
                
        return response.data;

    } catch (error) {
        console.error("播放清單取得失敗:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "播放清單取得失敗:" + error,
        });
    }
});

function extractPlaylistIdFromUrl(url) {
    const match = url.match(/playlist\/([^?]+)/);
    return match ? match[1] : null;
}

async function getKkboxAccessToken() {
    const clientId = process.env.KKBOX_CLIENT_ID
    const clientSecret = process.env.KKBOX_CLIENT_SECRET

    const response = await axios.post('https://account.kkbox.com/oauth2/token', 
        new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    return response.data.access_token
}
