import React, { PureComponent } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import store from '../../store/index';
import {connect} from 'react-redux'

class PositionedSnackbar extends PureComponent{
  constructor(props){
    super(props);
    this.state = {
      timer: null,
      seconds: this.props.snackbar.seconds,
    }
  }

  handleClose(){
    this.setState({
      open: false,
    });
  }

  render(){
    const {vertical, horizontal, open, msg, seconds} = this.props.snackbar;
    if(open && !this.state.timer){
      let timer = setTimeout(() => {
        store.dispatch({
          type: 'SNACKBAR_CHANGE',
          snackbar: {
            open: false,
            seconds: 2000,
          }
        });
        this.setState({
          timer: null,
        });
      }, seconds);
      this.setState({
        timer: timer,
      })
    }
    return(
      <div>
        <Snackbar
          anchorOrigin={{vertical, horizontal}}
          open={open}
          onClose={this.handleClose.bind(this)}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{msg}</span>}
        />
      </div>
    )
  }
}

const mapStateToProps = (store) => {
  return {
    snackbar: store.snackbar,
  }
}

export default connect(mapStateToProps)(PositionedSnackbar);