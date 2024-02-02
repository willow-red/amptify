interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

interface TopItems{
    href: string;
    limit: number,
    next: string
    offset: number,
    previous: string,
    total: number,
    items: [{
        external_urls: {
            spotify: string
        },
        followers: {
            href: string
            total: number
        },
        genres: string[],
        href: string,
        id: string,
        images: Image[],
        name: string,
        popularity: number,
        type: string,
        uri: string
    }]
}