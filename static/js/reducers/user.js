import local from '../services/local';
let stored = local.get('userInfo');
const DEFAULT_AVATAR = '/assets/images/default-user-avatar.png',
    DEFAULT_COVER = '/assets/images/default-cover.jpg';
let initialState = {
    avatar: '/assets/images/default-user-avatar.png'
};
if (stored) {
    initialState = JSON.parse(stored);
    if (!initialState.avatar) initialState.avatar = DEFAULT_AVATAR;
    if (!initialState.cover) initialState.cover = DEFAULT_COVER;
    console.log('LOADED USER INFO', initialState);
}
export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER_INFO':
            if (!action.data.avatar) action.data.avatar = DEFAULT_AVATAR;
            if (!action.data.cover) action.data.cover = DEFAULT_COVER;
            local.set('userInfo', JSON.stringify(action.data));
            return action.data;
        default:
            break;
    }
    return state;
}