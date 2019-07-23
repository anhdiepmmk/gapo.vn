import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
import services from '../../services'
import amplitude from 'amplitude-js'
export default class UpdateUserInfo extends Component {
  constructor(props) {
    super(props)
    let dates = [], months = [], years = [];
    for (var i = 0; i < 70; i++) {
      if (i < 31) dates.push(i + 1);
      if (i < 12) months.push(i + 1);
      years.push(i + 1940);
    }
    let userInfo = services.local.get('userInfo');
    try {
      userInfo = JSON.parse(userInfo);
    } catch (err) {

    }
    console.log('user info', userInfo);
    this.state = {
      stage: 'default',
      dates, months, years,
      register: {
        display_name: userInfo.display_name,
        phone: '',
        password: '',
        day: 1,
        mon: 1,
        year: 1940,
        gender: null,
        birth: null
      },
      errorInputDisplayName: '',
      errorInputDisplayNameCode: 0,
      errorInputPhone: '',
      errorInputPhoneCode: 0,
      errorInputPassword: '',
      errorInputPasswordCode: 0,
      errorInputGender: '',
      showPass: false
    }
  }

  validateDisplayName(display_name) {
    if (!display_name) {
      this.setState({ errorInputDisplayNameCode: 1, errorInputDisplayName: 'Vui lòng nhập tên người dùng' })
      return false
    }
    return true
  }
  validatePhone(phone) {
    if (!phone) {
      this.setState({ errorInputPhoneCode: 1, errorInputPhone: 'Vui lòng nhập số điện thoại' })
      return false
    } else if (phone.length !== 10) {
      this.setState({ errorInputPhoneCode: 1, errorInputPhone: 'Số điện thoại không hợp lệ' })
      return false
    } else {
      return true
    }
  }
  validatePassword(password) {
    if (!password) {
      this.setState({ errorInputPasswordCode: 1, errorInputPassword: 'Vui lòng nhập mật khẩu' })
      return false
    } else if (!services.helper.checkPasswordStrength(password)) {
      this.setState({ errorInputPasswordCode: 1, errorInputPassword: 'Mật khẩu cần có tối thiểu 8 kí tự bao gồm cả chữ và số' })
      return false
    } else {
      return true
    }
  }
  validateGender(gender) {
    // if (!gender) {
    //   this.setState({ errorInputGender: 'Vui lòng chọn giới tính' })
    //   return false
    // }
    return true
  }
  async onRegisterClick(evt) {
    try {
      evt.preventDefault();
      this.validateDisplayName(this.state.register.display_name)
      this.validatePhone(this.state.register.phone)
      this.validatePassword(this.state.register.password)
      this.validateGender(this.state.register.gender)
      if (
        !this.validateDisplayName(this.state.register.display_name) ||
        !this.validatePhone(this.state.register.phone) ||
        !this.validatePassword(this.state.register.password) ||
        !this.validateGender(this.state.register.gender)
      ) return
      let birth = moment()
        .date(this.state.register.day)
        .month(this.state.register.mon)
        .year(this.state.register.year).format('YYYY-MM-DD');
      this.setState({ register: { ...this.state.register, birth } });
      await services.data.phoneActiveOTP(this.state.register.phone);
      this.setState({ stage: 'otp' })
    } catch (err) {
      services.helper.alert(err.message);
    }
  }

  async onRegisterVerifyClick(evt) {
    evt.preventDefault();
    try {
      if (!this.state.register.otp || !this.state.register.phone) return services.helper.alert('Vui lòng điền mã xác nhận');
      let loginResponse = await services.data.activeOTPVerify(this.state.register.phone, this.state.register.otp, this.state.register.password)
      services.helper.setUserInfo(loginResponse)
      //update user and password
      await services.data.updateUser({
        display_name: this.state.register.display_name,
        birthday: this.state.register.birth
      })
      // await services.data.changePassword(this.state.register.password);
      window.location.href = '/interest';
    } catch (err) {
      services.helper.alert('Mã xác nhận không đúng');
    }
  }

  async onRegisterResendClick() {
    try {
      await services.data.phoneActiveOTP(this.state.register.phone)
      services.helper.alert('Gửi thành công');
    } catch (err) {
      services.helper.alert(err.message);
    }
  }

  async handleRegisterInput(evt) {
    let { name, value } = evt.target
    let register = _.clone(this.state.register)
    register[[name]] = value
    this.setState({ register })
  }
  trackRegis(evt) {
    let { name, value } = evt.target;
    // console.log('trackRegis', name, value);
    switch (name) {
      case 'display_name':
        if (value) amplitude.getInstance().logEvent('W_Register Update name');
        break;
      case 'phone':
        if (value) amplitude.getInstance().logEvent('W_Register Input Phone');
        break;
      default: break
    }
  }
  renderOtp() {
    return (
      <div className='page-auth'>
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
              <div className="font-size-large mb-4">Vui lòng nhập mã xác thực đã được gửi tới số điện thoại <strong>{this.state.register.phone}</strong>
              </div>
              <form onSubmit={this.onRegisterVerifyClick.bind(this)}>
                <div className="form-group">
                  <input
                    name='otp'
                    onChange={this.handleRegisterInput.bind(this)}
                    type="text"
                    className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none"
                    onBlur={evt => { if (evt.target.value) amplitude.getInstance().logEvent('W_Register Input OTP') }}
                    placeholder="Nhập mã xác thực" />
                </div>
                <div className="font-weight-normal line-height">
                  Bạn chưa nhận được mã xác thực? <a href className="text-primary" onClick={this.onRegisterResendClick.bind(this)}>Gửi lại</a>
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
    )
  }

