import React, { Component, useState } from 'react'
import SearchHeader from '../SearchHeader'
import LeftSideBar from '../feed/LeftSideBar'
import services from '../../services'
import { Link } from 'react-router-dom'
import helper from '../../services/helper';



function BtnAddFriend(props) {

  const [relation, setRelation] = useState(props.user)

  const requestUserRelation = async (id) => {
    if (!services.helper.checkActive()) {
      return services.helper.requestActive().then(rs => {
        if (rs === 'active') {
          window.location.href = '/login/update-information'
        }
      })
    }
    try {
      await services.data.requestUserRelation(id)
      setRelation('pending')
    } catch (error) {
      helper.alert(error.message)
    }
  }
  const cancelUserRelation = async (id) => {
    try {
      await services.data.cancelUserRelation(id)
      setRelation('')
    } catch (e) {
      helper.alert(e.message)
    }
  }
  if (!services.helper.checkLogged()) return null;
  if (relation == 'pending') return (
    <button onClick={() => cancelUserRelation(props.user.id)} className="btn btn-block btn-sm btn-light btn-width-90">
      <i className="gapo-icon icon-check mr-1" />
      Đã gửi lời mời
    </button>
  )
  return (
    <button onClick={() => { requestUserRelation(props.user.id) }} className="btn btn-block btn-sm btn-primary btn-width-90">
      <i className="gapo-icon icon-add-friend mr-1" />
      Kết bạn
    </button>
  )

}


