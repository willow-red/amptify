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
    const topTracks = await fetchTopTracks(accessToken, "short");
    populateUI(profile, topTracks);
}
export async function reloadTracks(timeRange = "short") {
    //get new time range
    const topTracks = await fetchTopTracks(accessToken, timeRange);
    populateTracks(topTracks);
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
async function fetchTopTracks(token, timeRange = "short") {
    timeRange += "_term";
    const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

//I lowkey wrote this part actually
function populateUI(profile, topTracks) {
    document.getElementById("displayName").innerText = profile.display_name;
    //top tracks
    populateTracks(topTracks);
}
function populateTracks(topTracks) {
    //clear previous
    document.getElementById("topTracks").innerHTML = "";
    //first add top track
    const top = topTracks.items[0];
    var topTrack = top.name + " - ";
    for (var i = 0; i < top.artists.length; i++) {
        topTrack += top.artists[i].name + ", ";
    }
    //trim extra comma and space
    topTrack = topTrack.substring(0, topTrack.length - 2);
    //check length
    if (topTrack.length > 38) {
        topTrack = topTrack.substring(0, 35) + "...";
    }
    document.getElementById("topTrackTitle").innerHTML = topTrack;
    //top tracks
    for (var i = 0; i < topTracks.items.length; i++) {
        const track = topTracks.items[i];
        const li = document.createElement("li");
        const div = document.createElement("div");
        div.classList.add("trackRow");
        const trackP = document.createElement("p");
        trackP.classList.add("trackName");
        const lengthP = document.createElement("p");
        lengthP.classList.add("trackLength");
        var trackInfo = track.name + " - ";
        for (var j = 0; j < track.artists.length; j++) {
            trackInfo += track.artists[j].name + ", ";
        }
        //trim extra comma and space
        trackInfo = trackInfo.substring(0, trackInfo.length - 2);
        if (trackInfo.length > 45) {
            trackInfo = trackInfo.substring(0, 45) + "...";
        }
        trackP.innerText = trackInfo;
        lengthP.innerText = msToMins(track.duration_ms);
        div.appendChild(trackP);
        div.appendChild(lengthP);
        li.appendChild(div);
        document.getElementById("topTracks").appendChild(li);
    }
}
function msToMins(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    if (seconds < 10) {
        return `${minutes}:0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}