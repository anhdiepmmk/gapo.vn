
import config from './config';
let pipe = {};
pipe.user = user => {
    if (!user.display_name) user.display_name = 'Gapo member';
    //profile url
    if (user.username) {
        user._profileUrl = `/${user.username}`
    } else {
        user._profileUrl = `/${user.id}`
    }
    // user._profileUrl = `/${user.id}`
    //avatar
    user.avatar = user.avatar || config.defaultAvatar;
    if (!user.cover) user.cover = config.getDefaultCover();
    return user;
}
pipe.page = page => {
    if (!page.avatar || page.avatar === 'undefined') page.avatar = config.defaultPageAvatar;
    if (!page.cover || page.cover === 'undefined') page.cover = config.getDefaultCover();
    return page;
}
export default pipe;