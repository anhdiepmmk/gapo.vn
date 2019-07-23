import React from 'react';
import SearchHeader from '../SearchHeader'
import SideBarPage from './SidebarPage'
// import services from '../../services';
// import { Link } from 'react-router-dom';
// import InfiniteScroll from 'react-infinite-scroller';
// import Loading from '../Loading'
// import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
export default class PageSuggest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listPage: [],
            hasMore: true
        }
    }
    componentDidMount() {

    }
    render() {
        return (
            <React.Fragment>
                <SearchHeader />
                <main className="gapo-main row no-gutters">
                    <SideBarPage />
                    <div className="col">
                        <div className="row justify-content-center">
                            <div className="col col-900 py-4">
                                <div className="category__cover mb-4">
                                    <div className="gapo-thumbnail gapo-thumbnail--16x9 rounded" style={{ backgroundImage: 'url(https://giveitanudge.com/wp-content/uploads/2019/03/Entertainment.jpg)' }}>
                                        <div className="text-white gapo-title">
                                            <a href="#" className="text-white  d-flex align-items-center">
                                                <i className="gapo-icon icon-prev mr-3 " />
                                                Giải trí
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className>
                                    <div className="row">
                                        <div className="col-3">
                                            <div className="page-suggestion-item rounded">
                                                <a href="#" className="gapo-thumbnail gapo-thumbnail--16x9" style={{ backgroundImage: 'url(https://genknews.genkcdn.vn/k:thumb_w/640/2016/img20160517120529882/iron-man-bat-ngo-dang-anh-hon-captain-america-tren-fanpage.jpg)' }} />
                                                <div className="page-suggestion-item__content">
                                                    <div className="media mb-2">
                                                        <a href="#" className="gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: 'url(https://kenh14cdn.com/2018/5/18/290882137325318102755197476772419990978560n-15266545132221570661072.jpg)' }} />
                                                        <div className="media-body">
                                                            <a href="#" className="d-block font-weight-semi-bold mb-1">9gag</a>
                                                            <div className="suggestion-item__subtitle text-secondary">105k thành viên</div>
                                                        </div>
                                                    </div>
                                                    <div className="media mb-2 pt-1 suggestion-item__followed-box">
                                                        <div className="media mr-2">
                                                            <div className="position-relative rounded-circle bg-white followed__item--1">
                                                                <a href="#" className="gapo-avatar gapo-avatar--24" style={{ backgroundImage: 'url(https://ss-images.catscdn.vn/2018/06/10/2968571/34689401_2147325555551794_7654281988110548992_n.jpg)' }} />
                                                            </div>
                                                            <div className="position-relative rounded-circle bg-white followed__item--2">
                                                                <a href="#" className="gapo-avatar gapo-avatar--24" style={{ backgroundImage: 'url(http://media2.sieuhai.tv:8088/onbox/images/user_lead_image/20180628/0934120310_20180628212321.jpg)' }} />
                                                            </div>
                                                            <div className="position-relative rounded-circle bg-white followed__item--3">
                                                                <a href="#" className="gapo-avatar gapo-avatar--24" style={{ backgroundImage: 'url(https://kenh14cdn.com/2018/5/18/290882137325318102755197476772419990978560n-15266545132221570661072.jpg)' }} />
                                                            </div>
                                                        </div>
                                                        <div className="suggestion-item__subtitle text-secondary">3 người bạn đã theo dõi</div>
                                                    </div>
                                                    <a href className="btn btn-block btn-sm btn-primary-light">
                                                        Theo dõi
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="page-suggestion-item rounded">
                                                <a href="#" className="gapo-thumbnail gapo-thumbnail--16x9" style={{ backgroundImage: 'url(https://genknews.genkcdn.vn/k:thumb_w/640/2016/img20160517120529882/iron-man-bat-ngo-dang-anh-hon-captain-america-tren-fanpage.jpg)' }} />
                                                <div className="page-suggestion-item__content">
                                                    <div className="media mb-2">
                                                        <a href="#" className="gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: 'url(https://kenh14cdn.com/2018/5/18/290882137325318102755197476772419990978560n-15266545132221570661072.jpg)' }} />
                                                        <div className="media-body">
                                                            <a href="#" className="d-block font-weight-semi-bold mb-1">9gag</a>
                                                            <div className="suggestion-item__subtitle text-secondary">105k thành viên</div>
                                                        </div>
                                                    </div>
                                                    <div className="media mb-2 pt-1 suggestion-item__followed-box">
                                                        <div className="media mr-2">
                                                            <div className="position-relative rounded-circle bg-white followed__item--1">
                                                                <a href="#" className="gapo-avatar gapo-avatar--24" style={{ backgroundImage: 'url(https://ss-images.catscdn.vn/2018/06/10/2968571/34689401_2147325555551794_7654281988110548992_n.jpg)' }} />
                                                            </div>
                                                            <div className="position-relative rounded-circle bg-white followed__item--2">
                                                                <a href="#" className="gapo-avatar gapo-avatar--24" style={{ backgroundImage: 'url(http://media2.sieuhai.tv:8088/onbox/images/user_lead_image/20180628/0934120310_20180628212321.jpg)' }} />
                                                            </div>
                                                            <div className="position-relative rounded-circle bg-white followed__item--3">
                                                                <a href="#" className="text-white gapo-avatar more-watched d-flex align-items-center justify-content-center">
                                                                    <i className="gapo-icon icon-more-option icon-2x" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="suggestion-item__subtitle text-secondary">3 người bạn đã theo dõi</div>
                                                    </div>
                                                    <a href className="btn btn-block btn-sm btn-light">
                                                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                                                        Đã theo dõi
                                                     </a>
                                                </div>
                                            </div>
                                        </div>
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