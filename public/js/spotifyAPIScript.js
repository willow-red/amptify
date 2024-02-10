/*Spotify API Script courtesy of spotify!! I did not write most of this LOL please don't sue me spottyfy love you bye */
const clientId = "68738c44f66d4a36937371c85722708c";
const redirect_uri = "https://willow-red.github.io/cyberfy/";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
let accessToken = null;

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const topTracks = await fetchTopTracks(accessToken, timeRange);
    populateUI(profile, topTracks);
}
export async function reloadData(timeRange="short") {
    //get new time range
    const topTracks = await fetchTopTracks(accessToken, timeRange);
    populateUI(profile, topTracks);
}
export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirect_uri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
async function fetchTopTracks(token, timeRange="short") {
    timeRange += "_term";
    const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

//I lowkey wrote this part actually
function populateUI(profile, topTracks) {
    document.getElementById("displayName").innerText = profile.display_name;
    //top tracks
    for (var i = 0; i < topTracks.items.length; i++) {
        const track = topTracks.items[i];
        const li = document.createElement("li");
        var trackInfo = track.name + " - ";
        for (var j = 0; j < track.artists.length; j++) {
            trackInfo += track.artists[j].name + " ";
        }
        li.innerText = trackInfo;
        document.getElementById("topTracks").appendChild(li);
    }
}