export default class SuggestFriendPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      loading: true
    }
  }
  componentDidMount() {
    this.loadSuggestion()
  }
  async requestUserRelation(id, index) {
    let data = [...this.state.data]
    data[index].relation = 'pending'
    this.setState({ data })
    let res = await services.data.requestUserRelation(id);
    // services.helper.alert('Gửi lời kết bạn thành công');
  }
  async loadSuggestion() {
    let res = await services.data.listFriendSuggest(null)
    let count_mutual_friend = res.map(user => user.id).map(id => {
      return services.data.countMutualFriends(id, null).catch(() => 0)
    })
    let resultList = await Promise.all(count_mutual_friend)
    const result = res.map((user, index) => ({ ...user, mutual_friend_count: resultList[index] }));
    this.setState({
      data: result,
      loading: false
    })
  }
  render() {
    return (
      <React.Fragment>
        <SearchHeader />
        <main className="gapo-main row">
          <div class="col col-aside">
            <div className="aside__wrapper">
              <LeftSideBar />
            </div>
          </div>
          <div className="col">
            <div class="row justify-content-center">
              <div className="col col-900 py-4">
                <div className="align-items-center">
                  <div className="gapo-subtitle mb-3">
                    Những người bạn có thể biết
                  </div>
                  <div class="row">
                    {this.state.data.map((user, index) => (
                      <div key={index} className="suggestion-item-background mb-2 mr-2">
                        <Link
                          to={user._profileUrl}
                          className="gapo-thumbnail gapo-thumbnail--1x1 mb-2 rounded"
                          style={{ backgroundImage: `url(${user.avatar})` }}>
                        </Link>
                        <Link
                          to={user._profileUrl}
                          className="suggestion-display-name text-body font-weight-semi-bold mb-2 pt-1"
                        >
                          {user.display_name}
                        </Link>
                        {user.mutual_friend_count > 0
                          ? (
                            <div className="d-flex align-items-center" style={{ marginLeft: '12px', marginTop: '4px' }}>
                              <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.95625 7.46983L5.31525 7.00108C5.18253 6.9631 5.06287 6.88923 4.96944 6.7876C4.87601 6.68597 4.81245 6.56052 4.78575 6.42508L4.68525 5.91883C5.07705 5.73977 5.40921 5.452 5.64227 5.08972C5.87533 4.72743 5.99949 4.30586 6 3.87508V2.84458C6.0091 2.24792 5.78724 1.67082 5.38079 1.23391C4.97435 0.796992 4.41477 0.534067 3.819 0.500082C3.51777 0.49084 3.21775 0.542207 2.93676 0.651135C2.65576 0.760063 2.39951 0.924331 2.18322 1.13419C1.96692 1.34405 1.79499 1.59522 1.67763 1.8728C1.56026 2.15038 1.49986 2.44871 1.5 2.75008V3.87508C1.50037 4.30599 1.62446 4.72772 1.85753 5.09015C2.0906 5.45259 2.42284 5.74047 2.81475 5.91958L2.71425 6.42508C2.68743 6.56039 2.62381 6.68567 2.53039 6.78716C2.43697 6.88865 2.31737 6.96241 2.18475 7.00033L0.54375 7.46908C0.387019 7.51391 0.249161 7.60859 0.151048 7.73877C0.0529347 7.86896 -9.04773e-05 8.02757 1.15891e-07 8.19058V9.87508C1.15891e-07 9.97454 0.0395089 10.0699 0.109835 10.1402C0.180161 10.2106 0.275544 10.2501 0.375 10.2501H7.125C7.22446 10.2501 7.31984 10.2106 7.39017 10.1402C7.46049 10.0699 7.5 9.97454 7.5 9.87508V8.19058C7.49993 8.02769 7.44683 7.86926 7.34873 7.73922C7.25063 7.60919 7.11286 7.51463 6.95625 7.46983Z" fill="#808080" />
                              </svg>
                              <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.45624 7.7198L3.81524 7.25105C3.68262 7.21313 3.56302 7.13937 3.4696 7.03788C3.37618 6.93639 3.31257 6.8111 3.28574 6.6758L3.18524 6.16955C3.57715 5.99044 3.90939 5.70255 4.14246 5.34012C4.37553 4.97769 4.49962 4.55595 4.49999 4.12505V3.09455C4.50909 2.49788 4.28723 1.92079 3.88078 1.48387C3.47434 1.04696 2.91476 0.784033 2.31899 0.750047C1.87426 0.736628 1.43553 0.855368 1.05827 1.09126C0.68101 1.32714 0.382156 1.66959 0.19949 2.0753C0.557276 2.59601 0.74918 3.21277 0.74999 3.84455V4.87505C0.748646 5.14788 0.709525 5.4192 0.633741 5.6813C0.828165 5.88525 1.05917 6.05088 1.31474 6.16955L1.21424 6.67505C1.18742 6.81035 1.1238 6.93564 1.03038 7.03713C0.936961 7.13862 0.817364 7.21238 0.684741 7.2503L0.0524902 7.43105L1.16249 7.7483C1.47539 7.83869 1.75053 8.02812 1.94662 8.28817C2.1427 8.54822 2.24915 8.86486 2.24999 9.19055V10.875C2.24875 11.0031 2.2254 11.13 2.18099 11.25H5.62499C5.72445 11.25 5.81983 11.2105 5.89016 11.1402C5.96048 11.0699 5.99999 10.9745 5.99999 10.875V8.44055C5.99992 8.27766 5.94682 8.11922 5.84872 7.98919C5.75062 7.85915 5.61285 7.76459 5.45624 7.7198Z" fill="#808080" />
                              </svg>
                              <div className="text-secondary" style={{ marginLeft: '4px' }}>{user.mutual_friend_count} bạn chung</div>
                            </div>
                          )
                          : (
                            <div className="d-flex align-items-center" style={{ backgroundColor: 'white', marginTop: '4px' }}>
                              <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.25 0H0.75C0.335786 0 0 0.335786 0 0.75V11.25C0 11.6642 0.335786 12 0.75 12H11.25C11.6642 12 12 11.6642 12 11.25V0.75C12 0.335786 11.6642 0 11.25 0Z" fill="white" />
                              </svg>
                            </div>
                          )
                        }
                        <div className="button-container">
                          {/* <button onClick={() => { this.requestUserRelation(user.id, index) }} className="btn btn-block btn-sm btn-primary btn-width-90">
                            <i className="gapo-icon icon-add-friend mr-1" />
                            Kết bạn
                          </button> */}
                          <BtnAddFriend user={user} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </React.Fragment>
    )
  }
}
