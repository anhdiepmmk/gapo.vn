import React from 'react';
import { Link } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar'
import services from '../../services';
export default class VideoSideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pages: [],
			hasMore: true,
			logged: true
		}
	}
	componentDidMount() {
		this.loadMore();
		this.checkLogin()
	}
	checkLogin() {
		let login = services.helper.checkLogged();
		if (!login) this.setState({ logged: false })
	}
	async loadMore() {
		let res = await services.data.listPage({ limit: 8, create_by: 34 })
		this.setState({ pages: res })
	}
	render() {
		let { onPageSelect } = this.props;
		let { logged } = this.state;
		return (
			<div className="col col-360">
				<div className="aside__wrapper">
					<PerfectScrollbar>
						<aside className="gapo-aside gapo-aside--left d-flex align-content-between flex-wrap">
							<div className="w-100 py-4">
								<h3 className="gapo-title px-3">Video</h3>
								<ul className="gapo-side-menu list-unstyled">
									<li>
										<Link to='/video' className="side-menu__item active d-flex align-items-center">
											<i className="svg-icon icon-explore" />
											Khám phá
										</Link>
									</li>
									{/* <li>
										<Link to='/' className="side-menu__item d-flex align-items-center">
											<i className="svg-icon icon-checklist" />
											Gợi ý
										</Link>
									</li>
									{logged && <li>
										<Link to='/' className="side-menu__item d-flex align-items-center">
											<i className="svg-icon icon-video-gallery" />
											Xem gần đây
										</Link>
									</li>} */}
								</ul>
								{logged && <React.Fragment>
									<h3 className="gapo-title mt-4 px-3 py-2">Danh sách xem của bạn</h3>
									<ul className="gapo-side-menu list-unstyled">
										{this.state.pages.map((item, index) => <li key={index}>
											<Link to={`/pagepreview/${item.id}`} className="side-menu__item media align-items-center">
												<div className="gapo-avatar gapo-avatar--48 mr-2" style={{ backgroundImage: `url(${item.avatar})` }}>
													<img src alt />
												</div>
												<div className="media-body pl-1 font-weight-semi-bold">
													<div className="font-weight-semi-bold mb-1">{item.title}</div>
													<div className="text-secondary font-size-small">{item.counts.user_count.toLocaleString()} thích</div>
												</div>
											</Link>
										</li>)}
									</ul>
								</React.Fragment>
								}
							</div>
						</aside>
					</PerfectScrollbar>
				</div>
			</div>
		)
	}
}