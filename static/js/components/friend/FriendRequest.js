import React from 'react';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from '../Loading';
import services from '../../services';
import { Link } from 'react-router-dom';
const ITEM_PER_PAGE = 10;
export default class FriendRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            hasMore: true
        }
    }
    onBackClick() {
        window.history.back();
    }
    loading = false;
    async loadMore() {
        if (this.loading) return;
        this.loading = true;
        let from_id = null;
        if (this.state.data && this.state.data.length > 0) {
            from_id = this.state.data[this.state.data.length - 1].id;
        }
        let items = await services.data.listReceiveUserRelation(from_id, ITEM_PER_PAGE);
        let data = _.clone(this.state.data) || [];
        // feeds = _.concat(feeds, items);
        data = data.concat(items);
        let hasMore = true;
        if (items.length < ITEM_PER_PAGE) hasMore = false;
        this.loading = false;
        this.setState({ data, hasMore });
    }
    async onAcceptClick(index) {
        let data = _.cloneDeep(this.state.data);
        let item = data[index];
        await services.data.acceptUserRelation(item.id);
        data.splice(index, 1);
        this.setState({ data });
    }
    async onDeclineClick(index) {
        let data = _.cloneDeep(this.state.data);
        let item = data[index];
        await services.data.declineUserRelation(item.id);
        data.splice(index, 1);
        this.setState({ data });
    }
    render() {
        let items = [];
        if (!this.loading) {
            if (this.state.data) {
                if (this.state.data.length > 0) {
                    items = this.state.data.map((item, index) => <div className="user__item rounded-lg media align-items-center mb-1" key={index}>
                        <Link to={item._profileUrl} href className="gapo-avatar gapo-avatar--64 mr-3">
                            <img src={item.avatar} alt='none' />
                        </Link>
                        <div className="media-body">
                            <a href className="d-block user__title font-weight-medium mb-1">{item.display_name}</a>
                            <small className="text-secondary">99 bạn chung - 22 Oct 2019</small>
                            <div className="row mt-1 pr-4">
                                <div className="col-6">
                                    <button className="btn btn-primary btn-block btn-sm" onClick={this.onAcceptClick.bind(this, index)}>Chấp nhận</button>
                                </div>
                                <div className="col-6">
                                    <button href className="btn btn-light btn-block btn-sm" onClick={this.onAcceptClick.bind(this, index)}>Xóa</button>
                                </div>
                            </div>
                        </div>
                    </div>)
                } else {
                    items = <p className='text-center'>Không có yêu cầu kết bạn</p>;
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