import React from 'react';
import ReactDOM from 'react-dom';
import './styles/bootstrap.scss';
import 'emoji-mart/css/emoji-mart.css'
import 'react-image-lightbox/style.css';
import './styles/style.scss';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './styles/override.scss';
import 'moment-timezone';
import 'moment/locale/vi';
import App from './App';
import './services/notification';
import { Provider } from "react-redux";
import configStore from './configStore';
import './theme';
let store = configStore();
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById('root'));