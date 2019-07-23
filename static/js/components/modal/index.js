import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux'
import Create from '../Create';
import PostDetail from './../post/PostDetail';
import PickImage from './PickImage'
import LoginRequiRed from './LoginRequired'
import ActiveRequired from './ActiveRequired'
import { Link } from 'react-router-dom';
import Post from './../post/Post';
import _ from 'lodash';
import ListUserLike from './../post/ListUserLike';
ReactModal.setAppElement('#root');
ReactModal.defaultStyles.overlay.backgroundColor = 'rgba(0, 0, 0, 0.6)';
class ModalControl extends Component {
    onClose(modal) {
        this.props.dispatch({ type: 'HIDE_MODAL', data: modal });
        setTimeout(() => {
            this.props.dispatch({ type: 'POP_MODAL', data: modal });
        }, 300);
    }
    onUpdate(modal) {
        this.props.dispatch({ type: 'UPDATE_MODAL', data: modal });
    }
    render() {
        if (!this.props.modals) return null;
        return <React.Fragment>
            {this.props.modals.map((item, index) => {
                let content = null;
                switch (item.type) {
                    case 'auth':
                        content = <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title gapo-subtitle">Yêu cầu đăng nhập</div>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <i className="gapo-icon icon-close" />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Vui lòng đang nhập để sử dụng tính năng này
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-sm btn-light" data-dismiss="modal">Hủy</button>
                                    <Link to='/login' type="button" className="btn btn-sm btn-primary">Đăng nhập</Link>
                                </div>
                            </div>
                        </div>
                        break;
                    case 'active':
                        content = (
                            <ActiveRequired id={item.user_id} onClick={(data) => {
                                if (data) { item.callBack(data) }
                                this.onClose(item);
                            }}
                            />
                        )
                        break
                    case 'message':
                        content = <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title gapo-subtitle">GAPO</div>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onClose.bind(this, item)}>
                                        <i className="gapo-icon icon-close" />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {item.content}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-sm btn-primary" data-dismiss="modal" onClick={() => {
                                        this.onClose(item);
                                        if (item.cb) {
                                            item.cb();
                                        }
                                    }}>Đóng</button>
                                </div>
                            </div>
                        </div>
                        break;
                    case 'userLike':
                        content = <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title gapo-subtitle">GAPO</div>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onClose.bind(this, item)}>
                                        <i className="gapo-icon icon-close" />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className='user-like-container'>
                                        <ListUserLike post_id={item.post_id} onClose={this.onClose.bind(this)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        break;
                    case 'confirm':
                        content = <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title gapo-subtitle">GAPO</div>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onClose.bind(this, item)}>
                                        <i className="gapo-icon icon-close" />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {item.content}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-sm btn-light" data-dismiss="modal" onClick={() => {
                                        this.onClose(item);
                                        if (item.cb) {
                                            item.cb(0);
                                        }
                                    }}>Không</button>
                                    <button type="button" className="btn btn-sm btn-primary" data-dismiss="modal" style={{ minWidth: '80px' }} onClick={() => {
                                        this.onClose(item);
                                        if (item.cb) {
                                            item.cb(1);
                                        }
                                    }}>Có</button>
                                </div>
                            </div>
                        </div>
                        break;
                    case 'create':
                        content = <Create data={item} onClose={() => {
                            this.onClose(item);
                        }} />
                        break;
                    case 'success':
                        content = (
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content" style={{ alignItems: 'center' }}>
                                    <svg style={{ marginTop: '1rem' }} width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44Z" fill="#6FBE44" />
                                        <path d="M10 22L18 30L34 14" stroke="white" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div className="modal-body">
                                        {item.content}
                                    </div>
                                </div>
                            </div>
                        )
                        break
                    case 'post':
                        content = <div className='post-modal'>
                            <PostDetail id={item.post_id} itemIndex={item.index} layout='horizontal' display='slide' onError={() => {
                                this.onClose(item);
                            }} />
                        </div>
                        break;
                    case 'postWithContent':
                        content = <div className='post-modal'>
                            <Post
                                layout={'horizontal'}
                                size={'medium'}
                                display={'slide'}
                                key={0}
                                itemIndex={item.index}
                                feed={item.content}
                                onChange={feed => {
                                    // this.setState({ feed });
                                    let tmp = _.cloneDeep(item);
                                    tmp.content = feed;
                                    this.onUpdate(tmp)
                                }} />
                        </div>
                        break;
                    case 'sharepost':
                        content = <div className='col col-500 py-4 m-auto'>
                            <div className="modal-header">
                                <div className="modal-title gapo-subtitle">Chia sẻ lên dòng thời gian của bạn</div>
                                <button onClick={() => { this.onClose(item) }} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <i className="gapo-icon icon-close" />
                                </button>
                            </div>
                            <Create isSharePost={true} preview_post={item.post_data} mode='share' onClose={rs => {
                                if (item.cb) item.cb(rs)
                                this.onClose(item)
                            }} />
                        </div>;
                        break;
                    case 'editpost':
                        content = <div className='col col-500 py-4 m-auto'>
                            <Create
                                mode='edit'
                                post={item.post}
                                onClose={rs => {
                                    if (item.cb) item.cb(rs);

                                    this.onClose(item);
                                }} />
                        </div>
                        break;
                    case 'pickImage':
                        content = <PickImage page_id={item.page_id} id={item.user_id} onClick={(data) => {
                            if (data) { item.callBack(data) }
                            this.onClose(item);
                        }} />
                        break;
                    case 'loginRequired':
                        content = <LoginRequiRed id={item.user_id} onClick={(data) => {
                            if (data) { item.callBack(data) }
                            this.onClose(item);
                        }} />
                        break;
                    default:
                        break;

                }
                return <ReactModal
                    closeTimeoutMS={200}
                    key={index}
                    isOpen={item.show}
                    className="Modal"
                    onRequestClose={() => {
                        if (item.cb) item.cb();
                        this.onClose(item);
                    }}
                    overlayClassName="Overlay"
                >
                    <a onClick={() => {
                        console.log('on close');
                        if (item.cb) item.cb();
                        this.onClose(item);
                    }} className='modal-close-btn'>
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 5L5 19" stroke="white" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 19L5 5" stroke="white" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </a>
                    {content}
                </ReactModal>
            })
            }
        </React.Fragment>
    }
}
const mapStateToProps = (state) => {
    return { modals: state.modals }
}
export default connect(mapStateToProps)(ModalControl);