import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler((event) => {
    const accessToken = getCookie(event, "spotify_access_token");
    const userName = getCookie(event, "spotify_user_name");

    return {
        loggedIn: !!accessToken,
        name: userName || null
    };
});
