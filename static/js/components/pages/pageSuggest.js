import React from 'react';
import SearchHeader from '../SearchHeader'
import SideBarPage from './SidebarPage'
import services from '../../services';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from '../Loading'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import config from '../../services/config';
import _ from 'lodash';
const itemPerPage = 10;
class DropFlow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false

        }
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    render() {
        return (
            <div style={{ height: 30 }}>
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} style={{ position: 'unset' }}>
                    <DropdownToggle className="btn btn-block btn-sm btn-light">
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Đã theo dõi
                    </DropdownToggle>
                    <DropdownMenu right >
                        <DropdownItem onClick={() => { this.props.unLikepage(this.props.id, this.props.index) }}>Bỏ theo dõi</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

        )
    }
}
export default class PageSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listPage: [],
            listCategories: [],
            hasMore: true
        }
    }
    componentDidMount() {
        this.getListSuggestCate()
    }
    async getListSuggestCate() {
        let rs = await services.data.getPageType();
        this.setState({ listCategories: rs })
    }
    loading = false
    async getPage() {
        if (this.loading) return
        this.loading = true
        let from_id = null;
        if (this.state.listPage.length > 0) {
            from_id = this.state.listPage[this.state.listPage.length - 1].id;
        }
        let query = {
            limit: itemPerPage,
            from_id
        }
        let rs = await services.data.listPage(query);
        let hasMore = true
        if (rs.length < itemPerPage) hasMore = false
        let listPage = [...this.state.listPage, ...rs]
        this.loading = false;
        this.setState({ listPage, hasMore });

    }
    async likePage(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        try {
            let rs = await services.data.likePage(id);
            let listPage = _.cloneDeep(this.state.listPage);
            listPage[index].is_like = 1;
            listPage[index].counts.user_count += 1;
            this.setState({ listPage });
        } catch (err) {
            services.helper.alert(err.message)
        }

    }
    async unLikepage(id, index) {

        try {
            let rs = await services.data.unLikePage(id)
            let listPage = _.cloneDeep(this.state.listPage);
            listPage[index].is_like = 0;
            listPage[index].counts.user_count -= 1;
            this.setState({ listPage });
        } catch (err) {
            services.helper.alert(err.message)
        }

    }
    render() {
        let { listPage, listCategories } = this.state;
        return (
            <React.Fragment>
                <SearchHeader />
                <main className="gapo-main row no-gutters">
                    <SideBarPage />
                    <div className="col">
                        <div className="row justify-content-center">
                            <div className="col col-900 py-4">
                                <div>
                                    <div >
                                        <h3 className="gapo-title mb-3">Trang gợi ý</h3>
                                        <InfiniteScroll
                                            threshold={50}
                                            pageStart={0}
                                            loadMore={() => {
                                                this.getPage()
                                            }}
                                            hasMore={this.state.hasMore}
                                            loader={<Loading full key={0} />}
                                        >
                                            <div className="row">
                                                {listPage.map((item, index) => {
                                                    return (
                                                        <div className="col-3">
                                                            <div className="page-suggestion-item rounded">

                                                                <Link to={`/pagepreview/${item.id}`} className="gapo-thumbnail gapo-thumbnail--16x9" style={{ backgroundImage: `url(${item.cover && item.cover != 'undefined' ? item.cover : config.getDefaultCover()})` }} />

                                                                <div className="page-suggestion-item__content">
                                                                    <div className="media mb-3">
                                                                        <Link to={`/pagepreview/${item.id}`} className="gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: `url(${item.avatar && item.avatar != 'undefined' ? item.avatar : config.defaultPageAvatar})` }} />
                                                                        <div className="media-body">
                                                                            <Link to={`/pagepreview/${item.id}`}>
                                                                                <a className="d-block font-weight-semi-bold mb-1 short-text">{item.title}</a>
                                                                            </Link>
                                                                            <div className="suggestion-item__subtitle text-secondary">{item.counts.user_count} thành viên</div>
                                                                        </div>
                                                                    </div>
                                                                    {!item.is_like ? <a onClick={() => this.likePage(item.id, index)} href className="btn btn-block btn-sm btn-primary-light">
                                                                        Theo dõi
                                                                </a> : <DropFlow unLikepage={this.unLikepage.bind(this)} id={item.id} index={index} />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>

                                                    )
                                                })}
                                            </div>
                                        </InfiniteScroll>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </React.Fragment>

        )
    }
}