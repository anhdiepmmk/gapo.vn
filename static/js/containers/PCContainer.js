import React from 'react';
import { connect } from 'react-redux'
import { Route, Switch, Link } from 'react-router-dom';
import Video from '../components/video';
// import VideoSuggest from '../components/video/VideoSuggest'
import MessengerContainer from '../components/messenger';
import Notification from '../components/Notification';
import ProfileContainer from '../components/profile';
import Friend from '../components/friend';
import ListFriend from '../components/friend/ListFriend';
import SuggestFriendPage from '../components/friend/SuggestFriendPage'
import Conversation from '../components/conversation';
import PostDetailContainer from '../components/post/PostDetailContainer';
import Create from '../components/Create';
import Search from '../components/Search';
import Login from '../components/login';
import PersonalInterest from '../components/login/PersonalInterest'
import ChangePassword from '../components/profile/ChangePassword'
import UpdateUserInfo from '../components/login/UpdateUserInfo'
import FeedContainer from '../components/feed/index';
import ModalControl from '../components/modal/index';
import PageContainer from '../components/pages'
import PageSuggest from '../components/pages/pageSuggest'
import PagePreview from '../components/pages/PagePreview'
import CreatePage from '../components/pages/createPage'
import Term from './../components/Term';
import services from '../services';
import ForgotPassword from '../components/login/forgotPassword';
import SearchHeader from '../components/SearchHeader';
import PopupNotification from '../components/PopupNotification';
import PageSuggestCategory from '../components/pages/pageSuggestCategory';
import $ from 'jquery';
import RequireLoginPage from './../shared/RequireLoginPage';
import Policy from '../components/Policy';
import NotFound from '../components/notfound/index'
class MobileContainer extends React.Component {
    constructor(props) {
        super(props)
    }
    componentWillReceiveProps(next) {
        $(window).scrollTop(0);
    }
    privateComp(Comp, props) {
        services.helper.getNotification();
        if (this.props.user.id) {
            return <Comp {...props} />
        }
        return (
            <React.Fragment>
                <SearchHeader props={props} />
                <div className="row justify-content-center">
                    <div className="col col-500 py-4">
                        <RequireLoginPage />
                    </div>
                </div>
            </React.Fragment>
        )
    }
    componentDidMount() {
        this.getUser()
    }
    async getUser() {
        try {
            let rs = await services.data.viewUser(this.props.user.id);
            console.log('refesh userInfo', rs);
            services.helper.refeshUserInfo(rs);
        } catch (err) {
            console.log('err get user in server', err)
        }
    }
    render() {
        return <React.Fragment>
            <ModalControl />
            <PopupNotification />
            <Switch>
                <Route exact path="/" component={FeedContainer} />
                <Route exact path="/video" render={(props) => {
                    // return this.privateComp(Video, props);
                    return <Video />;
                }} />
                {/* <Route exact path="/suggestvideo" render={(props) => {
                    return this.privateComp(VideoSuggest, props)
                }} /> */}
                <Route exact path="/login" component={Login} />
                <Route exact path="/login/update-information" component={UpdateUserInfo} />
                <Route exact path="/interest" component={PersonalInterest} />
                <Route exact path="/forgot" component={ForgotPassword} />
                <Route exact path="/messenger" render={(props) => {
                    return this.privateComp(MessengerContainer, props);
                }} />
                <Route exact path="/messenger/:channel_id" render={(props) => {
                    return this.privateComp(MessengerContainer, props);
                }} />
                <Route exact path="/notification" render={(props) => {
                    return this.privateComp(Notification, props);
                }} />
                <Route exact path="/profile/:id" component={ProfileContainer} />

                <Route path="/profile" component={ProfileContainer} />
                <Route path="/change-password" component={ChangePassword} />
                <Route exact path="/friend" render={(props) => {
                    return this.privateComp(Friend, props);
                }} />
                <Route exact path="/listFriend" render={(props) => {
                    return this.privateComp(ListFriend, props);
                }} />
                <Route exact path="/suggest" render={(props) => {
                    return this.privateComp(SuggestFriendPage, props);
                }} />
                <Route exact path="/request" render={(props) => {
                    return this.privateComp(Friend, props);
                }} />
                <Route path="/conversation" render={(props) => {
                    return this.privateComp(Conversation, props);
                }} />
                <Route path="/post/:id" component={PostDetailContainer} />

                <Route exact path="/create" render={(props) => {
                    return this.privateComp(Create, props);
                }} />
                <Route exact path="/page" render={(props) => {
                    // return this.privateComp(PageContainer, props);
                    return <PageContainer />;
                }} />
                <Route exact path="/pagesuggest" render={(props) => {
                    return this.privateComp(PageSuggest, props);
                }} />
                <Route exact path="/pagesuggestcategory" render={(props) => {
                    return this.privateComp(PageSuggestCategory, props);
                }} />
                <Route exact path="/pagepreview/:id" render={(props) => {
                    return this.privateComp(PagePreview, props);
                }} />
                <Route exact path="/dieukhoansudung" component={Term} />
                <Route exact path="/chinhsachbaomat" component={Policy} />
                <Route exact path="/search/:q" component={Search} />
                <Route exact path="/createpage" component={CreatePage} />
                <Route exact path="/:id" component={ProfileContainer} />
                <Route exact path="/:alias/post/:id" component={PostDetailContainer} />
                <Route exact path="/404/notfound" component={NotFound} />
            </Switch>
        </React.Fragment>
    }
}
const mapStateToProps = (state) => {
    return { bodyClasses: state.bodyClasses, user: state.user }
}
export default connect(mapStateToProps)(MobileContainer);