import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Services from '../../services/index';
import {List, ListItem, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import store from '../../store/index';
import {SNACKBAR_CHANGE} from '../../store/types/index';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import styles from './index.less';

//这里不能用PureComponent，因为涉及到数组内部变化，PureComponent的浅层变化比较不出来
class Guide extends Component{
  constructor(props){
    super(props);
    this.state = {
      catgList: [],
    };
  }

  async fetchSongCatgByUserId(userId) {
    let arr = await Services.songServices.fetchSongCatgByUserId(userId);
    let arrIds = arr.map(item => item.catgId);
    Services.songServices.fetchSongCatg().then(res => {
      this.setState({
        catgList: res.map(obj => {
          return {
            ...obj,
            isSelect: arrIds.indexOf(obj.id) !== -1 ? true : false,
          }
        })
      })
    })
  }

  componentDidMount() {
    const {userId} = this.props.users;
    this.fetchSongCatgByUserId(userId);
  }

  onTagSelectChange(value) {
    let arr = this.state.catgList;
    arr[value].isSelect = !arr[value].isSelect;
    this.setState({
      catgList: arr,
    });
  }

  customiseFM() {
    const currentUser = Services.userServices.getCurrentUser();
    const userId = currentUser && currentUser.id;
    const catgArr = this.state.catgList.filter(catg => {
      return catg.isSelect;
    });
    if(!catgArr.length){
      store.dispatch({
        type :SNACKBAR_CHANGE,
        snackbar: {
          open: true,
          msg: '请至少选择一个标签',
        }
      });
      return;
    }
    if(!userId) {
      store.dispatch({
        type :SNACKBAR_CHANGE,
        snackbar: {
          open: true,
          msg: '登录超时!',
        }
      });
      return;
    }
    Services.songServices.addUserCatgRelations(catgArr, userId)
      .then(res => {
        if(res.length) {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar :{
              open: true,
              msg: '定制私人FM成功',
            }
          });
          this.props.history.push('/index/customise');
        } else {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar :{
              open: true,
              msg: '定制失败',
            }
          });
        }
      })
  }

  enterFM() {
    const currentUser = Services.userServices.getCurrentUser();
    const userId = currentUser && currentUser.id;
    const catgArr = this.state.catgList.filter(catg => {
      return catg.isSelect;
    });
    if(catgArr.length) {
      Services.songServices.addUserCatgRelations(catgArr, userId);
    }
    this.props.history.push('/index/quality');
  }

  render() {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>您的喜好是什么呢？</h3>
        <div className={styles.list}>
          <List>
            {this.state.catgList.map((item, index) => (
              <ListItem
                key={index}
                dense
                button
                onClick={this.onTagSelectChange.bind(this, index)}
              >
                <Checkbox
                  checked={item.isSelect}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={item.name} />
                <ListItemSecondaryAction>
                  <span className={`iconfont icon-tag ${styles.icon}`}></span>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
        <div className="f-tc f-mgt30">
          <Button style={{marginRight: '10px'}} variant="contained" color="primary"
            onClick={this.customiseFM.bind(this)}
          >
            进入FM
          </Button>
          <Button variant="contained" color="secondary" 
            onClick={this.enterFM.bind(this)}
          >
            随便听听
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (store) => {
  return {
    users: store.users,
  }
}

Guide = withRouter(Guide);

export default connect(mapStateToProps)(Guide);