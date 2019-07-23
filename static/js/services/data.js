import request from './request';
import chatRequest from './chatRequest';
import qs from 'query-string';
import Local from './local';
import config from './config';
import pipe from './pipe';
const data_source = 1;
let dt = {};
//*******NOTIFICATION*** */
dt.getPreviewData = async url => {
    let rs = await request.callLinkPreviewJson(`/links?url=${url}`, null, 'GET');
    return rs.data;
}
dt.registerNotification = data => {
    return request.callTypeJson(`/register`, data);
}
dt.unregisterNotification = async (data) => {
    return request.callTypeJson(`/unregister`, data);
}
dt.markNotificationAsRead = id => {
    return request.callNoti(`/notifications/${id}/mark-as-read`);
}
dt.getNotificationStats = () => {
    return request.callNoti(`/notification-stats/me`, null, null, 'GET');
}
dt.resetNotification = () => {
    return request.callNoti(`/notification-stats/reset`, 'ONLY_POST');
}
dt.getAllNotifications = (offset, limit) => {
    return request.callNoti(`/notifications?${qs.stringify({ offset, limit })}`, null, null, 'GET');
}
dt.readOneNotification = (id) => {
    return request.callNoti(`/notifications/${id}/mark-as-read`);
}
//******REGISTER*** */
dt.changePassword = (password, old_password) => {
    return request.call(`/auth/change-password`, { password, old_password });
}
dt.activeAccountUser = (phone, otp) => {
    return request.call(`/user/active-account`, { phone, otp });
}
dt.activeOTPVerify = (phone, otp, password) => {
    return request.call(`/auth/phone-active-code-verify`, { phone, otp, password })
}
dt.setForgetPassword = (phone, otp, password) => {
    return request.call(`/auth/forget-password`, { phone, otp, password });
}
dt.verifyForgetPassword = (phone, otp) => {
    return request.call(`/auth/verify-forget-password`, { phone, otp });
}
dt.requestForgetPassword = phone => {
    return request.call(`/auth/request-forget-password`, { phone });
}
dt.phoneRegister = phone => {
    return request.call(`/auth/phone-register`, { phone });
}
dt.phoneActiveOTP = phone => {
    return request.call(`/auth/phone-active`, { phone });
}
dt.phoneUpdate = phone => {
    return request.call(`/user/phone-update`, { phone });
}
dt.phoneUpdateVerify = (phone, otp) => {
    return request.call(`/user/phone-verify`, { phone, otp });
}
dt.phoneVerify = (phone, otp, password) => {
    return request.call(`/auth/phone-verify`, { phone, otp, password });
}
/*****POST*** */
dt.getPost = async (input) => {
    //from_id, expand, limit, post_type: 1status, 2photo,3video,4album,5link,6article, user_id;
    let rs = await request.call(`/post?${qs.stringify(input)}`, null, null, 'GET');
    //fix rs
    rs.map(i => {
        if (i.page) {
            i.page = pipe.page(i.page);
        }
        if (!i.mediaData) i.mediaData = [];
        i.user = pipe.user(i.user);
        if (i.comments) {
            i.comments.map(c => {
                c.user = pipe.user(c.user);
                if (c.reply) {
                    c.reply.map(r => {
                        r.user = pipe.user(r.user);
                    })
                }
            })
        }
    })
    return rs;
}
dt.listUserLikePosts = async ({ post_id, from_id, limit }) => {
    let query = { post_id, limit };
    if (from_id) query.from_id = from_id;
    let dt = await request.call(`/post/user-like`, query);
    dt.map(i => pipe.user(i));
    return dt;
}
dt.viewPost = async id => {
    let dt = await request.call(`/post/view?${qs.stringify({ id, expand: 'comments' })}`, null, null, 'GET');
    if (!dt.mediaData) dt.mediaData = [];
    dt.user = pipe.user(dt.user);
    if (dt.comments) {
        dt.comments.map(c => {
            c.user = pipe.user(c.user);
            if (c.reply) {
                c.reply.map(r => {
                    r.user = pipe.user(r.user);
                })
            }
        })
    }
    return dt;
}
dt.createPost = (input) => {
    // let input = { content, data_source, privacy };
    input.data_source = data_source;
    if (input.media.length === 0) delete input.media;
    if (!input.target) delete input.target;
    return request.call(`/post/create`, input);
}
dt.reactPost = post_id => {
    return request.call(`/react/post`, { post_id });
}
dt.deletePost = id => {
    return request.call('/post/delete', { id });
}
dt.updatePost = postInfo => {
    return request.call(`/post/update`, postInfo);
}
//*******SEARCH */
dt.searchUser = async query => {
    let dt = await request.call(`/search/user`, { query, limit: 5 });
    dt.map(i => pipe.user(i));
    return dt;
}
dt.searchPost = query => {
    return request.call(`/search/post`, { query, limit: 5 });
}
/*****COMMENT */
dt.deleteComment = id => {
    return request.call(`/react/delete`, { id });
}
dt.updateComment = opts => {
    console.log("opt", opts);
    return request.call(`/comment/update`, opts);
}
dt.reactComment = comment_id => {
    return request.call(`/react/comment`, { comment_id });
}
dt.getComment = async (input) => {
    input.status = 1;
    let dt = await request.call(`/comment?${qs.stringify(input)}`, null, null, 'GET');
    dt.map(c => {
        c.user = pipe.user(c.user);
        if (c.reply) {
            c.reply.map(r => {
                r.user = pipe.user(r.user);
            })
        }
    })
    return dt;
}
dt.getUser = (from_id, limit = 10, phone, display_name, username, ids) => {
    let input = { from_id, limit };
    if (phone) input.phone = phone;
    if (display_name) input.display_name = display_name;
    if (username) input.username = username;
    if (ids) input.ids = ids;
    return request.call(`/user?${qs.stringify(input)}`, null, null, `GET`);
}
dt.createComment = (post_id, content, media) => {
    let input = { post_id, content, data_source };
    if (media.length > 0) input.media = media;
    return request.call(`/comment/create`, input);
}
dt.replyComment = (parent_id, content, media) => {
    let input = { parent_id, content, data_source };
    if (media.length > 0) input.media = media;
    return request.call(`/comment/reply`, input);
}
dt.deleteComment = (id) => {
    return request.call(`/comment/delete`, { id });
}
//******USER */
dt.updateUser = opts => {
    return request.call(`/user/update`, opts);
}
dt.emailRegister = opts => {
    //phone/email, password
    return request.call(`auth/email-register`, opts);
}
dt.authPassword = opts => {
    return request.call(`/auth/password-login`, opts);
}
dt.authEmail = opts => {
    return request.call(`/auth/email-login`, opts);
}
//****USER RELATION */
dt.blockUserRelation = target_user_id => {
    return request.call(`/user-relation/block`, { target_user_id });
}
dt.reportPost = id => {
    return request.call(`/post/report`, { id });
}
dt.requestUserRelation = receive_user_id => {
    return request.call(`/user-relation/request`, { receive_user_id });
}
dt.acceptUserRelation = request_user_id => {
    return request.call(`/user-relation/accept`, { request_user_id });
}
dt.declineUserRelation = request_user_id => {
    return request.call(`/user-relation/decline`, { request_user_id });
}
dt.viewUser = async id => {
    let dt = await request.call(`/user/view?id=${id}`, null, null, 'GET');
    return pipe.user(dt);
}
dt.viewUserById = id => {
    return request.call(`/user/view?${qs.stringify({ id })}`, null, null, 'GET');
}
/*******FRIEND */
dt.cancelUserRelation = target_user_id => {
    return request.call(`/user-relation/cancel`, { target_user_id });
}
dt.countRequestFriend = (id) => {
    return request.call(`/user-relation/count-request-friend?${qs.stringify({ id })}`, null, null, 'GET')
}
dt.listFriendUserRelation = async (from_id, limit, display_name, user_id, page) => {
    let dt = await request.call(`/user-relation/list-friend?${qs.stringify({ from_id, limit, display_name, user_id, page })}`, null, null, 'GET');
    dt.map(i => pipe.user(i));
    return dt;
}
dt.listMutualFriends = (user_id, limit = 5) => {
    return request.call(`/user-relation/get-list-mutual-friends?${qs.stringify({ user_id, limit })}`, null, null, 'GET')
}
dt.countMutualFriends = (user_id) => {
    return request.call(`/user-relation/count-mutual-friends?${qs.stringify({ user_id })}`, null, null, 'GET')
}
dt.listRequestUserRelation = async (from_id, limit) => {
    let dt = await request.call(`/user-relation/list-request?${qs.stringify({ from_id, limit })}`, null, null, 'GET')
    dt.map(i => pipe.user(i));
    return dt;
}
dt.listReceiveUserRelation = async (from_id, limit) => {
    let dt = await request.call(`/user-relation/list-receive?${qs.stringify({ from_id, limit })}`, null, null, 'GET')
    dt.map(i => pipe.user(i));
    return dt;
}
dt.loginSocial = (type, token) => {
    return request.call(`/auth/social-login`, { type, token });
}

