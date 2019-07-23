import React from 'react';
import services from '../../services';
import _ from 'lodash';
import Post from '../post/Post';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroller';
const ITEM_PER_PAGE = 10;
export default class Feed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feeds: [],
            hasMore: true,
            activeVideo: null
        }
    }
    visibles = [];
    activeVideo = null;
    loading = false;
    addVisible(id) {
        if (!_.includes(this.visibles, id)) this.visibles.push(id);
        if (!this.state.activeVideo) {
            this.setState({ activeVideo: id })
        }
    }
    removeVisible(id) {
        let tmp = [];
        this.visibles.map(i => {
            if (i !== id) {
                tmp.push(i);
            }
        });
        this.visibles = tmp;
        if (this.state.activeVideo === id) {
            this.setState({ activeVideo: this.visibles[0] })
        }
    }
    resetActiveVideo() {
        this.setState({ activeVideo: null });
    }
    componentDidMount() {
        this.loadMore(this.props);
    }
    componentWillReceiveProps(next) {
        console.log('feed receive', next);
        this.reloadData(next);
    }
    reloadData(props) {
        this.setState({ feeds: [], hasMore: true }, () => {
            this.loadMore(props);
        });

    }
    async loadMore(props) {
        if (this.loading) return;
        this.loading = true;
        let from_id = null;
        if (this.state.feeds.length > 0) {
            from_id = this.state.feeds[this.state.feeds.length - 1].id;
        }
        let query = {
            from_id,
            expand: 'comments',
            limit: ITEM_PER_PAGE,
            target: props.target
        }
        if (props.user_id) {
            query.user_id = props.user_id
        }
        if (props.videoOnly) {
            query.post_type = 3
        }
        let items = await services.data.getPost(query);
        let feeds = _.clone(this.state.feeds);
        // feeds = _.concat(feeds, items);
        feeds = feeds.concat(items);
        let hasMore = true;
        if (items.length < ITEM_PER_PAGE) hasMore = false;
        this.loading = false;
        this.setState({ feeds, hasMore });

    }
    onPostDeleted(index) {
        let feeds = _.clone(this.state.feeds);
        feeds.splice(index, 1);
        this.setState({ feeds });
    }
    onPostCreated(post) {
        let feeds = _.clone(this.state.feeds);
        feeds.unshift(post);
        this.setState({ feeds });
    }
    renderContent() {
        if (!this.state.hasMore && this.state.feeds.length === 0) return this.props.emptyView || <p className='text-center'>Chưa có bài đăng</p>
        return this.state.feeds.map((feedInfo, index) => <Post
            addVisible={this.addVisible.bind(this)}
            removeVisible={this.removeVisible.bind(this)}
            activeVideo={this.state.activeVideo}
            resetActiveVideo={this.resetActiveVideo.bind(this)}
            onNewPost={this.onPostCreated.bind(this)}
            display='collapse'
            myPage={this.props.myPage}
            key={index}
            feed={feedInfo}
            onChange={feed => {
                let feeds = _.clone(this.state.feeds);
                feeds[index] = feed;
                this.setState({ feeds });
            }}
            onDelete={() => {
                this.onPostDeleted(index);
            }}
        />)
    }
    render() {
        return <InfiniteScroll
            threshold={1000}
            pageStart={0}
            loadMore={() => {
                this.loadMore(this.props)
            }}
            hasMore={this.state.hasMore}
            loader={<Loading full key={0} type='post' />}
        >
            {this.renderContent()}
        </InfiniteScroll>
    }
}