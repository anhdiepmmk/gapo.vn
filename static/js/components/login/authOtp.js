import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import services from '../../services';
import amplitude from 'amplitude-js'
export default class AuthOtp extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      otp: ''
    }
  }
  async onVerify(evt) {
    if (this.props.onVerifyClick) {
      this.props.onVerifyClick(this.state.otp);
    }
  }
  async onResendClick(evt) {
    amplitude.getInstance().logEvent('W_ Register Resend OTP')
    evt.preventDefault();
    if (this.props.onResendClick) {
      this.props.onResendClick();
    }

  }
  render() {
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
            <h3 className="gapo-title mb-3">Nhập mã xác thực</h3>
            <div className="font-size-large mb-4">Vui lòng nhập mã xác thực đã được gửi tới số điện thoại
                <strong> {this.props.phone}</strong></div>
            <form onSubmit={this.onVerify.bind(this)}>
              <div className="form-group">
                <input
                  onChange={evt => {
                    this.setState({ otp: evt.target.value });
                  }}
                  onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('W_Register Input OTP') }}
                  type="text"
                  className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                  placeholder="Nhập mã xác thực" />
              </div>
              <div className="font-weight-normal line-height">
                Bạn chưa nhận được mã xác thực? <a href className="text-primary" onClick={this.onResendClick.bind(this)}>Gửi lại</a>
              </div>
              <div className="text-center mt-4 pt-2">
                <button className="btn btn-primary btn-lg" type="submit">Hoàn thành</button>
              </div>
            </form>
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
}