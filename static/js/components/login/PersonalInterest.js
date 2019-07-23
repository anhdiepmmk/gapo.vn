import React, { Component } from 'react'
import config from '../../services/config'
import services from '../../services'

export default class PersonalInterest extends Component {
  constructor (props) {
    super(props)
    this.state = {
      interests: []
    }
  }
  componentDidMount() {
    this.getPageType()
  }
  async getPageType() {
    try {
      let res = await services.data.getPageType()
      let result = res.map((item) => ({...item, isChoose: false}))
      this.setState({ interests: result })
    } catch (e) {
      console.log('error', e)
    }
  }
  async toggleChoose(index) {
    let interestsCopy = JSON.parse(JSON.stringify(this.state.interests))
    interestsCopy[index].isChoose = !interestsCopy[index].isChoose
    this.setState({
      interests: interestsCopy
    })
  }
  async chooseInterest(evt) {
    evt.preventDefault();
    let interestIds = this.state.interests.filter(interest => interest.isChoose === true).map(interest => interest.id)
    if (interestIds.length < 2) return services.helper.alert('Vui lòng chọn tối thiểu 2 sở thích')
    await services.data.updateUser({
      user_settings: {
        interest: interestIds,
      }
    })
    window.location.href = "/"
  }
  render() {
    return (
      <React.Fragment>
        <header className="gapo-header">
          <div className="d-flex align-items-center container">
            <a href className="header__brand mx-auto">
              <img src="/assets/images/logo.svg" height={30} alt="GAPO" className="header__logo" />
            </a>
          </div>
        </header>
        <main className="gapo-main row">
          <div className="col">
            <form onSubmit={this.chooseInterest.bind(this)}>
              <div className="row justify-content-center" style={{ marginTop: '2%' }}>
                <div className="col col-900 py-4 bg-white">
                  <div className="d-flex align-items-center">
                    <h3 className="gapo-title ml-2">Chọn chủ đề bạn yêu thích</h3>
                    <div className="text-center ml-auto mr-3">
                      <button className="btn btn-primary btn-md" type="submit">Tiếp tục</button>
                    </div>
                  </div>
                  <div className="row justify-content-center mt-3 ml-2">
                    {this.state.interests.map((interest, index) => (
                      <div id={index} className="interest-item-background mt-2 mb-2 mr-2 text-center" onClick={() => this.toggleChoose(index)}>
                        <img src={interest.image} alt />
                        <div className="interest-overlay"></div>
                        {interest.isChoose ? (
                          <div className="active-overlay">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44Z" fill="#6FBE44"/>
                              <path d="M10 22L18 30L34 14" stroke="white" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </div>
                        ) : null}
                        <div className="text-overlay">
                          {interest.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </React.Fragment>
    )
  }
}
