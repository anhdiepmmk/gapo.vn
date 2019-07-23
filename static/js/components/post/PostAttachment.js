import React from 'react';
import ReactPlayer from 'react-player'
import TrackVisibility from 'react-on-screen';
import services from '../../services';
import MediaSlide from './MediaSlide';
import { visible } from 'ansi-colors';
import { connect } from 'react-redux';
import configStore from '../../configStore';
class PostAttachment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      collapsePost: true,
      enable: true
    }
  }
  renderThumb(item, index, morePhoto) {
    switch (item.type) {
      case 'video':
        return <div className={`attachment__item attachment__item--${index + 1}`} key={index} onClick={() => {
          this.setState({ enable: false });
          services.helper.showPostWithContent(this.props.post_id, index, this.props.feed)
        }}>
          <a key={index} style={{ backgroundImage: `url(${item.thumb ? item.thumb.src : null})` }}>
            <img src={`${item.thumb ? item.thumb.src : null}`} alt='post-img' className='img-fluid' />
            {morePhoto > 0 ? <span className="more-photo">+{morePhoto}</span> : <i className="svg-icon icon-play"></i>}
          </a>
        </div>
      case 'image':
      default:
        return <div className={`attachment__item attachment__item--${index + 1}`} key={index} onClick={() => {
          this.setState({ enable: false });
          services.helper.showPostWithContent(this.props.post_id, index, this.props.feed)
        }}>
          <a key={index} style={{ backgroundImage: `url(${item.src})` }}>
            <img src={`${item.src}`} alt='post-img' className='img-fluid' />
            {morePhoto > 0 ? <span className="more-photo">+{morePhoto}</span> : null}
          </a>
        </div>
    }
  }
  renderVideo = ({ isVisible, item, index }) => {
    let canPlay = this.props.activeVideo === item.video_id;
    if (isVisible) {
      if (this.props.addVisible) {
        this.props.addVisible(item.video_id);
      }
    } else {
      if (this.props.removeVisible) {
        this.props.removeVisible(item.video_id);
      }
    }
    return <div className='video-max'>
      <div className='video-bg' style={{ backgroundImage: `url(${item.thumb.src})` }}>
      </div>
      {this.state.enable ? <ReactPlayer url={item.src} width='auto' height='100%' controls key={index} playing={canPlay} className='player-container' /> : null}
    </div>
  }
  renderFullItem(item, index, click) {
    switch (item.type) {
      case 'video':
        return <div className={`attachment__item attachment__item--${index + 1}`} key={index}>
          <TrackVisibility>
            <this.renderVideo item={item} index={index} />
          </TrackVisibility>
        </div>
      case 'image':
      default:
        return <img src={item.src} className='img-full' />
    }
  }
  renderThumbFullItem(item, index) {
    switch (item.type) {
      case 'video':
        return <div onClick={() => {
          this.setState({ enable: false });
          if (this.props.resetActiveVideo) {
            this.props.resetActiveVideo();
          }
          this.setState({ enable: false });
          services.helper.showPostWithContent(this.props.post_id, index, this.props.feed).then(() => {
            this.setState({ enable: true });
          });
        }} className={`attachment__item attachment__item--${index + 1}`} key={index}>
          <TrackVisibility>
            <this.renderVideo item={item} index={index} />
          </TrackVisibility>
        </div>
      case 'image':
      default:
        return <div onClick={() => {
          this.setState({ enable: false });
          services.helper.showPostWithContent(this.props.post_id, index, this.props.feed)
        }} className={`attachment__item attachment__item--${index + 1}`} key={index}>
          <img src={item.src} />
        </div>
    }
  }
  createContent() {
    let content = null;
    if (this.props.mediaData.length === 0) return null;
    switch (this.props.display) {
      case 'expand':
        content = this.props.mediaData.map((item, index) => {
          return this.renderFullItem(item, index)
        })
        return <div className={`post-item__attachment`}>
          {content}
        </div>
      // return content;
      case 'slide':
        return <MediaSlide media={this.props.mediaData} itemIndex={this.props.itemIndex} />;
      case 'collapse':
      default:
        if (this.props.mediaData.length === 1) {
          content = <div className={`post-item__attachment post-item__attachment--${this.props.mediaData.length}`}>
            {this.props.mediaData.map((item, index) => {
              return this.renderThumbFullItem(item, index);
            })}
          </div>
        } else if (this.props.mediaData.length <= 5) {
          content = <div className={`post-item__attachment post-item__attachment--${this.props.mediaData.length}`}>
            {this.props.mediaData.map((item, index) => {
              return this.renderThumb(item, index);
            })}
          </div>
        } else {
          let first = [];
          for (var i = 0; i < 4; i++) {
            first.push(this.props.mediaData[i]);
          }
          content = <div className={`post-item__attachment post-item__attachment--5`}>
            {first.map((item, index) => {
              return this.renderThumb(item, index);
            })}
            {this.renderThumb(this.props.mediaData[4], 4, this.props.mediaData.length - 5)}
          </div>
        }
        return content;
    }
  }

  render() {
    return this.createContent();
  }
}
const mapStateToProps = (state) => { return { video: state.video } }
export default connect(mapStateToProps, null, null)(PostAttachment);