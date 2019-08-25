import React, {PureComponent} from 'react';
import Services from '../../services/index';
import {connect} from 'react-redux';
import store from '../../store/index';
import {DRAWER_CHANGE, SNACKBAR_CHANGE, SONG_CHANGE} from '../../store/types/index';
import styles from './index.less';

class Index extends PureComponent{
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.songs,
    }
  }

  async fetchCustomiseSongs() {
    const {userId} = this.props.users;
    return Services.songServices.fetchCustomiseSongs(userId);
  }

  async fetchQualitySongs() {
    const {userId} = this.props.users;
    return Services.songServices.fetchQualitySongs(userId)
  }

  async fetchCollectSongs() {
    const {userId} = this.props.users;
    return Services.songServices.fetchCollectSongs(userId);
  }

  async fetchSongList() {
    const {songList} = this.props.songs;
    const fmType = this.props.match && this.props.match.params.fmType;
    let qualitySongList = [];
    let customiseSongList = [];
    let collectSongList = [];
    let activeChannelTotal = 0;
    let channelName = '';

    if(!songList.length) {
      qualitySongList = await this.fetchQualitySongs();
      customiseSongList = await this.fetchCustomiseSongs();
      collectSongList = await this.fetchCollectSongs();
      switch (fmType) {
        case 'quality':
          activeChannelTotal = qualitySongList.length;
          channelName = '精选FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: qualitySongList,
            }
          });
          break;
        case 'customise':
          activeChannelTotal = customiseSongList.length;
          channelName = '私人FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: customiseSongList,
            }
          });
          break;
        case 'collect':
          activeChannelTotal = collectSongList.length;
          channelName = '红心FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: collectSongList,
            }
          });
          break;
        default:
          activeChannelTotal = qualitySongList.length;
          channelName = '精选FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: qualitySongList,
            }
          })
          break;
      }
      store.dispatch({
        type: SONG_CHANGE,
        songs: {
          qualitySongList,
          customiseSongList,
          collectSongList,
        }
      })
    } else {
      collectSongList = await this.fetchCollectSongs();
      switch (fmType) {
        case 'quality':
          qualitySongList = await this.fetchQualitySongs();
          activeChannelTotal = qualitySongList.length;
          channelName = '精选FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              qualitySongList,
              collectSongList,
            }
          });
          break;
        case 'customise':
          customiseSongList = await this.fetchCustomiseSongs();
          activeChannelTotal = customiseSongList.length;
          channelName = '私人FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              customiseSongList,
              collectSongList,
            }
          });
          break;
        case 'collect':
          activeChannelTotal = collectSongList.length;
          channelName = '红心FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: collectSongList,
              collectSongList,
            }
          });
          break;
        default:
          qualitySongList = await this.fetchQualitySongs();
          activeChannelTotal = qualitySongList.length;
          channelName = '精选FMHz';
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              qualitySongList,
              collectSongList,
            }
          });
          break;
      }
    }
    setTimeout(() => {
      store.dispatch({
        type: SNACKBAR_CHANGE,
        snackbar: {
          open: true,
          msg: `当前${channelName}共${activeChannelTotal}首歌`
        }
      })
    }, 0);
  }

  componentDidMount() {
    this.fetchSongList();
  }

  getInitState() {
    return {};
  }

  toggleMenu() {
    this.setState({
      menuState: Object.assign({}, this.state.menuState, {
        isShow: !this.state.menuState,
      })
    })
  }

  openMenu() {
    store.dispatch({
      type: DRAWER_CHANGE,
      drawer: {
        left: true,
      }
    })
  }

  togglePlay() {
    const {isPlay} = this.props.songs;
    store.dispatch({
      type: SONG_CHANGE,
      songs: {
        isPlay: !isPlay,
      }
    })
  }

  onPlayNext() {
    let {activeIndex, songList} = this.props.songs;
    activeIndex = activeIndex === songList.length - 1 ? 0 : activeIndex + 1;
    store.dispatch({
      type: SONG_CHANGE,
      songs: {
        activeIndex,
      }
    })
  }

  onDislikeSong() {
    const {userId} = this.props.users;
    const {activeIndex, songList} = this.props.songs;
    const {name} = songList && songList[activeIndex];
    const songId = songList && songList[activeIndex].id;
    Services.songServices.dislikeSong(userId, songId)
      .then(res => {
        if (res.id) {
          songList.splice(activeIndex, 1);
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
              open: true,
              msg: `"${name}"有毒，已加入隔离区`,
            }
          });
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: songList,
              activeIndex: activeIndex === songList.length - 1 ? 0 : (activeIndex + 1),
            }
          });
        }
      }).catch(err => {
        console.log(err);
      })
  }

  onToggleCollect() {
    const {userId} = this.props.users;
    let {activeIndex, songList, collectSongList} = this.props.songs;
    const songId = songList[activeIndex].id;
    Services.songServices.collectSong(userId, songId)
      .then(async res => {
        songList[activeIndex].isCollect = !songList[activeIndex].isCollect;
        if(res.isCollect) {
          collectSongList.unshift(res);
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: songList,
              collectSongList: collectSongList,
            }
          });
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
              open: true,
              msg: '收藏成功',
            }
          });
        } else {
          collectSongList = await Services.songServices.fetchCollectSongs(userId, true);
          store.dispatch({
            type: SONG_CHANGE,
            songs: {
              songList: songList,
              collectSongList: collectSongList,
            }
          });
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
              open: true,
              msg: '取消收藏成功',
            }
          });
        }
      });
  }

  render() {
    const {songList, activeIndex} = this.props.songs;
    const name = songList && songList[activeIndex] && songList[activeIndex].name;
    const author = songList && songList[activeIndex] && songList[activeIndex].author;
    const pic = songList && songList[activeIndex] && songList[activeIndex].pic;
    const isCollect = songList && songList[activeIndex] && songList[activeIndex].isCollect;
    const {isPlay} = this.props.songs;
    return (
      <div className={styles.container}>
        <section className={styles.menuBox}>
          <span className={`iconfont icon-menu ${styles.icon}`} onClick={this.openMenu.bind(this)}></span>
        </section>
        <div className={styles.bg} style={{backgroundImage: `url(${pic})`}}></div>
        <div className={styles.cover}></div>
        <section className={styles.contentWrap}>
          <section className={styles.content}>
            <span className={styles.songPic}>
              <span className={isPlay ? `${styles.pic} ${styles.zRotate}`: `${styles.pic}`}
                style={{backgroundImage: `url(${pic})`}}
              ></span>
              <span className={styles.control}>
                <span className={isPlay ? `iconfont icon-pause ${styles.icon}` : `iconfont icon-play ${styles.icon}`}
                  onClick={this.togglePlay.bind(this)}
                ></span>
              </span>
            </span>
            <div>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.author}>{author}</p>
            </div>
            <div className={styles.controlBox}>
              <div className={styles.panelBox}>
                <div className={styles.item} onClick={this.onDislikeSong.bind(this)}>
                  <span className={`iconfont icon-trash ${styles.icon}`}></span>
                </div>
                <div className={styles.item} onClick={this.onToggleCollect.bind(this)}>
                  <span className={isCollect ? `iconfont icon-love ${styles.icon} ${styles.iconLoveActive}`: `iconfont icon-love ${styles.icon}`}></span>
                </div>
                <div className={styles.item} onClick={this.onPlayNext.bind(this)}>
                  <span className={`iconfont icon-next ${styles.icon}`}></span>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    snackbar: store.snackbar,
    songs: store.songs,
    users: store.users,
  }
}

export default connect(mapStateToProps)(Index);