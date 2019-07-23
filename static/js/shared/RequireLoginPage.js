import React from 'react';
import { Link } from 'react-router-dom';
export default class RequireLoginPage extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <div className="py-5 text-center">
            <img src="/assets/images/login.svg" alt className="img-fluid" />
            <div className="text-secondary font-size-large font-weight-semi-bold mt-4">
                Vui lòng đăng nhập để sử dụng tính năng này
        </div>
            <Link to='/login' className="btn btn-md btn-primary mt-4">Đăng nhập</Link>
        </div>
    }
}