dt.listFriendSuggest = async (from_id, limit) => {
    let dt = await request.call(`/suggest/user`, null, null, 'GET');
    dt.map(i => pipe.user(i));
    return dt;
}
///*********** PAGES  */
dt.listPage = async (input) => {
    let dt = await request.call(`/page?${qs.stringify(input)}`, null, null, 'GET');
    dt.map(item => {
        if (!item.avatar || item.avatar === 'undefined') item.avatar = config.defaultPageAvatar;
        if (!item.cover || item.cover === 'undefined') item.cover = config.getDefaultCover();
    });
    return dt;
}
dt.likePage = (page_id) => {
    return request.call(`/user-page/like`, { page_id });
}
dt.unLikePage = (page_id) => {
    return request.call('/user-page/unlike', { page_id })
}
dt.viewPage = async (id) => {
    let dt = await request.call(`/page?${qs.stringify({ id })}`, null, null, 'GET');
    dt = pipe.page(dt);
    return dt;
}
dt.createPage = (title, description, type, avatar, cover, info) => {
    let input = { title, description, type };
    if (avatar) input.avatar = avatar;
    if (cover) input.cover = cover;
    if (info) input.info = info;
    return request.call('/page/create', input)
}
dt.deletePage = (id) => {
    return request.call('/page/delete', { id })
}
dt.updatePage = (data) => {
    //id, title, description, status = 1, avatar, cover, info
    return request.call('/page/update', data)
}
dt.getPageByid = async (id) => {
    let dt = await request.call(`/page/view?id=${id}`, null, null, 'GET')
    return pipe.page(dt);
}
dt.getPageType = () => {
    return request.call(`/pagetype`, null, null, 'GET')
}
dt.getListUserLike = async (page_id, from_id, limit) => {
    let dt = await request.call(`/page/user-like`, { page_id, from_id, limit });
    return dt;
}

