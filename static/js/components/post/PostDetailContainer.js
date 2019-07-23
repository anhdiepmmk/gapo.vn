import React from 'react';
import SearchHeader from '../SearchHeader';
import configStore from '../../configStore';
import LeftSideBar from '../feed/LeftSideBar';
import RightSideBar from '../feed/RightSideBar';
import SuggestFriend from '../SuggestFriend';
import PostDetail from './PostDetail';
import queryString from 'query-string';
export default class SinglePostView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: props.match.params
        }
        console.log('query', props.match.params);
    }
    loading = false;
    componentDidMount() {
        configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'has-bottom-nav fixed-top-nav' });
    }
    onNewPost(post) {
        if (this.refs.feedRef) {
            this.refs.feedRef.onPostCreated(post);
        }
    }
    render() {
        return <React.Fragment>
            <SearchHeader />
            <main className="gapo-main row">
                <div className="col col-aside">
                    <div className="aside__wrapper">
                        <LeftSideBar />
                    </div>
                </div>
                <div className="col">
                    <div className="row justify-content-center">
                        <div className="col col-900 py-4">
                            <PostDetail id={this.state.query.id} layout='vertical' display='collapse' />
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    }
}