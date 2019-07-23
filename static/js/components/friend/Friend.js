import React from 'react';
import _ from 'lodash';
import services from '../../services';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from '../Loading';
import { connect } from 'react-redux';
const ITEM_PER_PAGE = 10;
class Friend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            hasMore: true,
            loading: false
        }
    }
    loading = false;
    async loadMore() {
        if (this.loading) return;
        this.loading = true;
        let from_id = null;
        if (this.state.data && this.state.data.length > 0) {
            from_id = this.state.data[this.state.data.length - 1].id;
        }
        let items = await services.data.listFriendUserRelation(from_id, ITEM_PER_PAGE);
        let data = _.clone(this.state.data) || [];
        // feeds = _.concat(feeds, items);
        data = data.concat(items);
        let hasMore = true;
        if (items.length < ITEM_PER_PAGE) hasMore = false;
        this.loading = false;
        this.setState({ data, hasMore });

    }
    async createChatChannel(id) {
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, id]);
        window.location.href = `#/conversation?channel_id=${rs.id}`
    }
    onBackClick() {
        window.history.back();
    }
    render() {
        let items = [];
        if (!this.loading) {
            if (this.state.data) {
                if (this.state.data.length > 0) {
                    items = this.state.data.map((item, index) => <div className="user__item rounded-lg media align-items-center mb-1" key={index}>
                        <a href className="gapo-avatar gapo-avatar--64 mr-3" style={{ backgroundImage: `url(${item.avatar})` }}>
                            {/* <img src={item.avatar} alt='avatar' /> */}
                        </a>
                        <div className="media-body">
                            <a href className="d-block user__title font-weight-medium mb-1">{item.display_name}</a>
                            <div className="text-secondary">{item.count_mutual_friend || 0} bạn chung</div>
                        </div>
                        <a href className="profile__action" onClick={() => {
                            this.createChatChannel(item.id_chat);
                        }}>
                            <span className="profile__action-icon d-flex align-items-center justify-content-center rounded-circle text-secondary mx-auto">
                                <i className="gapo-icon icon-chat" />
                            </span>
                            <small className="profile__action-text d-block text-primary font-weight-medium mt-1">Nhắn tin</small>
                        </a>
                    </div>)
                } else {
                    items = <p className='text-center'>Không có bạn bè</p>;
                }
            }
        }
        return <div className="user__list p-2">
            <InfiniteScroll
                threshold={150}
                pageStart={0}
                loadMore={this.loadMore.bind(this)}
                hasMore={this.state.hasMore}
                loader={<Loading full key={0} />}
            >
                {items}
            </InfiniteScroll>

        </div>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(Friend);