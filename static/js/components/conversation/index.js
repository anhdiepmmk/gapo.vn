import React from 'react';
import queryString from 'query-string';
import configStore from '../../configStore';
// import Conversation from '../messenger/Conversation';
export default class ConversationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: props.match.params
    }
  }
  componentDidMount() {
    configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'has-bottom-nav page-messenger fixed-top-nav' });
  }

  onBackClick() {
    window.history.back();
  }

  render() {
    return null;
    // return <Conversation channel_id={this.state.query.channel_id} />
  }
}