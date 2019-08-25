import React, {PureComponent} from 'react';
import {ListItem, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux';
import Services from '../../services/index';
import {SNACKBAR_CHANGE} from '../../store/types';
import store from '../../store';
import styles from './index.less';

class Dislike extends PureComponent{
  state = {
    checkedIds: [],
    dislikeList: [],
  }

  handleToggle = id => () => {
    const {checkedIds} = this.state;
    const currentIndex = checkedIds.indexOf(id);
    const newChecked = [...checkedIds];
    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    this.setState({
      checkedIds: newChecked,
    })
  }

  fetchDislikeSongs() {
    const {userId} = this.props.users;
    Services.songServices.fetchDislikeSongs(userId)
      .then(res => {
        this.setState({
          dislikeList: res,
        })
      })
  }

  componentDidMount() {
    this.fetchDislikeSongs();
  }

  reshowDislikeSongs() {
    const {userId} = this.props.users;
    const {checkedIds} = this.state;
    Services.songServices.undoDislikeSong(userId, checkedIds)
      .then(async res => {
        await this.fetchDislikeSongs();
        store.dispatch({
          type: SNACKBAR_CHANGE,
          snackbar: {
            open: true,
            msg: '已成功将它们移出隔离区'
          }
        })
      })
  }

  render() {
    return (
      <div className={styles.container}>
        {this.state.dislikeList.length
        ? <section>
          <h4 className={styles.title}>拯救曾经被你隔离的它们</h4>
          {this.state.dislikeList.map((item) => (
            <section key={item.id}>
              <ListItem dense button>
                <Avatar style={{marginRight: '10px'}} alt="avatar" src={item.pic} />
                <div>
                  <div>
                    <ListItemText primary={item.name} />
                  </div>
                  <div>
                    <ListItemText primary={item.author}></ListItemText>
                  </div>
                </div>
                <ListItemSecondaryAction>
                  <Checkbox
                    onChange={this.handleToggle(item.id)}
                    checked={this.state.checkedIds.indexOf(item.id) !== -1}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </section>
          ))}
          <section className={styles.btnBox}>
            <Button variant="contained" color="primary" onClick={this.reshowDislikeSongs.bind(this)}>
              治愈
            </Button>
          </section>
        </section>
        : <h4 className={styles.title}>隔离区空空如也...</h4>
        }
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    users: store.users,
  }
}

export default connect(mapStateToProps)(Dislike);