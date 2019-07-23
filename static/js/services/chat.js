import PubSub from 'pubsub-js';
import local from './local'
import config from './config';
let chat = {}, seq = 1;
let _socket = new WebSocket(config.chatSocket)
_socket.onopen = evt => {
    const authenMsg = JSON.stringify({
        'seq': 1,
        'action': 'authentication_challenge',
        'data': {
            'token': local.get('chatToken')
        }
    })
    _socket.send(authenMsg)
}
_socket.onmessage = evt => {
    let dt = JSON.parse(evt.data);
    console.log('on message', dt);
    let topic = '';
    switch (dt.event) {
        case 'posted':
        case 'typing':
            // topic = `CHAT_${dt.broadcast.channel_id}`;
            PubSub.publish('chat', dt)
            break;
        default: break;
    }
}
_socket.onclose = evt => {
}
_socket.onerror = evt => {
    // handle this error
    // console.log('on Error message', evt.data)
}
chat.setTyping = channel_id => {
    seq++;
    let input = {
        "action": "user_typing",
        "seq": seq,
        "data": {
            "channel_id": channel_id
        }
    }
    console.log(input);
    _socket.send(JSON.stringify(input));
}

export default chat;