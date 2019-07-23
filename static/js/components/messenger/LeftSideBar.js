import React from 'react';
import Footer from '../Footer';
import configStore from '../../configStore';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import services from '../../services';
import Loading from '../Loading';
import PerfectScrollbar from 'react-perfect-scrollbar'
class LeftSideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            hasMore: true,
            loading: true,
            search: ''
        }
    }

    renderItems() {
        if (!this.props.data) return <Loading type='friend' />;
        return this.props.data.map((item, index) => {
            if (this.state.search) {
                let search = services.helper.removeAlias(this.state.search).toLowerCase();
                let contain = false;
                for (var i = 0; i < item.member.length; i++) {
                    let name = services.helper.removeAlias(item.member[i].display_name).toLowerCase();
                    if (name.indexOf(search) >= 0) contain = true;;
                }
                if (!contain) return;
            }

            let name = item.member[0].display_name;
            if (item.member[0].id === this.props.user.id) name = item.member[1].display_name;
            let msg = item.msg;
            if (item.last_message) {
                msg = item.last_message.message;
            }

            return (
                <div className={`message__user--item media ${item.isNewMessage ? 'active' : ''} ${this.props.channel_id === item.id ? 'message__user--focus' : ''}`} key={index} onClick={() => {
                    this.props.onChannelClick(item.id, item);
                }}>
                    <span className={`gapo-avatar gapo-avatar--48 mr-2 `} style={{ backgroundImage: `url(${item.avatar})` }}>
                    </span>
                    <div className="media-body pl-1 pt-1">
                        <div className="message-user__info d-flex align-items-center">
                            <span className="message__author">{name} </span>
                        </div>
                        <div className="message-user__summary d-flex align-items-center mt-1">
                            <span className="message__summary">{msg}</span>
                        </div>
                    </div>
                    <div className="user__unactive ml-auto mt-1">
                        <span className="user__unactive--time">{item.last_message ? services.helper.getDuration(item.last_message.update_at / 1000) : ''}</span>
                    </div>
                </div >
            )
        })
    }
    render() {
        return <div className="message-aside message-aside--left">
            <form className="message__search-box border-bottom">
                <div className="search-box__icon d-flex align-items-center align-items-center ">
                    <i className="gapo-icon icon-search-alt" />
                </div>
                <input onChange={evt => {
                    this.setState({ search: evt.target.value })
                }} id="js-search-input" type="text" className="search-box__input form-control border-0 shadow-none" placeholder="Tìm kiếm" />
            </form>
            <div className="message__user--list">
                <PerfectScrollbar>
                    {this.renderItems()}
                </PerfectScrollbar>

            </div>


        </div>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(LeftSideBar);