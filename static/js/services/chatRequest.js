import Local from './local';
import Config from './config';
import axios from 'axios';
let request = {};
request.upload = async (url, formData, cancelToken, onProgress) => {
    let options = {
        method: "post",
        mode: 'no-cors',
        url: `${Config.chatHost}${url}`,
        data: formData,
        // timeout: 100000,
        cancelToken,
        withCredentials: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${Local.get('chatToken')}`
        },
        onUploadProgress: (p) => {
            if (onProgress) { onProgress(p) }
            //fileprogress: p.loaded / p.total
            //})
        }
    }
    console.log(`[UPLOAD]`, options);
    let rs = await axios.request(options);
    console.log(`[RESPONSE]`, rs);
    return rs.data;
}

// request.upload = async (url, formData) => {
//     url = `${Config.chatHost}${url}`
//     let option = {
//         method: 'POST', // or 'PUT'
//         body: formData,
//         headers: {
//             'Authorization': `Bearer ${Local.get('chatToken') || Config.defaultToken}`
//         }
//     };
//     if (Config.debug) console.log(`[POST]`, url, option);
//     let res = await fetch(url, option);
//     let rs = await res.json();
//     if (res.status !== 200) {
//         console.log(res);
//         throw rs;
//     }
//     if (Config.debug) console.log(`[RESPONSE]`, url, rs);
//     return rs;
// }
let reader = new window.FileReader();
request.getImage = async (file) => {
    let url = `${Config.chatHost}/api/v4/files/${file.id}`;
    let method = 'GET';
    let option = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Local.get('chatToken') || Config.defaultToken}`
        }
    };
    console.log(`[${method}]`, url);


    try {
        let res = await new Promise((resolve, reject) => {
            fetch(url, option)
                .then((response) => {
                    response.arrayBuffer().then((buffer) => {
                        var base64Flag = 'data:image/jpeg;base64,';
                        var imageStr = arrayBufferToBase64(buffer);
                        resolve(base64Flag + imageStr)
                    });
                });
        })
        return res;
    } catch (err) {
        throw err;
    }
}
request.call = async (url, data, headers, method = 'POST') => {
    url = `${Config.chatHost}${url}`;
    let option = {
        method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Local.get('chatToken') || Config.defaultToken}`
        }
    };
    option.headers = Object.assign({}, option.headers, headers);
    if (method === 'GET') delete option.body;

    if (Config.debug) console.log(`[${method}]`, url, option, data);

    let res = await fetch(url, option);
    try {
        let rs = await res.json();
        if (Config.debug) console.log(`[RESPONSE]`, url, rs);
        if (rs.status_code === 401) window.location.href = '/login';
        switch (res.status) {
            case 401:
                // Helper.alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại');
                // window.location.href = '/login';
                break;
            case 200:
            case 201:
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

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
};