import {SONG_CHANGE} from '../types/index';

const initState = {
  songList: [],
  activeIndex: 0,
  qualitySongList: [],
  customiseSongList: [],
  collectSongList: [],
  isPlay: false,
}

export default function(state = initState, action){
  switch(action.type){
    case SONG_CHANGE:
      return {
        ...Object.assign(initState, action.songs),
      };
    default:
      return state;
  }
}