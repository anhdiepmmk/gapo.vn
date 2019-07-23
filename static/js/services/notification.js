
import PubSub from 'pubsub-js';
import services from '../services';
import config from './config';
let noti = {};
noti.register = async () => {
    return new Promise((resolve, reject) => {
        window.$(document).ready(async () => {
            // const firebaseConfig = {
            //     apiKey: "AIzaSyAE5nnv-s4Jql1MFsyrTy2rA5mRJeXaMOo",
            //     authDomain: "gapo-2019.firebaseapp.com",
            //     databaseURL: "https://gapo-2019.firebaseio.com",
            //     projectId: "gapo-2019",
            //     storageBucket: "gapo-2019.appspot.com",
            //     messagingSenderId: "496160243049",
            //     appId: "1:496160243049:web:c69da7361e3e919c"
            // };

            const firebaseConfig = config.firebase;

            // Initialize Firebase
            window.firebase.initializeApp(firebaseConfig);
            const messaging = window.firebase.messaging();
            messaging.usePublicVapidKey("BMtFjGKADMD7-fibv004MgbmhPW9jffHlda6eBuK8Oofvnve-l1GC2RdSlFne4Ghy7-N8Nh5NBJO3yVvsxEaqfI");



            function getTokenFCM() {
                return new Promise((resolve, reject) => {
                    messaging.getToken().then((currentToken) => {
                        if (currentToken) {
                            resolve(currentToken);
                        } else {
                            reject();
                            console.log('fcm No Instance ID token available. Request permission to generate one.');
                        }
                    }).catch((err) => {
                        reject();
                        console.log('fcm An error occurred while retrieving token. ', err);
                    });
                })
            }


            //in foreground
            messaging.onMessage((payload) => {
                console.log('noti onmessage', payload);
                PubSub.publish('notification', payload);
                services.helper.getNotification()
            });


            //requestPermission
            window.requestNotificationPermission = () => {
                return new Promise((resolve, reject) => {
                    Notification.requestPermission().then((permission) => {
                        console.log('permission notification', permission);
                        if (permission === 'granted') {
                            getTokenFCM().then(rs => {
                                resolve(rs);
                            })
                        } else {
                            reject();
                            console.log('Unable to get permission to notify.');
                        }
                    });
                })
            }
            window.regisNotification = async () => {
                try {
                    let token = await window.requestNotificationPermission();
                    if (token) {
                        let data = {
                            "fcm_token": token,
                            "os_version": 1,
                            "app_version": 1,
                            "os_name": "web"
                        }
                        try {
                            let rs = await services.data.registerNotification(data);
                            console.log('noti register done', rs)
                        } catch (err) {
                            console.log('noti fail', err);
                        }
                    }
                } catch (err) {
                    console.log('Cannot requets notification');
                }
            }
            window.regisNotification().then(rs => {
                resolve();
            })
        })
    })
}
export default noti
