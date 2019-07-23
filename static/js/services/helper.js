import moment from 'moment';
import configStore from '../configStore';
import local from './local';
import data from './data';
import sanitizeHtml from 'sanitize-html';
import urlMetadata from 'url-metadata';
import _ from 'lodash';

let helper = {};
helper.showUserLikePost = post_id => {
    if (!helper.checkLogged()) {
        return helper.loginRequired();
    }
    if (!helper.checkActive()) {
        return helper.requestActive().then(rs => {
            if (rs === 'active') {
                window.location.href = '/login/update-information'
            }
        })
    }
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'userLike',
                post_id,
                cb: () => {
                    resolve();
                }
            }
        });
    })
}
helper.getUrlMeta = str => {
    urlMetadata(str).then(
        function (metadata) { // success handler
            console.log('meta', metadata)
        },
        function (error) { // failure handler
            console.log('meta', error)
        })
}
helper.sanitizeHtml = str => {
    return sanitizeHtml(str);
}
helper.removeAlias = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
helper.extractUrl = content => {
    if (!content) return '';
    let rs = content.match(/\bhttps?:\/\/\S+/gi);
    if (rs) return rs[0]
    // var re = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    // let m = re.exec(content + ' ');
    // if (m) return m[0];
    return '';
}

helper.refreshNotificationStats = async () => {
    if (!helper.checkLogged()) return;
    let rs = await data.resetNotification();
    configStore().dispatch({
        type: 'SET_NOTIFICATION_COUNT', data: 0
    });
}
helper.getNotification = async () => {
    if (!helper.checkLogged()) return;
    let rs = await data.getNotificationStats();
    configStore().dispatch({
        type: 'SET_NOTIFICATION_COUNT', data: rs.data.unreadCount
    });
}
helper.getLocalStorageUserInfo = () => {
    return JSON.parse(local.get('userInfo'));
}
helper.checkPasswordStrength = pass => {
    let reg = new RegExp('^((?=.*[a-z])|(?=.*[A-Z]))(?=.*[0-9]).(?=.{7,250})')
    return reg.test(pass);
}

helper.showPost = (post_id, index = 0) => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'post',
                post_id,
                index,
                cb: () => {
                    resolve();
                }
            }
        });
    })
}
helper.showPostWithContent = (post_id, index = 0, content) => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'postWithContent',
                post_id,
                index,
                content,
                cb: () => {
                    resolve();
                }
            }
        });
    })
}
helper.sharePost = (post_data) => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'sharepost',
                post_data,
                cb: res => resolve(res)
            }
        });
    })
}
helper.checkLogged = () => {
    let rs = helper.getJWTInfo();
    let currentTime = new Date().getTime()
    if (rs && currentTime > rs.exp * 1000) { helper.alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại !') };
    if (!rs || currentTime > rs.exp * 1000) return false
    return true
}
helper.checkActive = () => {
    let userInfo = JSON.parse(local.get('userInfo'))
    if (!userInfo) return null
    return userInfo.status === 1 ? true : false
}
helper.isAdmin = () => {
    let rs = helper.getJWTInfo();
    return rs.permission === 20 || rs.permission === 50;
}
helper.getJWTInfo = () => {
    let raw = local.get('token');
    if (!raw) return null;
    let rs = helper.parseJwt(raw);
    return rs;
}
helper.parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};
helper.editPost = post => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'editpost',
                post,
                cb: rs => {
                    resolve(rs);
                }
            }
        });
    })
}
helper.pickImage = (user_id, page_id) => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'pickImage',
                user_id,
                page_id,
                callBack: rs => {
                    if (rs) return resolve(rs);
                    return reject(null);
                }
            }
        });
    })
}
helper.loginRequired = () => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'loginRequired',
                callBack: rs => {
                    resolve(rs);
                }
            }
        });
    })
}
helper.checkValidEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
helper.replaceAll = (str, search, replacement) => {
    if (!str) str = '';
    return str.replace(new RegExp(search, 'g'), replacement);
}
helper.checkPhone = phone => {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    return vnf_regex.test(phone);
}
helper.alert = content => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'message',
                content,
                cb: () => {
                    resolve();
                }
            }
        });
    })
}
helper.successAlert = content => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'success',
                content
            }
        })
    })
}
helper.copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
helper.confirm = content => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL', data: {
                type: 'confirm',
                content,
                cb: rs => {
                    if (rs) return resolve();
                    return reject();
                }
            }
        });
    })
}
helper.showCreateModal = () => {
    configStore().dispatch({
        type: 'PUSH_MODAL', data: {
            type: 'create'
        }
    })
}
helper.getDuration = unix_timestamp => {
    if (isNaN(unix_timestamp)) {
        return '';
    }
    let rs = moment.duration(moment.unix(unix_timestamp).diff(new Date())).locale('vi').humanize(true);
    return rs;
}
helper.formatNumber = num => {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}
helper.requestLogin = async () => {
    await helper.confirm('Vui lòng đăng nhập để sử dụng chức năng này');
}
helper.requestActive = () => {
    return new Promise((resolve, reject) => {
        configStore().dispatch({
            type: 'PUSH_MODAL',
            data: {
                type: 'active',
                callBack: rs => {
                    resolve(rs)
                }
            }
        })
    })
}
helper.setUserInfo = (loginResponse) => {
    local.set('token', loginResponse.token);
    local.set('chatToken', loginResponse.chatToken);
    if (Object.keys(loginResponse).includes('user')) {
        loginResponse.user.registerFCM = false;
    }
    local.set('userInfo', JSON.stringify(loginResponse.user));
}
helper.refeshUserInfo = (data) => {
    configStore().dispatch({
        type: 'SET_USER_INFO', data
    });
    local.set('userInfo', JSON.stringify(data));

}
export default helper;
