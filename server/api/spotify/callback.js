import { defineEventHandler, getCookie, setCookie } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
    const { code, state } = getQuery(event);

    // 驗證state以防止CSRF攻擊
    const storedState = getCookie(event, "spotify_auth_state");
    if (storedState) {
        if (state !== storedState) {
            throw createError({
                statusCode: 400,
                statusMessage: "State mismatch",
            });
        }
    }

    try {
        const tokenResponse = await axios.post(
            "https://accounts.spotify.com/api/token",
            {
                code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                grant_type: "authorization_code",
            },
            {
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            process.env.SPOTIFY_CLIENT_ID +
                                ":" +
                                process.env.SPOTIFY_CLIENT_SECRET
                        ).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // 獲取使用者資訊
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const { display_name } = userResponse.data;

        // 將 token 存在HTTP-only cookie中
        setCookie(event, "spotify_access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600, // 1小時
        });

        setCookie(event, "spotify_refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        setCookie(event, "spotify_user_name", display_name, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600, // 1小時
        });

        // 關閉另開視窗
        return `
        <html>
            <body>
                <script>
                    window.opener.postMessage({
                        type: 'spotify-login-success',
                        userName: '${display_name}'
                    }, '*');
                    window.close();
                </script>
            </body>
        </html>
        `;
    } catch (error) {
        console.error("獲得 spotify token 失敗", error);
        throw createError({
            statusCode: 500,
            statusMessage: "獲得 spotify token 失敗",
        });
    }
});
