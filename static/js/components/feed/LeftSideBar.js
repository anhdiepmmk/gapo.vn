import React from 'react';
import { Link } from 'react-router-dom';
import services from '../../services';
export default class Footer extends React.Component {
    onLogoutClick() {
        services.local.clear();
        window.location.href = '/login';
    }
    render() {
        return <aside className="gapo-aside gapo-aside--left d-flex align-content-between flex-wrap">
            <div className="w-100 py-4">
                <h3 className="gapo-title px-3 mb-3">Trang chủ</h3>
                <ul className="gapo-side-menu list-unstyled">
                    <li>
                        <a className="side-menu__item active d-flex align-items-center">
                            <i className="svg-icon icon-feed-colorful" />
                            Bảng tin
                        </a>
                    </li>
                    {/* <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-calendar-colorful" />
                            Sự kiện
                        </a>
                    </li>
                    <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-bookmark-colorful" />
                            Đã lưu
                        </a>
                    </li>
                    <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-history-colorful" />
                            Kỷ niệm
                        </a>
                    </li>
                    <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-search-colorful" />
                            Tìm bạn bè
                        </a>
                    </li>
                    <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-help-colorful" />
                            Hỗ trợ
                        </a>
                    </li>
                    <li>
                        <a className="side-menu__item d-flex align-items-center">
                            <i className="svg-icon icon-config-colorful" />
                            Cài đặt
                        </a>
                    </li> */}
                </ul>
            </div>
            <div className="w-100 px-3 py-4 text-secondary">
                {/* <div className="d-flex align-items-center border-top border-bottom py-2 mb-2">
                    <div className>Ngôn ngữ:</div>
                    <div className="dropup ml-auto">
                        <a className="dropdown-toggle text-secondary" href id="js-dropdown-i18n" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Tiếng Việt
                        </a>
                        <div className="dropdown-menu" aria-labelledby="js-dropdown-i18n">
                            <a className="dropdown-item" href="#">Tiếng Việt</a>
                            <a className="dropdown-item" href="#">English</a>
                        </div>
                    </div>
                </div> */}
                <div className="list-unstyled py-1 mb-2">
                    <Link to='/dieukhoansudung' className="text-secondary">Điều khoản sử dụng</Link>
                </div>
                <div className="py-1">Gapo © 2019</div>
            </div>
        </aside>
    }
}