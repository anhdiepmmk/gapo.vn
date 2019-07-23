import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';


export default class LoginRequiRed extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }
    render() {
        return <div>
            <div className="modal-dialog modal-dialog-centered"  >
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title gapo-subtitle">Yêu cầu đăng nhập</div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={() => this.props.onClick()} >
                            <i class="gapo-icon icon-close"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        Vui lòng đang nhập để sử dụng tính năng này
    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-light" data-dismiss="modal" onClick={() => this.props.onClick('cancel')} >Hủy</button>
                        <button type="button" class="btn btn-sm btn-primary" onClick={() => this.props.onClick('login')}>Đăng nhập</button>
                    </div>
                </div>
            </div>
        </div>
    }
}