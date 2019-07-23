import React from 'react';
import SearchHeader from '../SearchHeader';
import QuickPost from '../post/QuickPost';
import configStore from '../../configStore';
import Feed from './Feed';
import LeftSideBar from './LeftSideBar';
import RightSideBar from './RightSideBar';
import SuggestFriend from './../SuggestFriend';
export default class FeedContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feeds: [],
            hasMore: true
        }
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
                        <div className="col col-500 py-4">
                            <QuickPost onNewPost={post => {
                                this.onNewPost(post);
                            }} />
                            <SuggestFriend nFriend={3} />
                            <div className='gapo-page'>
                                <Feed ref={'feedRef'} />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="col col-aside">
                    <div className="aside__wrapper">
                        <RightSideBar />
                    </div>
                </div>
            </main>
        </React.Fragment>
    }
}