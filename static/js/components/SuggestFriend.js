import React from 'react';
import { Link } from 'react-router-dom';
import services from '../services';
import Slider from "react-slick";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import config from '../services/config';

function ButtonAddFriend(props) {
  const [relation, setRelation] = React.useState(props.user)
  const [dropDownOpen, setDropDownOpen] = React.useState(false)

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
    } catch (e) {
      services.helper.alert(e.meesage)
    }
  }
  const cancelRelation = async (id) => {
    try {
      await services.data.cancelUserRelation(id)
      setRelation('')
    } catch (e) {
      services.helper.alert(e.meesage)
    }
  }
  if (!services.helper.checkLogged()) return null
  if (relation === 'pending') return (
    <Dropdown isOpen={dropDownOpen} toggle={() => setDropDownOpen(!dropDownOpen)} direction='up'>
      <DropdownToggle className="btn btn-light btn-sm">
        Đã gửi lời mời
        </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => { cancelRelation(props.user.id) }}>Huỷ lời mời</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
  return (
    <button onClick={() => { requestUserRelation(props.user.id) }} className="btn btn-block btn-sm btn-primary">
      <i className="gapo-icon icon-add-friend mr-1" />
      Kết bạn
    </button>
  )
}

export default class SuggestFriend extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      loading: true
    }
  }

  componentDidMount() {
    this.loadSuggest()
  }

  async loadSuggest() {
    let rs = await services.data.listFriendSuggest(null, 20);
    this.setState({ data: rs, loading: false });
  }

  render() {
    if (this.state.loading) return null;
    var settings = {
      draggable: false,
      accessibility: false,
      slidesToShow: this.props.nFriend || 5,
      slidesToScroll: 1,
      dots: false,
      infinite: false,
      arrows: false
    };
    return <div className="gapo-box">
      <div className="d-flex align-items-center mb-3">
        <div className="gapo-subtitle">Gợi ý kết bạn</div>
        <Link to={`/suggest`} className="text-primary ml-auto">
          Xem tất cả
        </Link>
      </div>
      <div className="gapo-suggestion">
        <div className="suggest__actions">
          <a onClick={() => { this.refs.slickEvent.slickPrev() }} className="suggestion__action suggestion__action--prev">
            <i className="gapo-icon icon-prev" />
          </a>
          <a onClick={() => { this.refs.slickEvent.slickNext() }} className="suggestion__action suggestion__action--next">
            <i className="gapo-icon icon-next" />
          </a>
        </div>
        <div className="suggestion__list" style={{}}>
          <Slider ref='slickEvent' {...settings}>
            {this.state.data.map((item, index) => {
              if (item.relation == 'friend') return;
              return <div style={{ margin: 3 }} key={'index' + index}>
                <div key={index} style={{ float: 'unset', margin: 'auto', width: '9.4375rem' }} className="suggestion__item py-1">
                  <Link to={item._profileUrl} className="gapo-thumbnail gapo-thumbnail--1x1 mb-2" style={{ backgroundImage: `url(${item.avatar || item.avatar != 'undefined' ? item.avatar : config.defaultAvatar})`, borderRadius: '0.25rem' }}>
                    {/* <img src={item.avatar} alt /> */}
                  </Link>
                  <Link to={item._profileUrl} style={{
                    height: 35,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    width: '100%',
                    overflow: "hidden",
                  }} className="d-block text-body font-weight-semi-bold mb-2 pt-1">{item.display_name || `...`}</Link>
                  {item.location ? <div className="d-flex align-items-center justify-content-center font-size-small text-secondary mb-2">
                    <i className="gapo-icon icon-location mr-1" />
                    {item.location}
                  </div> : null}
                  <ButtonAddFriend user={item} />
                </div>
              </div>
            })}
          </Slider>
        </div>
      </div>
    </div>
  }
}