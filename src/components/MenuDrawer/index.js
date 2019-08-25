import React, { PureComponent } from 'react';
import {withStyles} from '@material-ui/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {connect} from 'react-redux';
import {DRAWER_CHANGE, SNACKBAR_CHANGE, SONG_CHANGE, USER_CHANGE} from '../../store/types';
import store from '../../store/index';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Services from '../../services/index';
import {withRouter, Link} from 'react-router-dom';
import styles from './index.less';

const drawerStyle = {
  list :{
    width: 250,
  },
  fullList: {
    width: 'auto',
  }
};

class MenuDrawer extends PureComponent{
  state = {
    left: this.props.drawer.left,
    open: true,
  }

  toggleDrawer = (open) => () => {
    store.dispatch({
      type: DRAWER_CHANGE,
      drawer: {
        left: open,
      }
    });
  }

  toggleChannelItem = (e) => {
    e.stopPropagation();
    this.setState({
      open: !this.state.open,
    })
  }

  logout() {
    const {isPlay} = this.props.songs;
    if (isPlay) {
      store.dispatch({
        type: SONG_CHANGE,
        songs: {
          songList: [],
          activeIndex: 0,
          qualitySongList: [],
          customiseSongList: [],
          collectSongList: [],
          isPlay: false,
        }
      });
    }
    Services.userServices.logout()
      .then(res => {
        store.dispatch({
          type: USER_CHANGE,
          users: {
            userId: '',
          }
        });
        this.props.history.push('/login');
        store.dispatch({
          type: SNACKBAR_CHANGE,
          users: {
            open: true,
            msg: '登出成功',
            seconds: 2000,
          }
        })
      })
  }

  showSnackbar(info){
    store.dispatch({
      type: SNACKBAR_CHANGE,
      snackbar: {
        open: true,
        msg: `当前${info.channelName}共${info.activeChannelTotal}首歌`,
      }
    })
  }

  changeChannel(index) {
    let {qualitySongList, customiseSongList, collectSongList} = this.props.songs;
    const mapper = {
      0: {
        path: '/index/quality',
        channelName: '精选FMHz',
        activeChannelTotal: qualitySongList.length,
        action: function() {
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: qualitySongList,
              activeIndex: 0,
            }
          })
        }
      },
      1: {
        path: '/index/customise',
        channelName: '私人FMHz',
        activeChannelTotal: customiseSongList.length,
        action: function() {
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: customiseSongList,
              activeIndex: 0,
            }
          })
        }
      },
      2: {
        path: '/index/collect',
        channelName: '红心FMHz',
        activeChannelTotal: collectSongList.length,
        action: function() {
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: collectSongList,
              activeIndex: 0,
            }
          })
        }
      },
    }
    this.props.history.push(mapper[index].path);
    mapper[index].action();
    this.showSnackbar(mapper[index]);
  }

  openSettings() {
    store.dispatch({
      type: SNACKBAR_CHANGE,
      snackbar: {
        open: true,
        msg: '功能开发中',
      }
    })
  }

  render() {
    const {left} = this.props.drawer;
    const sideList = (
      <div>
        <List component="nav">
          <ListItem button onClick={this.toggleChannelItem}>
            <span className={`iconfont icon-radio ${styles.icon}`}></span>
            <ListItemText primary="频道" />
            {this.state.open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={this.changeChannel.bind(this, 0)}>
                <ListItemText inset primary="精选Hz"></ListItemText>
              </ListItem>
              <ListItem button onClick={this.changeChannel.bind(this, 1)}>
                <ListItemText inset primary="定制Hz"></ListItemText>
              </ListItem>
              <ListItem button onClick={this.changeChannel.bind(this, 2)}>
                <ListItemText inset primary="红心Hz"></ListItemText>
              </ListItem>
            </List>
          </Collapse>
          <Link to="/dislike" className={styles.link}>
            <ListItem button>
              <span className={`iconfont icon-virus ${styles.icon}`}></span>
              <ListItemText primary="隔离区"></ListItemText>
            </ListItem>
          </Link>
          <Link to="/guide" className={styles.link}>
            <ListItem button>
              <span className={`iconfont icon-customise ${styles.icon}`}></span>
              <ListItemText primary="定制标签"/>
            </ListItem>
          </Link>
          <Link to="/search" className={styles.link}>
            <ListItem button>
              <span className={`iconfont icon-search ${styles.icon}`}></span>
              <ListItemText primary="搜索"/>
            </ListItem>
          </Link>
          <ListItem button onClick={this.openSettings.bind(this)}>
            <span className={`iconfont icon-setting ${styles.icon}`}></span>
            <ListItemText primary="设置"/>
          </ListItem>
          <ListItem button onClick={this.logout.bind(this)}>
            <span className={`iconfont icon-logout ${styles.icon}`}></span>
            <ListItemText primary="登出"/>
          </ListItem>
        </List>
      </div>
    )
    return (
      <div>
        <Drawer open={left} onClose={this.toggleDrawer(false)}>
          <div 
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
            {sideList}
          </div>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    drawer: store.drawer,
    songs: store.songs,
  }
}

MenuDrawer = withStyles(drawerStyle)(MenuDrawer);
MenuDrawer = withRouter(MenuDrawer);

export default connect(mapStateToProps)(MenuDrawer);