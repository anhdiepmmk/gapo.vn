import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import services from '../../services';
import AuthOtp from './authOtp';
import configStore from '../../configStore';
import amplitude from 'amplitude-js';
export default class ForgotPassword extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            otp: '',
            password: '',
            confirm: '',
            stage: 'default'
        }
    }
    async onContinueClick(evt) {
        evt.preventDefault();
        try {
            if (!this.state.phone) return services.helper.alert('Vui lòng nhập số điện thoại');
            let rs = await services.data.requestForgetPassword(this.state.phone);
            this.setState({ stage: 'otp' });
        } catch (err) {
            services.helper.alert(err.message);
        }
    }
    setUserInfo(loginResponse) {
        services.local.set('token', loginResponse.token);
        services.local.set('chatToken', loginResponse.chatToken);
        services.local.set('userInfo', JSON.stringify(loginResponse.user));
        configStore().dispatch({ type: 'SET_USER_INFO', data: Object.assign({}, loginResponse.user, { _auth: true }) });
    }
    async onResendClick() {
        try {
            if (!this.state.phone) return services.helper.alert('Vui lòng nhập số điện thoại');
            let rs = await services.data.requestForgetPassword(this.state.phone);
            services.helper.alert('Gửi thành công');
            this.setState({ stage: 'otp' });
        } catch (err) {
            this.setState({ stage: 'otp' });
            services.helper.alert(err.message);
        }
    }
    async verifyForgetPassword(evt) {
        evt.preventDefault();
        try {
            if (!this.state.otp) return services.helper.alert('Vui lòng nhập đầy đủ thông tin');
            let rs = await services.data.verifyForgetPassword(this.state.phone, this.state.otp);
            this.setUserInfo(rs);
            this.setState({ stage: 'password' })
        } catch (err) {
            await services.helper.alert(err.message);
        }
    }
    async onSetPasswordClick(evt) {
        evt.preventDefault();
        try {
            if (!services.helper.checkPasswordStrength(this.state.password))
                return services.helper.alert('Mật khẩu cần có tối thiểu 8 kí tự bao gồm cả chữ và số');
            if (!this.state.otp || !this.state.password || !this.state.confirm)
                return services.helper.alert('Vui lòng nhập đầy đủ thông tin');
            if (this.state.password !== this.state.confirm)
                return services.helper.alert('Mật khẩu xác nhận không trùng khớp');
            let rs = await services.data.setForgetPassword(this.state.phone, this.state.otp, this.state.password);
            await services.helper.alert('Đổi mật khẩu thành công.');
            window.location.href = '/';
            amplitude.getInstance().logEvent('Forgot Confirm')
        } catch (err) {
            await services.helper.alert(err.message);
        }
    }
    render() {
        let content = null;
        switch (this.state.stage) {
            case 'otp':
                content = this.renderOtp();
                break;
            case 'password':
                content = this.renderSetNewPassword();
                break;
            default:
                content = this.renderDefault();
                break;
        }
        return <div className='page-auth'>
            <header className="gapo-header">
                <div className="d-flex align-items-center container">
                    <a href className="header__brand mx-auto">
                        <img src="/assets/images/logo.svg" height={30} alt="GAPO" className="header__logo" />
                    </a>
                </div>
            </header>
            <main className="gapo-main">
                <div className="container">
                    <div className="auth__box rounded mx-auto">
                        {content}
                    </div>
                </div>
            </main>
            <footer className="auth-footer font-size-large">
                <div className="container">
                    <ul className="auth-footer__links d-flex list-unstyled font-weight-medium mb-2">
                        <li className="auth-footer__link mr-4">
                            <a href="/">Giới thiệu</a>
                        </li>
                        <li className="auth-footer__link mr-4">
                            <a href="/">Chính sách &amp; Điều khoản</a>
                        </li>
                        <li className="auth-footer__link mr-4">
                            <a href="/">Tuyển dụng</a>
                        </li>
                        <li className="auth-footer__link mr-4">
                            <a href="/">Trợ giúp</a>
                        </li>
                        <li className="auth-footer__link mr-4">
                            <a href="/">Trợ giúp đăng nhập</a>
                        </li>
                        <li className="auth-footer__link mr-4">
                            <a href="/">Bảo mật tài khoản</a>
                        </li>
                    </ul>
                    <div className="footer__copyright text-dark">
                        Gapo © 2019
        </div>
                </div>
            </footer>
        </div>
    }
    renderSetNewPassword() {
        return <div>
            <h3 className="gapo-title mb-3">Lấy lại mật khẩu</h3>
            <div className="font-size-large mb-4">Tạo mật khẩu đăng nhập mới</div>
            <form onSubmit={this.onSetPasswordClick.bind(this)} className>
                <div className="form-group">
                    <input
                        value={this.state.password}
                        onChange={evt => {
                            this.setState({ password: evt.target.value });
                        }}
                        type="password"
                        onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('Forgot Create Password') }}
                        className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                        placeholder="Mật khẩu mới" />
                </div>
                <div className="form-group">
                    <input
                        value={this.state.confirm}
                        onChange={evt => {
                            this.setState({ confirm: evt.target.value });
                        }}
                        onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('Forgot Confirm') }}
                        type="password"
                        className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                        placeholder="Xác nhận mật khẩu mới" />
                </div>
                <div className="text-center mt-4 pt-2">
                    <button className="btn btn-primary btn-lg" type="submit">Đặt mật khẩu</button>
                </div>
            </form>
        </div>
    }
    renderOtp() {
        return <div>
            <h3 className="gapo-title mb-3">Lấy lại mật khẩu</h3>
            <div className="font-size-large mb-4">Nhập mã xác thực vừa được gửi tới số điện thoại của bạn và mật khẩu mới</div>
            <form onSubmit={this.verifyForgetPassword.bind(this)} className>
                <div className="form-group">
                    <input
                        value={this.state.otp}
                        onChange={evt => {
                            this.setState({ otp: evt.target.value });
                        }}
                        type="text"
                        onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('Forgot Input OTP') }}
                        className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                        placeholder="Nhập mã xác thực" />
                </div>
                <div className="font-weight-normal line-height">
                    Bạn chưa nhận được mã xác thực? <a href className="text-primary" onClick={this.onResendClick.bind(this)}>Gửi lại</a>
                </div>
                <div className="text-center mt-4 pt-2">
                    <button className="btn btn-primary btn-lg" type="submit">Xác nhận</button>
                </div>
            </form>
        </div>
    }
    renderDefault() {
        return <div>
            <h3 className="gapo-title mb-3">Lấy lại mật khẩu</h3>
            <div className="font-size-large mb-4">Chúng tôi sẽ gửi cho bạn một mã xác thực để xác nhận số điện thoại này là của bạn</div>
            <form onSubmit={this.onContinueClick.bind(this)} className>
                <div className="form-group">
                    <input
                        onChange={evt => {
                            this.setState({ phone: evt.target.value });
                        }}
                        type="text"
                        onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('Forgot Input Phone') }}
                        className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                        placeholder="Nhập số điện thoại" />
                </div>
                <div className="text-center mt-4 pt-2">
                    <button className="btn btn-primary btn-lg" type="submit">Tiếp tục</button>
                </div>
            </form>
        </div>
    }
}