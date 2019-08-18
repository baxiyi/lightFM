import AV from './avInit';

export default {
  //注册
  regist(userInfo) {
    let user = new AV.User();
    user.setUsername(userInfo.username);
    user.setPassword(userInfo.password);
    return user.signUp();
  },

  //登录
  login(userInfo) {
    return AV.User.logIn(userInfo.username, userInfo.password);
  },

  //登出
  logout(){
    return AV.User.logOut();
  },

  //获取当前用户信息
  getCurrentUser() {
    return AV.User.current();
  },

  //判断是否处于登录状态
  checkIsLogin() {
    const currentUser = this.getCurrentUser();
    return currentUser ? true : false;
  },

  checkIsSuperUser() {
    return false;
  }

}