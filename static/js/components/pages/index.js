import React from 'react';
import SearchHeader from '../SearchHeader'
import Feed from '../feed/Feed';
import SideBarPage from './SidebarPage'
export default class PageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page_id: null
        }
    }
    onPageSelect(id) {
        this.setState({ page_id: id });
        window.scrollTo(0, 0);
    }
    render() {
        let { page_id } = this.state
        return (
            <React.Fragment>
                <SearchHeader />
                <main className="gapo-main row no-gutters">
                    <SideBarPage
                        onPageSelect={this.onPageSelect.bind(this)}
                    />
                    <div className="col">
                        <div className="row justify-content-center">
                            <div className="col col-900 py-4">
                                <Feed target='page' />

                            </div>
                        </div>
                    </div>
                </main>
            </React.Fragment>

        )
    }
}