///***********CHAT API********** */
dt.chat = {};
dt.chat.getListChannels = async () => {
    let dt = await request.call(`/user-chat/get-list-chanel`, { token: Local.get('chatToken') });
    // dt.data.map(item => {
    //     item.display_name = item.member[1] ? item.member[1].display_name : 'Nhắn tin';

    //     item.msg = item.last_message.message;
    //     // if (typeof (item.last_message) === 'object') {
    //     //     for (let i = 0; i < item.member.length; i++) {
    //     //         if (item.member[i].chat_id === item.last_message.user_id) {
    //     //             item.msg = `${item.member[i].display_name}: ${item.last_message.message}`
    //     //         }
    //     //     }
    //     // }
    // });
    let rs = []
    for (var i = 0, leng = dt.data.length; i < leng; i++) {
        let item = dt.data[i];
        if (item.member) {
            item.member.map(i => pipe.user(i))
        }
        if (item.total_msg_count) {
            item.display_name = item.member[1] ? item.member[1].display_name : 'Nhắn tin';
            item.msg = item.last_message.message;

        }
        rs.push(item);
    }
    return rs;
}
dt.chat.uploadImage = async (form) => {
    return chatRequest.upload(`/api/v4/files`, form)
}
dt.chat.getChannelInfo = async id => {
    let list = await dt.chat.getListChannels();
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
    }
}
dt.chat.listChannels = () => {
    return chatRequest.call(`/api/v4/users/me/teams/4ty3pg8ujidfimwwz1xn3srb5o/channels`, null, null, 'GET')
}
dt.chat.getPostsInChannel = async (channel_id, page, per_page) => {
    let dt = await chatRequest.call(`/api/v4/channels/${channel_id}/posts?${qs.stringify({ page, per_page })}`, null, null, 'GET');
    // for (var i in dt.posts) {
    //     let item = dt.posts[i];

    //     if (item.metadata && item.metadata.files) {
    //         for (var j = 0; j < item.metadata.files.length; j++) {
    //             let base64 = await chatRequest.getImage(item.metadata.files[j]);
    //             item.metadata.files[j].base64 = base64;
    //         }
    //     }
    // }
    return dt;
}
dt.chat.sendPostToChannel = (input) => {
    return chatRequest.call(`/api/v4/posts`, input);
}
dt.chat.createDirectChannel = ids => {
    return chatRequest.call(`/api/v4/channels/direct`, ids);
}
dt.chat.getImageBase64 = file => {
    return chatRequest.getImage(file);
}
export default dt;