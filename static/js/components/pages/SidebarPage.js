import React from 'react';
import { Link } from 'react-router-dom';
import services from '../../services';
import PerfectScrollbar from 'react-perfect-scrollbar'
import InfiniteScroll from 'react-infinite-scroller';

import { connect } from 'react-redux'
import config from '../../services/config';
import { withRouter } from 'react-router-dom';
const itemPerPage = 10;
class SideBarPage extends React.Component {
    constructor(props) {
        super(props);
        let hash = window.location.hash;
        this.state = {
            myPages: [],
            pageLike: [],
            hash: hash,
            logged: true,
            hasMore: true
        }
    }
    componentDidMount() {
        this.checkLogin();
    }
    checkLogin() {
        let login = services.helper.checkLogged();
        if (!login) return this.setState({ logged: false });
        this.loadMyPage();
        // this.loadPageLike();
    }
    async loadMyPage() {
        let rs = await services.data.listPage({ limit: null, own: this.props.user.id });
        this.setState({ myPages: rs });
    }
    // async loadPageLike() {
    //     let rs = await services.data.listPage({ limit: null, liked: 1 });
    //     this.setState({ pageLike: rs });
    // }

    checkActive() {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        this.props.history.push('/createpage')
    }
    loading = false
    async loadMorePageLiked() {
        if (this.loading) return;
        this.loading = true
        let from_id = null;
        if (this.state.pageLike.length > 0) {
            from_id = this.state.pageLike[this.state.pageLike.length - 1].id;
        }
        let query = {
            limit: itemPerPage,
            from_id,
            liked: 1
        }
        let rs = await services.data.listPage(query);
        let hasMore = true
        if (rs.length < itemPerPage) hasMore = false
        let pageLike = [...this.state.pageLike, ...rs]
        this.setState({ pageLike, hasMore });
        this.loading = false
    }
    render() {
        let { onPageSelect } = this.props;
        let { logged } = this.state;
        return (
            <div className="col col-360">
                <div className="aside__wrapper bg-white">
                    <PerfectScrollbar>
                        <InfiniteScroll
                            threshold={200}
                            pageStart={0}
                            loadMore={() => {
                                this.loadMorePageLiked()
                            }}
                            hasMore={this.state.hasMore}
                            loader={<p>Đang tải dữ liệu...</p>}
                            useWindow={false}
                        >
                            <aside className="gapo-aside--left d-flex align-content-between flex-wrap">
                                <div className="w-100 py-4">
                                    <h3 className="gapo-title px-3">Trang</h3>
                                    <ul className="gapo-side-menu list-unstyled">
                                        <li>
                                            <Link to="/page" className={`side-menu__item ${this.state.hash === '#/page' ? 'active' : ''} d-flex align-items-center`}>
                                                <i className="svg-icon icon-explore" />
                                                Khám phá
                                    </Link>
                                        </li>
                                        <li>
                                            <Link to="/pagesuggest" className={`side-menu__item ${this.state.hash === '#/pagesuggest' ? 'active' : ''} d-flex align-items-center`}>
                                                <i className="svg-icon icon-checklist" />
                                                Gợi ý
                                    </Link>
                                        </li>
                                        {/* {logged && <li>
                                            <div onClick={() => this.checkActive()} className="side-menu__item d-flex align-items-center text-primary">
                                                <i className="btn btn-sm rounded-circle btn-primary-light gapo-icon icon-plus mr-1" />
                                                Tạo trang
                                        </div>
                                        </li>} */}
                                    </ul>
                                    {logged && <React.Fragment>
                                        <h3 className="gapo-title mt-4 px-3 py-2">Trang của bạn</h3>
                                        {this.state.myPages.length ?
                                            <ul className="gapo-side-menu list-unstyled">
                                                {this.state.myPages.map((item, index) => <li key={index}>
                                                    <Link to={`/pagepreview/${item.id}`} className="side-menu__item media align-items-center">
                                                        <div className="gapo-avatar gapo-avatar--48 mr-2" style={{ backgroundImage: `url(${item.avatar && item.avatar != 'undefined' ? item.avatar : config.defaultPageAvatar})` }}>
                                                            <img src alt />
                                                        </div>
                                                        <div className="media-body pl-1">
                                                            <div className="font-weight-semi-bold mb-1">{item.title}
                                                                {item.status_verify == 1 ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 20, height: 20, marginLeft: 5, marginBottom: 3 }} /> : null}

                                                            </div>
                                                            <div className="text-secondary font-size-small">{item.counts.user_count.toLocaleString()} thích</div>
                                                        </div>
                                                    </Link>
                                                </li>)}
                                            </ul> : null}
                                        {this.state.pageLike.length ?
                                            <>
                                                <h3 className="gapo-title mt-4 px-3 py-2">Trang bạn đã thích</h3>
                                                <ul className="gapo-side-menu list-unstyled">
                                                    {this.state.pageLike.map((item, index) => <li key={index}>
                                                        <Link to={`/pagepreview/${item.id}`} className="side-menu__item media align-items-center">
                                                            <div className="gapo-avatar gapo-avatar--48 mr-2" style={{ backgroundImage: `url(${item.avatar && item.avatar != 'undefined' ? item.avatar : config.defaultPageAvatar})` }}>
                                                                <img src alt />
                                                            </div>
                                                            <div className="media-body pl-1">
                                                                <div className="font-weight-semi-bold mb-1">{item.title}
                                                                    {item.status_verify == 1 ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 20, height: 20, marginLeft: 5, marginBottom: 3 }} /> : null}

                                                                </div>
                                                                <div className="text-secondary font-size-small">{item.counts.user_count.toLocaleString()} thích</div>
                                                            </div>
                                                        </Link>
                                                    </li>)}
                                                </ul>
                                            </> : null}
                                    </React.Fragment>}
                                </div>
                            </aside>
                        </InfiniteScroll>
                    </PerfectScrollbar>
                </div>
            </div>)
    }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(withRouter(SideBarPage));