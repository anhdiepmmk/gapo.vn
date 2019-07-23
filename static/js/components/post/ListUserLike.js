import React from 'react';
import { connect } from 'react-redux';
import services from '../../services';
import _ from 'lodash'
import { Link } from 'react-router-dom';
import amplitude from 'amplitude-js';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from '../Loading';
import Relation from './../friend/Relation';
import PerfectScrollbar from 'react-perfect-scrollbar';
const ITEM_PER_PAGE = 15;

class ListUserLike extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            hasMore: true
        }
    }
    componentDidMount() {
    }
    loading = false;
    async loadMore() {
        let from_id = null;
        if (this.state.data.length > 0) {
            from_id = this.state.data[this.state.data.length - 1].id;
        }
        let query = {
            from_id,
            post_id: this.props.post_id,
            limit: ITEM_PER_PAGE
        }
        let items = await services.data.listUserLikePosts(query);
        let data = _.clone(this.state.data);
        // feeds = _.concat(feeds, items);
        data = data.concat(items);
        let hasMore = true;
        if (items.length < ITEM_PER_PAGE) hasMore = false;

        console.log('infi', this.loading, data, hasMore)
        this.loading = false;
        this.setState({ data, hasMore });

    }
    async removeSuggest(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let data = _.cloneDeep(this.state.data);
        data.splice(index, 1);
        this.setState({ data });
        let rs = await services.data.cancelUserRelation(id);
    }
    onClose() {

    }
    async cancelFriend(id, index, type) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        if (type === 'receive') {
            let listReceiveUserRelation = _.cloneDeep(this.state.listReceiveUserRelation);
            listReceiveUserRelation.splice(index, 1);
            this.setState({ listReceiveUserRelation });
        }
        if (type === 'suggest') {
            let data = _.cloneDeep(this.state.data);
            data[index].relation = '';
            this.setState({ data });
        }
        let rs = await services.data.cancelUserRelation(id);
    }
    async requestUserRelation(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let data = _.cloneDeep(this.state.data);
        data[index].relation = 'pending'
        this.setState({ data });
        let rs = await services.data.requestUserRelation(id);
    }
    async createChatChannel(item) {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, item.id_chat]);
        window.location.href = `/messenger/${rs.id}`
    }
    async cancelUserRelation(id, index) {
        try {
            await services.data.cancelUserRelation(id);
            let data = _.cloneDeep(this.state.data);
            data[index].relation = '';
            this.setState({ data });
        } catch (e) {
            services.helper.alert(e.message)
        }
    }
    renderContent() {
        return <ul className="list-unstyled">
            {this.state.data.map((item, index) => {
                let relation = <button onClick={() => this.requestUserRelation(item.id, index)} className="btn btn-primary-light btn-sm mr-1">Kết bạn</button>;
                if (item.relation === 'friend') {
                    relation = <a className="btn btn-sm btn-primary-light mr-2" onClick={() => {
                        this.createChatChannel(item);
                    }}>
                        <i className="gapo-icon icon-add-friend mr-1" />
                        Nhắn tin
</a>
                }
                if (item.relation === 'pending') {
                    relation = <button onClick={() => this.cancelUserRelation(item.id, index)} className="btn btn-block btn-sm btn-light btn-width-90">
                        <i className="gapo-icon icon-check mr-1" />
                        Đã gửi lời mời
    </button>
                }
                if (item.id === this.props.user.id) relation = null;
                return <li key={index}>
                    <div className="side-menu__item alpha media align-items-center">
                        <Link onClick={() => {
                            window.location.href = item._profileUrl;
                        }} to={item._profileUrl} className="gapo-avatar gapo-avatar--48 mr-2 cursor" style={{ backgroundImage: `url(${item.avatar})` }}>
                            <img />
                        </Link>
                        <div className="row no-gutters media-body align-items-center">
                            <div className="col-6 cursor">
                                <a className="d-block font-weight-semi-bold mb-1 text-overflow-ellipsis pr-1">{item.display_name}</a>
                                <div className="text-secondary font-size-small">{item.mutual_friend_count} bạn chung</div>
                            </div>
                            <div className="col-6 text-right">
                                {relation}

                            </div>
                        </div>
                    </div>
                </li>
            }
            )}
        </ul>

    }
    render() {
        return <PerfectScrollbar>
            <InfiniteScroll
                useWindow={false}
                threshold={50}
                pageStart={0}
                loadMore={() => {
                    this.loadMore()
                }}
                hasMore={this.state.hasMore}
                loader={<Loading full key={0} type='friend' />}
            >
                {this.renderContent()}
            </InfiniteScroll>
        </PerfectScrollbar>

    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(ListUserLike);