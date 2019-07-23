import _ from 'lodash';
let initialState = {
    activeVideo: 0,

};
export default (state = initialState, action) => {
    let tmp = _.cloneDeep(state);
    switch (action.type) {
        case 'SET_ACTIVE_VIDEO':
            tmp.activeVideo = action.data;
            return tmp;
        default:
            break;
    }
    return state;
}