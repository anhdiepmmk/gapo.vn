let config = {
    // host: 'https://api.beatvn.club',
    host: 'https://api.gapo.vn/main/v1.0',
    uploadHost: 'https://upload.gapo.vn',
    notiHost: 'https://api.gapo.vn/notification/v1.0',
    mobileHost: 'https://api.gapo.vn/mobile-push/v1.0',
    linkPreviewHost: 'https://api.gapo.vn/link-preview/v1.0',
    maxPostLength: 225,
    maxPostComment: 190,
    maxPostReply: 100,
    defaultToken: '',
    defaultChatToken: '3mx6h67tfidh3cen9eozoamche',
    debug: true,
    gapoTeam: '4ty3pg8ujidfimwwz1xn3srb5o',
    chatHost: 'https://chat.gapo.vn',
    // chatSocket: 'http://localhost:4000'
    chatSocket: 'wss://chat.gapo.vn/api/v4/websocket',
    fbAppId: '1345809732247599',
    firebase: {
        apiKey: "AIzaSyAE5nnv-s4Jql1MFsyrTy2rA5mRJeXaMOo",
        authDomain: "gapo-2019.firebaseapp.com",
        databaseURL: "https://gapo-2019.firebaseio.com",
        projectId: "gapo-2019",
        storageBucket: "gapo-2019.appspot.com",
        messagingSenderId: "496160243049",
        appId: "1:496160243049:web:c69da7361e3e919c"
    },
    getDefaultCover: () => {
        let img = Math.floor(Math.random() * 100) % 5 + 1;
        return `https://image-1.gapo.vn/images/cover_${img}.png`
    },
    defaultAvatar: '/assets/images/default-user-avatar.png',
    defaultCover: '/assets/images/default-cover.jpg',
    defaultUser: '/assets/images/default-user-avatar.png',
    defaultPageAvatar: '/assets/images/default-page-avatar.png',
    defaultInterest: {
        food: '/assets/images/Food.png',
        hot_girl: '/assets/images/hot-girl.png',
        game: '/assets/images/Game.png',
        news: '/assets/images/News.png',
        love: '/assets/images/Love.png',
        funny: '/assets/images/Funny.png',
        entertain: '/assets/images/Entertain.png',
        cute: '/assets/images/Cute.png',
        feeling: '/assets/images/Feeling.png',
        travel: '/assets/images/Travel.png',
        jobs: '/assets/images/Jobs.png',
        lostAndFound: '/assets/images/Lost-and-Found.png',
        meetup: '/assets/images/Meetup.png',
        hobby: '/assets/images/Hobby.png',
        pet: '/assets/images/Pet.png',
        sports: '/assets/images/Sports.png',
        fashion: '/assets/images/Fashion.png',
        artist: '/assets/images/Artist.png',
        education: '/assets/images/Education.png',
        brand: '/assets/images/Brand.png'
    }
}
export default config;