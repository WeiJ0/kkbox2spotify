import { defineEventHandler, setCookie } from "h3";

export default defineEventHandler((event) => {    
    setCookie(event, "spotify_access_token", "", {
        maxAge: 0,
        path: "/",
    });
    setCookie(event, "spotify_refresh_token", "", {
        maxAge: 0,
        path: "/",
    });
    setCookie(event, "spotify_user_name", "", {
        maxAge: 0,
        path: "/",
    });

    return { success: true, message: "已成功登出" };
});
