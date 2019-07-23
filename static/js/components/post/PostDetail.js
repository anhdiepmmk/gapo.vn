import React from 'react';
import services from '../../services';
import Post from './Post';
import Loading from '../Loading';
import { withRouter } from 'react-router-dom'
class PostDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feed: null,
            loading: true
        }
    }
    componentWillReceiveProps(next) {
        if (next.id !== this.props.id) this.loadData(next.id);
    }
    componentDidMount() {
        this.loadData(this.props.id);
    }
    async loadData(id) {
        try {
            let feed = await services.data.viewPost(id);
            this.setState({ feed });
        } catch (err) {
            console.log('post', err);
            if (err.status == 404) {
                this.props.history.replace('/404/notfound')
            }
            // let feed = await services.data.viewPost('pu24h1ce');
            // this.setState({ feed });
            if (this.props.onError) {
                this.props.onError();
            }
        }
    }
    render() {
        if (!this.state.feed) return <Loading full type='post' />;
        return <Post
            layout={this.props.layout || 'vertical'}
            size={this.props.size || 'medium'}
            display={this.props.display || 'expand'}
            key={0}
            itemIndex={this.props.itemIndex}
            feed={this.state.feed}
            onChange={feed => {
                this.setState({ feed });
            }} />
    }
}

export default withRouter(PostDetail)