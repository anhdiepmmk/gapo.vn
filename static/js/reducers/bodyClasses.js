let initialState = 'has-bottom-nav fixed-top-nav';
export default (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_BODY_CLASSES':
            return action.data;
        default:
            break;
    }
    return state;
}