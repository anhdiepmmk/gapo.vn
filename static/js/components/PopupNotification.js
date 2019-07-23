import React from 'react';
import PubSub from 'pubsub-js';
import _ from 'lodash';
import services from '../services';
const TIMEOUT = 5, MAX_NOTI = 7;
export default class PopupNotification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: []
        }
    }

    removeTimeoutNotification() {
        let notifications = [];
        let now = new Date().getTime() / 1000;
        for (var i = 0; i < this.state.notifications.length; i++) {
            let noti = this.state.notifications[i];
            if (now - noti.createdAt < TIMEOUT) {
                notifications.push(noti);
            }
        }
        this.setState({ notifications });
    }
    componentDidMount() {
        setInterval(() => {
            this.removeTimeoutNotification();
        }, 1000);
        PubSub.subscribe(`notification`, (msg, payload) => {
            let notifications = _.cloneDeep(this.state.notifications);
            if (notifications.length >= MAX_NOTI) {
                notifications.splice(0, 1);
            }
            payload.createdAt = new Date().getTime() / 1000;
            notifications.push(payload);
            this.setState({ notifications });
        });
    }
    handleNotificationClick(index) {
        let item = this.state.notifications[index];
        if (item.status !== 'seen_and_read') {
            let notifications = _.cloneDeep(this.state.notifications);
            notifications[index].status = 'seen_and_read';
            this.setState({ notifications });
        }
        this.setState({ activeId: item.id });
        services.data.markNotificationAsRead(item.id);
        switch (item.type) {
            case 'accept_friend_request':
                let userId = item.url.replace('gapo://user/', '');
                window.location.href = `/${userId}`
                break;
            case 'request_friend':
                window.location.href = `/listFriend`
                break;
            case 'react_on_post':
            case 'comment_on_own_post':
            case 'react_on_comment':
            case 'reply_on_subscripted_comment_owned_post':
            case 'reply_on_own_comment':
            case 'comment_on_subscripted_post':
            case 'reply_on_subscripted_comment':
            default:
                window.location.href = `/post/${item.notification.data.targetId}`
                // services.helper.showPost(item.notification.data.targetId)
                // this.setState({ postId: item.subscription.targetId });
                break;
        }
    }
    renderIcon(item) {
        let name = 'gapo-icon icon-2x icon-';
        switch (item.type) {
            case 'accept_friend_request': return name += 'friends'
            case 'react_on_post': return name += 'like'
            case 'comment_on_own_post':
            case 'react_on_comment':
            case 'reply_on_subscripted_comment_owned_post':
            case 'reply_on_own_comment':
            case 'comment_on_subscripted_post':
            case 'reply_on_subscripted_comment':
            default: return name += 'comment-alt'
        }
    }
    render() {
        return <div className="gapo-noti__wrap">
            {this.state.notifications.map((item, index) => <div className="gapo-box gapo-noti__item" key={index}>
                <a onClick={() => { this.handleNotificationClick(index) }} className="media align-items-center">
                    <div className="gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: `url(${item.notification.data.image})` }}>
                        <img src alt />
                    </div>
                    <div className="media-body pl-1">
                        <div className="mb-1">{item.notification.data.body}
                        </div>
                        <div className="media align-items-center">
                            <div className="gapo-noti__icon bg-primary text-white">
                                <i className={this.renderIcon(item)} />
                            </div>
                            <div className="text-secondary font-size-small">{services.helper.getDuration(item.createdAt)}</div>
                        </div>
                    </div>
                </a>
            </div>)}
        </div>
    }
}