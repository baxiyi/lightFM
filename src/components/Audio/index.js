import React, { PureComponent } from "react";
import {connect} from "react-redux";
import store from "../../store/index";
import {SONG_CHANGE} from "../../store/types";

class Audio extends PureComponent {
    onAudioEnded() {
        let {activeIndex, songList} = this.props.songs;
        activeIndex = activeIndex === songList.length - 1 ? 0 : activeIndex + 1;
        store.dispatch({
            type: SONG_CHANGE,
            songs: {
                activeIndex
            }
        })
    }

    render() {
        const {activeIndex, songList, isPlay} = this.props.songs;
        if(isPlay){
            setTimeout(() => {
                this.audio && this.audio.play();
            }, 0);
        } else {
            setTimeout(() => {
                this.audio && this.audio.pause();
            }, 0);
        }
        return (
            <div>
                <audio 
                    ref={(audio) => {this.audio = audio;}}
                    src={songList && songList[activeIndex] && songList[activeIndex].music}
                    onEnded={this.onAudioEnded.bind(this)} 
                />
            </div>
        )

    }
}


const mapStateToProps = (store) => {
    return {
        songs: store.songs
    }
};

Audio = connect(mapStateToProps)(Audio);

export default Audio
