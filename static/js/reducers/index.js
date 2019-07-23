import user from './user'
import bodyClasses from './bodyClasses';
import { combineReducers } from 'redux';
import modals from './modals';
import notification from './notification';
import video from './video';
const rootReducer = combineReducers({ video, user, bodyClasses, modals, notification });
export default rootReducer;