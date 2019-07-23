import React from 'react';
import configStore from '../../configStore';
import { FacebookProvider, Login } from 'react-facebook';
import config from '../../services/config';
import services from '../../services';
import UpdateUserInfo from './UpdateUserInfo'
import GoogleLogin from 'react-google-login';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import amplitude from 'amplitude-js';
export default class LoginContainer extends React.Component {
    constructor(props) {
        super(props);
        let isLogin = services.helper.checkLogged();
        if (isLogin) {
            props.history.replace('/')
        }

        let dates = [], months = [], years = [];
        for (var i = 0; i < 70; i++) {
            if (i < 31) dates.push(i + 1);
            if (i < 12) months.push(i + 1);
            years.push(i + 1940);
        }

        this.state = {
            stage: 'default',
            registerType: 'phone',
            dates, months, years,
            email: '',
            login: {
                password: '', email: '',
            },
            register: {
                display_name: '',
                phone: '',
                email: '',
                password: '',
                day: 1,
                mon: 1,
                year: 1940,
                gender: null,
                birth: null
            },
            errorInput: 0,
            errorInputDisplayName: '',
            errorInputDisplayNameCode: 0,
            errorInputPhone: '',
            errorInputPhoneCode: 0,
            errorInputPassword: '',
            errorInputPasswordCode: 0,
            errorInputGender: '',
            showPass: false,
            sex: 2
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
        if (!gender) {
            this.setState({ errorInputGender: 'Vui lòng chọn giới tính' })
            return false
        }
        return true
    }
    async onRegisterclick(evt) {
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
            await services.data.phoneRegister(this.state.register.phone);
            this.setState({ stage: 'otp' })
        } catch (err) {
            services.helper.alert(err.message);
        }
    }
    async onRegisterVerifyClick(evt) {
        evt.preventDefault();
        try {
            if (!this.state.register.otp || !this.state.register.phone) return services.helper.alert('Vui lòng điền mã xác nhận');
            let loginResponse = await services.data.phoneVerify(this.state.register.phone, this.state.register.otp, this.state.register.password);
            services.helper.setUserInfo(loginResponse);
            //update user and password
            await services.data.updateUser({
                display_name: this.state.register.display_name,
                birthday: this.state.register.birth
            })
            // await services.data.changePassword(this.state.register.password, null);
            window.location.href = '/interest';
        } catch (err) {
            services.helper.alert(err.message);
        }
    }
    async onRegisterResendClick() {
        try {
            await services.data.phoneRegister(this.state.register.phone);
            services.helper.alert('Gửi thành công');
        } catch (err) {
            services.helper.alert(err.message);
        }
    }
    componentDidMount() {
        configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'page-auth' });
        // this.loadMore();
    }
    goBack() {
        this.props.history.replace("/");
    }
    handleFbResult(rs) {
        this.loginByToken('fb', rs.tokenDetail.accessToken)
    }
    handleGgResult(rs) {
        if (rs.error) return;
        this.loginByToken('gg', rs.accessToken)
    }
    async loginByToken(type, token) {
        try {
            let loginResponse = await services.data.loginSocial(type, token);
            services.helper.setUserInfo(loginResponse)
            configStore().dispatch({ type: 'SET_USER_INFO', data: Object.assign({}, loginResponse.user, { _auth: true }) });
            if (loginResponse.user.status === 0) {
                window.location.href = '/login/update-information'
            } else {
                window.location.href = '/';
            }
            // 
        } catch (e) {
            services.helper.alert(e.message)
        }
    }
    async handleError(rs) {
        services.helper.alert('Đăng nhập thất bại. Vui lòng thử lại');
    }
    async register() {
        let isEmail = services.helper.checkValidEmail(this.state.register.email);
        if (isEmail) {

        } else { //phone

        }
        await services.data.emailRegister(this.state.register);
    }
    async handleLoginInput(evt) {
        let { name, value } = evt.target;
        let login = _.clone(this.state.login);
        login[[name]] = value;
        // debugger
        this.setState({ login });
    }
    async handleRegisterInput(evt) {
        let { name, value } = evt.target;
        if (name === 'gender') amplitude.getInstance().logEvent('W_Register Update Gender');
        let register = _.clone(this.state.register);
        register[[name]] = value;
        this.setState({ register });
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
    async onLoginClick(evt) {
        try {
            evt.preventDefault();
            if (!this.state.login.email) return this.setState({ errorInput: 1, errorInputText: 'Vui lòng nhập email' })
            if (!this.state.login.password) return this.setState({ errorInput: 2, errorInputText: 'Vui lòng nhập mật khẩu' })
            let loginResponse = await services.data.authPassword({
                phone: this.state.login.email,
                password: this.state.login.password
            });
            services.helper.setUserInfo(loginResponse);
            window.location.href = '/';
        } catch (err) {
            services.helper.alert(err.message);
        }
    }

    render() {
        let content = null;
        switch (this.state.stage) {
            case 'otp':
                return this.renderOtp();
            case 'update':
                return <UpdateUserInfo registerType={this.state.registerType} />
            default:
                return this.renderDefault();
        }
    }
    renderOtp() {
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
                  <strong> {this.state.register.phone}</strong></div>
                        <form onSubmit={this.onRegisterVerifyClick.bind(this)}>
                            <div className="form-group">
                                <input name='otp' onChange={this.handleRegisterInput.bind(this)} type="text" className="form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none" placeholder="Nhập mã xác thực" />
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
    }
    renderDefault() {
        return <div>
            <header className="gapo-header">
                <div className="d-flex align-items-center container">
                    <a href className="header__brand mx-auto">
                        <img src="/assets/images/logo.svg" height={30} alt="GAPO" className="header__logo" />
                    </a>
                </div>
            </header>
            <main className="gapo-main" style={{ marginTop: '24px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-6 text-center" style={{ marginTop: '6%' }}>
                            <img src="/assets/images/group-auth.svg" alt="" className="img-fluid" />
                        </div>
                        <div className="col-6">
                            <div className="auth-block">
                                <h3 className="gapo-title mb-3">
                                    Đăng nhập
                                </h3>
                                <form onSubmit={this.onLoginClick.bind(this)} className="row small-gutters">
                                    <div className="form-group col-input">
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input tabIndex={1} name="email" type="text" className={`form-control ${this.state.errorInput == 1 ? 'is-invalid' : ''}`} onChange={this.handleLoginInput.bind(this)} />
                                        <div className="invalid-feedback">{this.state.errorInputText}</div>
                                    </div>
                                    <div className="form-group col-input">
                                        <div className="d-flex">
                                            <label htmlFor="password">Mật khẩu</label>
                                            <Link onClick={() => amplitude.getInstance().logEvent('Forgot Select')} tabIndex={4} to='/forgot' className="font-size-small text-primary ml-auto">Quên mật khẩu</Link>
                                        </div>
                                        <input tabIndex={2} name="password" type="password" className={`form-control ${this.state.errorInput == 2 ? 'is-invalid' : ''}`} onChange={this.handleLoginInput.bind(this)} />
                                        <div className="invalid-feedback">{this.state.errorInputText}</div>
                                    </div>
                                    <div className="form-group col-btn pt-4">
                                        <button onClick={() => amplitude.getInstance().logEvent('Login Phone')} tabIndex={3} className="btn btn-primary btn-block" type='submit'>Đăng nhập</button>
                                    </div>
                                </form>
                                <div className="d-flex align-items-center">
                                    <div className="mr-2">Hoặc đăng nhập bằng</div>
                                    <FacebookProvider appId={config.fbAppId}>
                                        <Login
                                            scope="email"
                                            onCompleted={this.handleFbResult.bind(this)}
                                            onError={this.handleError.bind(this)}
                                        >
                                            {({ loading, handleClick, error, data }) => (
                                                <a href="#/" className="mr-1 px-1" title="Facebook" onClick={(props) => { amplitude.getInstance().logEvent('Login Facebook'); handleClick(props) }}>
                                                    <i className="svg-icon icon-facebook float-left" />
                                                </a>
                                            )}
                                        </Login>
                                    </FacebookProvider>
                                    <GoogleLogin
                                        clientId="471442622035-esf8v8g1nrg3r089t05qvv346078jv2d.apps.googleusercontent.com"
                                        render={renderProps => (
                                            <a href="#/" className="mr-1 px-1" title="Google" onClick={(props) => { amplitude.getInstance().logEvent('Login Google'); renderProps.onClick(props) }} disabled={renderProps.disabled}>
                                                <i className="svg-icon icon-google float-left" />
                                            </a>
                                        )}
                                        buttonText="Login"
                                        onSuccess={this.handleGgResult.bind(this)}
                                        onFailure={this.handleGgResult.bind(this)}
                                        cookiePolicy={'single_host_origin'}
                                    />

                                </div>
                                <hr />
                                <h3 className="gapo-title mb-3">
                                    Tạo tài khoản mới
                                </h3>
                                <form onSubmit={this.onRegisterclick.bind(this)} className>
                                    <div className="form-group">
                                        <input
                                            name="display_name"
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
                                                amplitude.getInstance().logEvent('W_Register Select Phone')
                                            }}
                                            name="phone"
                                            defaultValue={this.state.register.phone}
                                            onChange={this.handleRegisterInput.bind(this)}
                                            onBlur={this.trackRegis.bind(this)}
                                            type="text"
                                            className={`form-control ${this.state.errorInputPhoneCode == 1 ? 'is-invalid' : ''}`}
                                            placeholder="Số điện thoại" />
                                        <div className="invalid-feedback">{this.state.errorInputPhone}</div>
                                    </div>
                                    <div className="form-group d-flex align-items-center">
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
                                    <div className="auth__policy my-4">
                                        Bằng cách nhấp vào Đăng ký, bạn đồng ý với <Link to="/dieukhoansudung" href className="text-primary">Điều khoản</Link>, <Link to="/chinhsachbaomat" href className="text-primary">Chính sách dữ
                                        liệu</Link> và Chính sách cookie của chúng tôi.
                                    </div>
                                    <div className="form-group">
                                        <button className="btn btn-blue btn-lg" type='submit' >Đăng ký</button>
                                    </div>
                                </form>
                            </div>
                        </div>
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