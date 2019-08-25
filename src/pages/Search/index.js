import React, {PureComponent} from 'react';
import Services from '../../services';
import {List, ListItem, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import store from '../../store';
import {SNACKBAR_CHANGE} from '../../store/types';
import {connect} from 'react-redux';
import styles from './index.less';

class Search extends PureComponent{
  constructor(props) {
    super(props);
    this.state = {
      searchTxt: '',
      list: [],
      searchType: 1,
    }
  }

  async getWithCollectList(list) {
    const {userId} = this.props.users;
    const collectSongs = await Services.songServices.fetchCollectSongs(userId, true);
    console.log(collectSongs);
    const collectSongids = collectSongs.map(song => song.songid);
    list = list.map(song => {
      const id = song.id;
      song.isCollect = collectSongids.indexOf(id) !== -1;
      return song;
    });
    return list;
  }

  searchSong() {
    if (!this.state.searchTxt.trimLeft()) {
      return;
    }
    const {userId} = this.props.users;
    const {searchTxt, searchType} = this.state;
    Services.songServices.search(userId, searchTxt, searchType)
      .then(async res => {
        if (res.length){
          const list = await this.getWithCollectList(res);
          this.setState({
            list,
          })
        }
      })
  }

  onSearchInput(e) {
    this.setState({
      searchTxt: e.target.value,
    });
  }

  collectSong(songIndex, e) {
    e.stopPropagation();
    e.preventDefault();
    const {userId} = this.props.users;
    const {list} = this.state;
    let songInfo = list[songIndex];
    songInfo.public = 2;
    songInfo.quality = 2;
    Services.songServices.addSong({
      ...songInfo,
    })
    .then(res => {
      if (res.id) {
        store.dispatch({
          type: SNACKBAR_CHANGE,
          snackbar: {
            open: true,
            msg: '添加歌曲成功',
          }
        });
      } else {
        store.dispatch({
          type: SNACKBAR_CHANGE,
          snackbar: {
            open: true,
            msg: '添加歌曲失败，请重试',
          }
        })
      }
      return res.id;
    })
    .then(id => {
      Services.songServices.collectSong(userId, id)
        .then(res => {
          list[songIndex].isCollect = !list[songIndex].isCollect;
          this.setState({
            list: list,
          });
          if (res.isCollect) {
            store.dispatch({
              type: SNACKBAR_CHANGE,
              snackbar: {
                open: true,
                msg: '收藏成功',
              }
            });
          } else {
            store.dispatch({
              type: SNACKBAR_CHANGE,
              snackbar: {
                open: true,
                msg: '取消收藏成功',
              }
            });
          }
        })
    })
    .catch(err => {
      store.dispath({
        type: SNACKBAR_CHANGE,
        snackbar: {
          open: true,
          msg: err.toString(),
        }
      })
    })
  }

  getAuthorName(artists) {
    if(artists.length < 1){
      return '';
    }
    if (artists.length > 2) {
      artists = artists.slice(0, 2);
    }
    const names = artists.map(artist => artist.name);
    return names.join(',');
  }

  render() {
    return (
      <div>
        <div className={styles.searchBox}>
          <div className={styles.inputWrap}>
            <TextField
              fullWidth
              id="name"
              label="输入歌名或歌手名字"
              onInput={this.onSearchInput.bind(this)}
              margin="normal"
            />
          </div>
          <div>
            <Button variant="contained" color="primary" onClick={this.searchSong.bind(this)}>
              搜索
            </Button>
          </div>
        </div>
        <div className={styles.cardWrap}>
          <List>
            {this.state.list.map((item, index) => (
              <section className={styles.listBox} key={index}>
                <ListItem dense button>
                  <Avatar style={{marginRight: '10px'}} alt="avatar" src={item.album.picUrl} />
                  <div>
                    <div>
                      <ListItemText primary={item.name}></ListItemText>
                    </div>
                    <div>
                      <ListItemText primary={this.getAuthorName(item.artists)}></ListItemText>
                    </div>
                  </div>
                  <ListItemSecondaryAction>
                    <span 
                      className={item.isCollect ? `iconfont icon-love ${styles.icon} ${styles.iconLoveActive}` : `iconfont icon-love ${styles.icon} ${styles.iconLoveNormal}`}
                      onClick={this.collectSong.bind(this, index)}
                      />
                    <a href={`https://music.163.com/song/media/outer/url?id=${item.id}.mp3`}>
                      <span className={`iconfont icon-download ${styles.icon} ${styles.download}`}></span>
                    </a>
                  </ListItemSecondaryAction>
                </ListItem>
              </section>
            ))}
          </List>
        </div>
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    snackbar: store.snackbar,
    users: store.users,
  }
}

export default connect(mapStateToProps)(Search);