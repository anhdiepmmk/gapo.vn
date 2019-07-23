import Local from './local';
import Config from './config';

import axios from 'axios';
import services from '.';
let request = {};
request.cancelUpload = cancelToken => {
    source.cancel(cancelToken);
}
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
request.getCancelToken = () => {
    return source.token;
}
request.upload = async (url, formData, cancelToken, onProgress) => {
    console.log('form data', formData);
    let rs = await axios.request({
        method: "post",
        url: `${Config.uploadHost}${url}`,
        data: formData,
        // timeout: 100000,
        cancelToken,
        headers: {
            'Authorization': `Bearer ${Local.get('token')}`
        },
        onUploadProgress: (p) => {
            if (onProgress) { onProgress(p) }
            //fileprogress: p.loaded / p.total
            //})
        }
    })
    console.log('response', rs.data);
    return rs.data;
}
request.callMobile = async (url, data, headers, method = 'POST') => {
    url = `${Config.mobileHost}${url}`;
    var formData = new FormData();
    for (var name in data) {
        if (typeof (data[name]) === 'object') {
            formData.append(name, JSON.stringify(data[name]));
        } else {
            formData.append(name, data[name]);
        }

    }
    let option = {
        method,
        body: formData,
        headers: {
            // 'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${Local.get('token') || Config.defaultToken}`
        }
    };
    option.headers = Object.assign({}, option.headers, headers);
    if (method === 'GET') delete option.body;

    if (Config.debug) console.log(`[${method}]`, url, option, data);

    let res = await fetch(url, option);
    if (data === "ONLY_POST") return
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 401:
                if (!services.helper.checkLogged()) {
                    // window.location.replace('/login')
                    // services.helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                }
                throw rs;
            case 200:
                return rs;
            default:
                throw rs;
        }

    } catch (err) {
        console.log(res);
        throw err;
    }
}
request.callNoti = async (url, data, headers, method = 'POST') => {
    url = `${Config.notiHost}${url}`;
    var formData = new FormData();
    for (var name in data) {
        if (typeof (data[name]) === 'object') {
            formData.append(name, JSON.stringify(data[name]));
        } else {
            formData.append(name, data[name]);
        }

    }
    let option = {
        method,
        body: formData,
        headers: {
            // 'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${Local.get('token') || Config.defaultToken}`
        }
    };
    option.headers = Object.assign({}, option.headers, headers);
    if (method === 'GET') delete option.body;

    if (Config.debug) console.log(`[${method}]`, url, option, data);

    let res = await fetch(url, option);
    if (data === "ONLY_POST") return
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 401:
                if (!services.helper.checkLogged()) {
                    // window.location.replace('/login')
                    // services.helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                }
                throw rs;
            case 200:
                return rs;
            default:
                throw rs;
        }

    } catch (err) {
        console.log(res);
        throw err;
    }
}
request.call = async (url, data, headers, method = 'POST') => {
    url = `${Config.host}${url}`;
    var formData = new FormData();
    for (var name in data) {
        if (typeof (data[name]) === 'object') {
            formData.append(name, JSON.stringify(data[name]));
        } else {
            formData.append(name, data[name]);
        }

    }
    let option = {
        method,
        body: formData,
        headers: {
            // 'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${Local.get('token') || Config.defaultToken}`
        }
    };
    option.headers = Object.assign({}, option.headers, headers);
    if (method === 'GET') delete option.body;

    if (Config.debug) console.log(`[${method}]`, url, option, data);

    let res = await fetch(url, option);
    if (data === "ONLY_POST") return
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 401:
                if (!services.helper.checkLogged()) {
                    // window.location.replace('/login')
                    // services.helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                }
                throw rs;
            case 200:
                return rs;
            default:
                throw rs;
        }

    } catch (err) {
        console.log(res);
        throw err;
    }
}

request.callTypeJson = async (url, data, method = 'POST') => {
    url = `${Config.mobileHost}${url}`;
    let option = {
        method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Type': 'application/json',
            'Authorization': `Bearer ${Local.get('token')}`,
        }
    };
    if (Config.debug) console.log(`[med${method}]`, url, option, data);
    let res = await fetch(url, option);
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 401:
                // if (!services.helper.checkLogged()) {
                //     // window.location.replace('/login')
                //     // services.helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                // }
                throw rs;
            case 200:
                return rs;
            default:
                throw rs;
        }

    } catch (err) {
        console.log(res);
        throw err;
    }
}

request.callLinkPreviewJson = async (url, data, method = 'POST') => {
    url = `${Config.linkPreviewHost}${url}`;
    let option = {
        method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Type': 'application/json',
            'Authorization': `Bearer ${Local.get('token')}`,
        }
    };
    if (method === 'GET') delete option.body;
    if (Config.debug) console.log(`[med${method}]`, url, option, data);
    let res = await fetch(url, option);
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        switch (res.status) {
            case 401:
                // if (!services.helper.checkLogged()) {
                //     // window.location.replace('/login')
                //     // services.helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                // }
                throw rs;
            case 200:
                return rs;
            default:
                throw rs;
        }

    } catch (err) {
        console.log(res);
        throw err;
    }
}
export default request;