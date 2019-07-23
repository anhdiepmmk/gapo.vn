import _ from 'lodash';
let initialState = {
    items: [],
    count: 0
};
export default (state = initialState, action) => {
    let tmp = _.cloneDeep(state);
    switch (action.type) {
        case 'SET_NOTIFICATION_COUNT':
            tmp.count = action.data;
            return tmp;
        default:
            break;
    }
    return state;
}