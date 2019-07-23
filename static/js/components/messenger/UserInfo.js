import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
class UserInfo extends React.Component {
    componentDidMount() {

    }
    async loadData() {

    }
    render() {
        if (!this.props.userToShow) return null;
        return <div>
            <div className="message-info__head d-block pt-3 border-bottom">
                <div className="message__head--avatar d-flex align-items-center justify-content-center">
                    <span className="gapo-avatar gapo-avatar--80" style={{ backgroundImage: `url(${this.props.userToShow.avatar})` }}>
                    </span>
                </div>
                <div className="message__head--name font-weight-semi-bold d-block mt-3 ">{this.props.userToShow.display_name}</div>
                <div className="message__head--link d-block mt-1 pb-2">
                    <Link to={this.props.userToShow._profileUrl}>Xem profile</Link>
                </div>
            </div>
            <div className="message-info__files border-bottom">
                <div className="w-100 py-3">
                    <div className="d-flex align-items-center">
                        <div className="gapo-subtitle px-3">Chia sẻ dữ liệu</div>
                    </div>
                    <ul className="list__files list-unstyled mt-2">
                        {/* <li className="file-item flex align-items-center p-2"><i className="gapo-icon icon-file-pdf mr-2 ml-2" />fileSetup.pdf </li>
                        <li className="file-item flex align-items-center p-2 "><i className="gapo-icon icon-file-zip mr-2 ml-2" />fileSetup.zip </li>
                        <li className="file-item flex align-items-center p-2"><i className="gapo-icon icon-file-zip mr-2 ml-2" />fileSetup.zip </li>
                        <li className="file-item flex align-items-center p-2 "><i className="gapo-icon icon-file-zip mr-2 ml-2" />fileSetup.zip </li> */}
                    </ul>
                </div>
            </div>
            <div className="message-info__image">
                <div className="w-100 p-3">
                    <div className="d-flex align-items-center">
                        <div className="gapo-subtitle ">Chia sẻ ảnh</div>
                    </div>
                    <div className="w-100 p-1">
                        <div className="row mt-1">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(UserInfo);