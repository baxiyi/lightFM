import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import store from '../../store/index';
import {SNACKBAR_CHANGE, USER_CHANGE} from '../../store/types';
import Services from '../../services/index';
import {withRouter} from 'react-router';
import styles from './index.less';

class Login extends PureComponent{
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      open: false,
      vertical: null,
      horizontal: null,
    }
  }

  componentDidMount() {
    store.dispatch({
      type: SNACKBAR_CHANGE,
      snackbar: {
        open: true,
        msg: "Username:myFM Password:myFM",
        seconds: 5000,
      }
    });
  }

  validateInput() {
    const username = this.state.username.trim();
    const password = this.state.password.trim();
    if(!username.trim()){
      return {
        flag: false,
        msg: '请输入用户名',
      }
    }
    if(!password.trim()){
      return {
        flag: false,
        msg: '请输入密码',
      }
    }
    if(!/^[a-zA-Z0-9_]{4,8}$/.test(username)){
      return {
        flag: false,
        msg: "用户名必须为4到8位大小写字母，数字或_组成",
        seconds: 4000,
      }
    }
    if(!/^[a-zA-Z0-9_]{4,8}$/.test(password)){
      return {
        flag: false,
        msg: "密码必须为4到8位大小写字母，数字或_组成",
        seconds: 4000,
      }
    }
    return {flag: true};
  }

  login(){
    const checkResult = this.validateInput();
    if(!checkResult.flag){
      store.dispatch({
        type: SNACKBAR_CHANGE,
        snackbar:{
          open: true,
          msg: checkResult.msg,
          seconds: checkResult.seconds ? checkResult.seconds : 2000,
        }
      });
      console.log('cannot login');
      return;
    }
    Services.userServices.login({username: this.state.username, password: this.state.password})
      .then(res => {
        if(res.id) {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
              open: true,
              msg: '登录成功',
            }
          });
          store.dispatch({
            type: USER_CHANGE,
            users: {
              userId: res.id,
            }
          });
          this.props.history.push('/guide');
        } else {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
              open: true,
              msg: '登录失败',
            }
          })
        }
      }).catch(err => {
        console.log(err);
      })
  }

  regist() {
    const checkResult = this.validateInput();
    if(!checkResult.flag){
      store.dispatch({
        type: SNACKBAR_CHANGE,
        snackbar:{
          open: true,
          msg: checkResult.msg,
          seconds: checkResult.seconds ? checkResult.seconds : 2000,
        }
      });
      return;
    }
    Services.userServices.regist({
      username: this.state.username,
      password: this.state.password,
    })
      .then(res => {
        if(res.id) {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
                open: true,
                msg: "注册成功"
            }
          })
          store.dispatch({
            type: USER_CHANGE,
            users: {
                userId: res.id
            }
          })
          this.props.history.push("/guide");
        } else {
          store.dispatch({
            type: SNACKBAR_CHANGE,
            snackbar: {
                open: true,
                msg: "注册失败"
            }
          });
        }
      }).catch(err => {
        console.log(err);
      })
  }

  onUsernameChange(e) {
    this.setState({
      username: e.target.value,
    });
  }

  onPasswordChange(e) {
    this.setState({
      password: e.target.value,
    })
  }

  render(){
    return (
      <div className={styles.container}>
        <div className={styles.bgImg}></div>
        <div className={styles.cover}></div>
        <div className={styles.content}>
          <div className={styles.logoBox}>
            私人FM
          </div>
          <div className={styles.form}>
            <div>
              <Grid container spacing={8} alignItems="flex-end">
                <Grid item xs={2}>
                  <span className={`iconfont icon-user ${styles.icon}`}></span>
                </Grid>
                <Grid item xs={10}>
                  <TextField color="#fff" fullWidth id="inptut-with-icon-grid" label="用户名" required
                    onChange={this.onUsernameChange.bind(this)}
                  ></TextField>
                </Grid>
              </Grid>
            </div>
            <div style={{marginTop: '10px'}}>
              <Grid container spacing={8} alignItems="flex-end">
                <Grid item xs={2}>
                  <span className={`iconfont icon-password ${styles.icon}`}></span>
                </Grid>
                <Grid item xs={10}>
                  <TextField color="#fff" fullWidth type="password" id="input-with-icon-grid" required
                    label="密码" onChange={this.onPasswordChange.bind(this)}
                  ></TextField>
                </Grid>
              </Grid>
            </div>
            <div className={styles.btnBox}>
              <span className={styles.btn}>
                <Button variant="contained" color="primary" onClick={this.login.bind(this)}>
                  登录
                </Button>
              </span>
              <span className={styles.btn}>
                <Button variant="contained" color="secondary" onClick={this.regist.bind(this)}>
                    注册
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (store) => {
  return {
    snackbar: store.snackbar,
    users: store.users,
  }
}

Login = withRouter(Login);

export default connect(mapStateToProps)(Login);