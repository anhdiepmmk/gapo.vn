import React from 'react';
import configStore from '../../configStore';
import { Link } from 'react-router-dom';
import services from '../../services';
import { connect } from 'react-redux';
import Feed from '../feed/Feed';
import SearchHeader from '../SearchHeader';
import SuggestFriend from '../SuggestFriend';
import TimeLineSideBar from './TimeLineSideBar';
import QuickPost from '../post/QuickPost';
import HeadProfile from './HeadProFile'
import ProfileEdit from './ProfileEdit'
import PhotoAlbum from './PhotoAlbum'
import MyFriends from '../friend/MyFriends'
class Profile extends React.Component {
    constructor(props) {
        super(props);
        let paramsState = this.checkInputParams(props)
        this.state = {
            loading: true,
            data: null,
            photos: [],
            albums: [],
            friends: [],
            otherUser: [],
            ...paramsState,
            tabIndex: 1
        }
    }
    componentWillReceiveProps(next) {
        if (this.props.user_id != next.user_id) {
            let paramsState = this.checkInputParams(next);
            this.setState({ ...paramsState, loading: true },
                () => {
                    this.loadData()
                });
        }
    }

    changeTabIndex(index) {
        let check = services.helper.checkLogged()
        if (index === 3 && !check) {
            return services.helper.loginRequired().then(rs => {
                if (rs === 'login') {
                    window.location.href = '/login'
                }
            })
        }
        this.setState({
            tabIndex: index
        })
    }

    checkInputParams(props) {
        let user_id = this.props.user.id;
        let isMe = true;
        let tabIndex = this.state && this.state.tabIndex ? this.state.tabIndex : 1;
        if (props.user_id && props.user_id != this.props.user.id) {
            isMe = false;
            user_id = props.user_id;
            tabIndex = 1
        }
        return { user_id, isMe, tabIndex }
    }
    componentDidMount() {
        this.loadData();
    }
    onBackClick(evt) {
        evt.preventDefault();
        window.history.back();
    }
    async loadData() {
        try {
            let rs = await this.loadInfo();
            let all = await Promise.all([this.loadPhotos(rs.id),
            this.loadFrends(rs.id)]);
            this.setState({ data: rs, photos: all[0], friends: all[1], loading: false })
        } catch (error) {
            this.props.history.replace('/404/notfound')
        }
    }
    async loadInfo() {
        let rs = await services.data.viewUser(this.state.user_id);
        // this.setState({ loading: false, data: rs });
        if (this.props.onDataUpdated) {
            this.props.onDataUpdated(rs);
        }
        return rs;
    }
    async loadPhotos(user_id) {
        let images = await services.data.getPost({
            limit: 9,
            post_type: 2,
            user_id: user_id
        });
        return images;

    }
    async loadFrends(user_id) {
        let res
        try {
            if (this.state.isMe) {
                res = await services.data.listFriendUserRelation(null, null, null, null)
            } else {
                res = await services.data.listFriendUserRelation(null, null, null, user_id);
            }
        } catch (err) {
            res = []
        }

        // this.setState({ friends: res });
        return res;
    }
    async requestUserRelation(id) {
        let rs = await services.data.requestUserRelation(id);
        services.helper.alert('Gửi lời kết bạn thành công');
    }


    async createChatChannel() {
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, this.state.data.id_chat]);
        window.location.href = `#/conversation?channel_id=${rs.id}`;
    }

    renderHead() {
        return <HeadProfile refreshData={this.refreshData.bind(this)} changeTabIndex={this.changeTabIndex.bind(this)} id_chat={this.state.data.id_chat} user_id={this.state.data.id} isMe={this.state.isMe} data={this.state.data} tab={this.state.tabIndex} />
    }


    refreshData(data) {
        console.log('refresh', data);
        this.setState({ data: { ...this.state.data, ...data } })
        if (this.props.onDataUpdated) {
            this.props.onDataUpdated({ ...this.state.data, ...data });
        }
        if (this.state.isMe) {
            configStore().dispatch({ type: 'SET_USER_INFO', data: { ...this.props.user, ...data } });
        }
    }

    onNewPost(post) {
        if (this.refs.feedRef) {
            this.refs.feedRef.onPostCreated(post);
        }
    }
    setTabIndex(tabIndex) { this.setState({ tabIndex }) }
    renderContent() {
        switch (this.state.tabIndex) {
            case 1: return (
                <React.Fragment>
                    <SuggestFriend />
                    <div className="row">
                        <div className="col col-360">
                            <TimeLineSideBar
                                photos={this.state.photos}
                                user={this.state.data}
                                listFrends={this.state.friends}
                                setTabIndex={this.setTabIndex.bind(this)}
                            />
                        </div>
                        <div className="col col-500">
                            {this.state.isMe && <QuickPost onNewPost={post => {
                                this.onNewPost(post);
                            }} />}
                            <Feed
                                ref={'feedRef'}
                                emptyView={this.renderEmptyView()}
                                user_id={this.state.data.id} />
                        </div>
                    </div>
                </React.Fragment>)
            case 2: return (
                <ProfileEdit refreshData={this.refreshData.bind(this)} user_id={this.state.data.id} isMe={this.state.isMe} data={this.state.data} />
            )
            case 3: return (
                <MyFriends user_id={this.state.data.id} isMe={this.state.isMe} setTabIndex={this.setTabIndex.bind(this)} />
            )
            case 4:
                let options = {
                    placeholder: 'Chọn những bức ảnh và hãy nói gì về nó',
                    titleButton: 'Đăng ảnh',
                    type: 'Ảnh',
                }
                return <PhotoAlbum
                    isMe={this.state.isMe}
                    refreshData={this.refreshData.bind(this)}
                    user_id={this.state.data.id}
                    changeTabIndex={this.changeTabIndex.bind(this)}
                    options={options}
                />
        }
    }

    renderEmptyView() {
        return <div>
            <div className="p-5">
                <div className="text-center profile--empty p-4">
                    <svg
                        width={38}
                        height={46}
                        viewBox="0 0 38 46"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M26.1716 2.17157C25.4214 1.42143 24.404 1 23.3431 1H5C2.79086 1 1 2.79086 1 5V41C1 43.2091 2.79086 45 5 45H33C35.2091 45 37 43.2091 37 41V14.6569C37 13.596 36.5786 12.5786 35.8284 11.8284L26.1716 2.17157Z"
                            fill="white"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 35H29"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 25H29"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 15H17"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M24 1.5V10C24 12.2091 25.7909 14 28 14H36.5"
                            fill="#E5E5E5"
                        />
                        <path
                            d="M24 1.5V10C24 12.2091 25.7909 14 28 14H36.5"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="my-3 font-weight-semi-bold">
                        {this.state.isMe ? 'Bạn chưa có bài viết nào' : `${this.state.data ? this.state.data.display_name : ''} chưa có bài viết nào`}
                    </div>
                </div>
            </div>
        </div>
    }
    render() {
        let { data } = this.state
        if (this.state.loading) return null;
        return <React.Fragment>
            {this.renderHead()}
            {this.renderContent()}
        </React.Fragment>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(Profile);