  renderDefault() {
    return (
      <div className="page-auth">
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
              <h3 className="gapo-title mb-3">Thông tin đăng nhập</h3>
              <form onSubmit={this.onRegisterClick.bind(this)}>
                <div className="form-group">
                  <input
                    name="display_name"
                    value={this.state.register.display_name}
                    onChange={this.handleRegisterInput.bind(this)}
                    type="text"
                    onBlur={this.trackRegis.bind(this)}
                    className={`form-control ${this.state.errorInputDisplayNameCode == 1 ? 'is-invalid' : ''}`}
                    placeholder="Tên tài khoản" />
                  <div className="invalid-feedback">{this.state.errorInputDisplayName}</div>
                </div>
                <div className="form-group">
                  <input
                    onClick={() => {
                      amplitude.getInstance().logEvent('Register Select Phone')
                    }}
                    name="phone"
                    onBlur={this.trackRegis.bind(this)}
                    defaultValue={this.state.register.phone}
                    onChange={this.handleRegisterInput.bind(this)}
                    type="text" className={`form-control ${this.state.errorInputPhoneCode == 1 ? 'is-invalid' : ''}`}
                    placeholder="Số điện thoại" />
                  <div className="invalid-feedback">{this.state.errorInputPhone}</div>
                </div>
                <div className="form-group">
                  <div className="input-group input-group--password">
                    <input type={this.state.showPass ? "text" : "password"} onChange={this.handleRegisterInput.bind(this)} name="password" className={`form-control ${this.state.errorInputPasswordCode == 1 ? 'is-invalid' : ''}`} placeholder="Mật khẩu" />
                    <a onClick={() => { this.setState({ showPass: true }) }} className="input-icon text-dark" style={{ display: !this.state.showPass ? 'block' : 'none', bottom: this.state.errorInputPasswordCode == 1 ? '40%' : '0' }}>
                      <i className="gapo-icon icon-eye" />
                    </a>
                    <a onClick={() => { this.setState({ showPass: false }) }} className="input-icon text-dark" style={{ display: this.state.showPass ? 'block' : 'none', bottom: this.state.errorInputPasswordCode == 1 ? '40%' : '0' }}>
                      <i className="gapo-icon icon-eye-slash" />
                    </a>
                    <div className="invalid-feedback">{this.state.errorInputPassword}</div>
                  </div>
                </div>
                <div className="form-group d-flex align-items-center">
                  <label htmlFor className="mb-0 mr-2 font-size-large">Ngày sinh</label>
                  <select onChange={this.handleRegisterInput.bind(this)} name="day" className="custom-select w-auto mr-2">
                    {this.state.dates.map((item, index) => <option value={item}>{item}</option>)}
                  </select>
                  <select onChange={this.handleRegisterInput.bind(this)} name="mon" className="custom-select w-auto mr-2">
                    {this.state.months.map((item, index) => <option value={item}>Tháng {item}</option>)}
                  </select>
                  <select onChange={this.handleRegisterInput.bind(this)} name="year" className="custom-select w-auto mr-2">
                    {this.state.years.map((item, index) => <option value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="form-group d-flex align-items-center font-size-large mt-4" style={{ position: 'relative' }}>
                  <label htmlFor className="mb-0 mr-4">Giới tính</label>
                  <div className="custom-control custom-radio mr-4">
                    <input onChange={this.handleRegisterInput.bind(this)} type="radio" value={'male'} id="male" name="gender" className="custom-control-input" />
                    <label className="custom-control-label" htmlFor="male">Nam</label>
                  </div>
                  <div className="custom-control custom-radio">
                    <input onChange={this.handleRegisterInput.bind(this)} type="radio" id="female" value='female' name="gender" className="custom-control-input" />
                    <label className="custom-control-label" htmlFor="female">Nữ</label>
                  </div>
                  <div className="invalid-feedback" style={{
                    display: !this.state.register.gender ? 'block' : 'none',
                    position: 'absolute',
                    left: '50%',
                    bottom: '10%'
                  }}>
                    {this.state.errorInputGender}
                  </div>
                </div>
                <div className="text-center mt-4 pt-2">
                  <button className="btn btn-primary btn-lg" type="submit">Tiếp tục</button>
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
    )
  }

  render() {
    switch (this.state.stage) {
      case 'otp':
        return this.renderOtp()
      default:
        return this.renderDefault()
    }
  }
}
