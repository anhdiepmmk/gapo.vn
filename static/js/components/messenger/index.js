import React from 'react';
import configStore from '../../configStore';
import { Link } from 'react-router-dom';
import Loading from '../Loading';
import services from '../../services';
import SearchHeader from '../SearchHeader';
import Conversation from './Conversation';
import { connect } from 'react-redux';
import LeftSideBar from './LeftSideBar';
import _ from 'lodash';

import UserInfo from './UserInfo';
const PubSub = require('pubsub-js');
class MessengerContainer extends React.Component {
    constructor(props) {
        super(props);
        let query = props.match.params;
        this.state = {
            data: null,
            hasMore: true,
            loading: true,
            channel_id: query.channel_id,
            query,
        }
    }
    async loadChannels() {
        let data = await this.getListChannels();
        this.setState({ data, loading: false });
        if (!this.state.channel_id && data[0]) {
            this.onChannelClick(data[0].id, data[0]);
        } else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === this.state.channel_id) {
                    this.onChannelClick(data[i].id, data[i]);
                    break;
                }
            }
        }
    }
    async getListChannels() {
        let rs = await services.data.chat.getListChannels();
        let data = [];
        rs.map(item => {
            if (item.type === 'D') {
                //calculate avatar
                for (var i = 0; i < item.member.length; i++) {
                    if (!item.member[i]) continue;
                    if (item.member[i] && item.member[i].id !== this.props.user.id) {
                        item.avatar = item.member[i].avatar;
                    }
                }
                data.push(item);
            }
            return null;
        })
        return data;
    }
    componentWillReceiveProps(next) {
        let query = next.match.params;
        this.setState({ query, channel_id: query.channel_id })
    }
    token = null;
    componentDidMount() {
        configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'has-bottom-nav page-messenger' });
        this.loadChannels();
        this.subscribeChat();
    }
    componentWillUnmount() {
        this.unsubscribeChat();
    }
    subscribeChat() {
        this.token = PubSub.subscribe(`chat`, async (msg, input) => {
            console.log('manager chat', msg, input);
            let data = _.cloneDeep(this.state.data);
            if (input.event === 'posted') {
                let channel_id = input.broadcast.channel_id;
                let exits = false;
                let message = '';
                let post = JSON.parse(input.data.post);
                message = post.message;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === channel_id) {
                        exits = true;
                        data[i].isNewMessage = true;
                        data[i].last_message = {
                            update_at: new Date().getTime(),
                            message
                        }
                    }
                }
                if (!exits) {
                    data = await this.getListChannels();
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id === channel_id) {
                            data[i].isNewMessage = true;
                        }
                    }
                }

                this.setState({ data });
            }
        });
    }
    unsubscribeChat() {
        PubSub.unsubscribe(this.token);
    }
    async createChatChannel(id) {
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, id]);
        window.location.href = `#/conversation?channel_id=${rs.id}`
    }
    async onFriendClick(user) {
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, user.id_chat]);
    }
    renderChannelInfo() {
        // if (!this.state.channel) return null;
        let userToShow = this.state.userToShow;
        if (!userToShow) return null;
        return <React.Fragment>
            <div className="message-content__head border-bottom">
                <Link to={userToShow._profileUrl} className="message-content__user media">
                    <span className="gapo-avatar gapo-avatar--40 mr-2 mt-1" style={{ backgroundImage: `url(${userToShow.avatar})` }}>
                    </span>
                    <div className="message__status message__status--active" />
                    <div className="media-body pl-1 mt-1">
                        <div className="message-user__info d-flex align-items-center">
                            <span className="message-content__author">{userToShow.display_name} </span>
                        </div>
                        <div className="message-user__summary d-flex align-items-center mt-1">
                            <span className="message-content__summary">Online </span>
                        </div>
                    </div>
                </Link>
            </div >
            <div className="message-content__body d-flex align-content-between flex-wrap">
                <Conversation channel_id={this.state.channel_id} channel={this.state.channel} setLastMessage={this.setLastMessage.bind(this)} />
            </div>
        </React.Fragment >
    }
    onChannelClick(channel_id, channel) {
        let data = _.cloneDeep(this.state.data);
        if (!data) return;
        let userToShow = null;
        for (var i = 0; i < channel.member.length; i++) {
            let m = channel.member[i];
            if (m.id !== this.props.user.id) {
                userToShow = m;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === channel_id) {
                data[i].isNewMessage = false;
            }
        }
        this.setState({ channel_id, channel, userToShow, data });
    }
    setLastMessage(channel_id, message) {
        let data = _.cloneDeep(this.state.data);
        data.map(i => {
            console.log(i, channel_id)
            if (i.id === channel_id) {
                i.last_message = {
                    update_at: new Date().getTime(),
                    message: message.message
                }
            }
        });
        this.setState({ data });
    }
    render() {
        return <React.Fragment>
            <SearchHeader />
            <main className="gapo-main row">
                <div className="col">
                    <div className="row justify-content-center">
                        <div className="col pt-1">
                            <div className="message-wrapper d-flex">
                                <LeftSideBar channel_id={this.state.channel_id} data={this.state.data} loading={this.state.loading}
                                    onChannelClick={this.onChannelClick.bind(this)} />
                                <div className="message-content border-left border-right">
                                    {this.renderChannelInfo()}
                                </div>
                                <div className="message-aside message-asiee--right message-info">
                                    <UserInfo userToShow={this.state.userToShow} setLastMessage={this.setLastMessage.bind(this)} />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </React.Fragment >
    }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(MessengerContainer);