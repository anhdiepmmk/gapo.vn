import React from 'react';
import SearchHeader from '../SearchHeader';
import configStore from '../../configStore';
import VideoSideBar from './VideoSideBar';
import Feed from '../feed/Feed'
export default class VideoContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            page_id: null
        }
    }
    loading = false;
    componentDidMount() {
        configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'has-bottom-nav fixed-top-nav' });
    }
    onPageSelect(id) {
        this.setState({ page_id: id })
        window.scrollTo(0, 0)
    }
    render() {
        let { page_id } = this.state
        return <React.Fragment>
            <SearchHeader />
            <main className="gapo-main row">
                <VideoSideBar
                    onPageSelect={this.onPageSelect.bind(this)}
                />
                <div className="col">
                    <div className="row justify-content-center">
                        <div className="col col-900 py-4">
                            <Feed videoOnly={true}/>
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    }
}