import axios from 'axios';
import AV from './avInit';
import {MUSIC_PROVIDER_HOST} from './config';
import shuffle from '../utils/shuffle'



export default {
    
    //搜索音乐：调用网易云音乐api
    async search(userId, query, type, limit){
        let userCollectSongsId = await this.fetchCollectSongs(userId).then(res => {
            return res.map(obj => obj.songId);
        })
        let params = new URLSearchParams();
        params.append("s", query);
        params.append("type", type);
        params.append("limit", limit || 40);
        return axios({
            method: "post",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
            url: `${MUSIC_PROVIDER_HOST}/search/pc`,
            data: params
        }).then(res => {
            const code = res.data.code;
            let songs = [];
            if(code === 200){
                songs = res.data.result.songs;
                songs = songs.map(obj => {
                    return {
                        ...obj,
                        isCollect: userCollectSongsId.indexOf(obj.id) !== -1
                    }
                });
                return songs;
            }
            else{
                return [];
            }
        })

    },

    //获取歌曲类别列表
    fetchSongCatg(){
        let query = new AV.Query("Category");
        return query.find().then(res => {
            return res.map(obj => {
                return {
                    ...obj.attributes,
                    id: obj.id
                }
            })
        })
    },

    //获取用户定制标签
    fetchSongCatgByUserId(userId){
        let query = new AV.Query("Rel_user_category");
        query.equalTo("userId",userId);
        return query.find().then(res => {
            return res.map(obj => {
                return {
                    ...obj.attributes,
                    id: obj.id
                }
            })
        })
    },

    //根据songid查询歌曲
    findSongBySongid(songid){
        let query = new AV.Query("Song");
        query.equalTo("songid",songid);
        return query.find();
    },

    //根据songid数组查询歌曲
    findSongBySongidArr(songidArr){
        let songidQuery = songidArr.map(songid => {
            let temp = new AV.Query("Song");
            temp.equalTo("songid",songid);
            return temp;
        });
        let query = AV.Query.or(...songidQuery);
        return query.find();
    },

    //删除用户定制歌曲类别
    deleteUserCatgRelations(userId){
        let query = new AV.Query("Rel_user_category");
        query.equalTo("userId",userId);
        return query.find().then(res => {
            if(res){
                AV.Object.destroyAll(res);
            }
        })
    },

    //添加用户定制歌曲类别
    async addUserCatgRelations(catgArr, userId){
        await this.deleteUserCatgRelations(userId);
        let promises = catgArr.map(catg => {
            return new Promise((resolve, reject) => {
                let RelUserCatg = AV.Object.extend("Rel_user_category");
                let relUserCatg = new RelUserCatg();
                relUserCatg.set("userId",userId);
                relUserCatg.set("catgId",catg.id);
                relUserCatg.save().then(res => {
                    if(res.id){
                        resolve(res);
                    }
                    else{
                        reject();
                    }
                }).catch(err => {
                    reject();
                })
            })
            
        });
        return Promise.all(promises);
    },

    //获取用户喜欢歌曲id列表
    fetchCollectSongsId(userId){
        let query = new AV.Query("Rel_user_collect");
        query.equalTo("userId",userId);
        return query.find().then(res => {
            return res.map(obj => obj.attributes.songId);
        })
    },

    //获取用户不喜欢的歌曲id列表
    fetchDislikeSongId(userId){
        let query = new AV.Query("Rel_user_song_dislike");
        query.equalTo("userId",userId);
        return query.find().then(res => {
            return res.map(obj => obj.attributes.songId);
        })
    },

    //根据歌曲类别获取歌曲id列表
    fetchSongsIdByCatgId(catgIdArr){
        let queryArr = catgIdArr.map(catgId => {
            let temp = new AV.Query("Rel_category_song");
            temp.equalTo("catgId",catgId);
            return temp;
        });
        let query = AV.Query.or(...queryArr);
        return query.find().then(res => {
            return res.map(obj => obj.attributes.songId);
        })
    },

    //将歌曲移入用户黑名单
    dislikeSong(userId,songObjId){
        let Rel_user_song_dislike = AV.Object.extend("Rel_user_song_dislike");
        let rel_user_song_dislike = new Rel_user_song_dislike();
        rel_user_song_dislike.set("userId",userId);
        rel_user_song_dislike.set("songId",songObjId);
        return rel_user_song_dislike.save();
    },

    //将若干歌曲移除用户黑名单
    undoDislikeSong(userId,songObjIdArr){
        let queryArr = songObjIdArr.map(songObjId => {
            let temp = new AV.Query("Rel_user_song_dislike");
            temp.equalTo("userId",userId);
            temp.equalTo("songId",songObjId);
            return temp;
        });
        let query = AV.Query.or(...queryArr);
        return query.find().then(res => {
            return AV.Object.destroyAll(res);
        })
    },

    //用户收藏或取消收藏歌曲
    collectSong(userId, songObjId){
        let query = new AV.Query("Rel_user_collect");
        query.equalTo("userId",userId);
        query.equalTo("songId",songObjId);
        return query.find().then(async res => {
            if(res.length){
                //取消收藏
                let collectSong = AV.Object.createWithoutData("Rel_user_collect",res[0].id);
                await collectSong.destroy();
                return {
                    id: res[0].id,
                    isCollect: false
                }
            }
            else{
                //收藏
                let Rel_user_collect = AV.Object.extend("Rel_user_collect");
                let rel_user_collect = new Rel_user_collect();
                rel_user_collect.set("userId",userId);
                rel_user_collect.set("songId",songObjId);
                await rel_user_collect.save();
                return {
                    id: userId,
                    isCollect: true
                }
            }
        })
    },

    //获取精选歌曲列表: 除去用户不喜欢的歌曲，再用shuffle函数随机打乱
    async fetchQualitySongs(userId){
        let dislikesongIdArr = await this.fetchDislikeSongId(userId);
        let userCollectSongsId = await this.fetchCollectSongsId(userId);
        let query = new AV.Query("Song");
        query.equalTo("public", 1);
        query.equalTo("quality", 1);
        query.limit(500);
        return query.find().then(res => {
            res = res.map(obj => {
                return {
                    ...obj.attributes,
                    id: obj.id,
                    isCollect: userCollectSongsId.indexOf(obj.id) !== -1
                }
            });
            res = res.filter(obj => {
                return dislikesongIdArr.indexOf(obj.id) === -1;
            });
            return shuffle(res);
        });
    },

    //获取用户定制的歌曲列表
    async fetchCustomiseSongs(userId){
        let query = new AV.Query("Rel_user_category");
        query.equalTo("userId",userId);
        let catgIdArr = await query.find().then(res => {
            return res.map(obj => obj.attributes.catgId);
        });
        let dislikesongIdArr = await this.fetchDislikeSongId(userId);
        let userCollectSongsId = await this.fetchCollectSongsId(userId);
        if(catgIdArr.length){
            let songIdArr = await this.fetchSongsIdByCatgId(catgIdArr);
            if(!songIdArr.length)
                return [];
            let songQueryArr = songIdArr.map(songId => {
                let temp = new AV.Query("Song");
                temp.equalTo("objectId", songId);
                return temp;
            })
            let query = AV.Query.or(...songQueryArr);
            query.limit(500);
            return query.find().then(res => {
                res = res.map(obj => {
                    return {
                        ...obj.attributes,
                        id: obj.id,
                        isCollect: userCollectSongsId.indexOf(obj.id) !== -1
                    }
                });
                res = res.filter(obj => {
                    return dislikesongIdArr.indexOf(obj.id) === -1;
                });
                return shuffle(res);
            })
        }
        else
            return [];
    },

    //获取用户收藏歌曲列表
    async fetchCollectSongs(userId, disableShuffle = false){
        let userCollectSongsId = await this.fetchCollectSongsId(userId);
        if(!userCollectSongsId.length)
            return [];
        let songQuery = userCollectSongsId.map(songId => {
            let temp = new AV.Query("Song");
            temp.equalTo("objectId", songId);
            return temp;
        });
        let query = AV.Query.or(...songQuery);
        query.limit(500);
        return query.find().then(res => {
            res = res.map(obj => {
                return {
                    ...obj.attributes,
                    id: obj.id,
                    isCollect: true
                }
            });
            if(disableShuffle)
                return res;
            else
                return shuffle(res);
        });
        
    },

    //获取用户不喜欢的列表
    async fetchDislikeSongs(userId){
        let dislikesongIdArr = await this.fetchDislikeSongId(userId);
        if(dislikesongIdArr.length){
            let songQuery = dislikesongIdArr.map(songId => {
                let temp = new AV.Query("Song");
                temp.equalTo("objectId", songId);
                return temp;
            });
            let query = AV.Query.or(...songQuery);
            query.limit(500);
            return query.find().then(res => {
                res = res.map(obj => {
                    return {
                        ...obj.attributes,
                        id: obj.id
                    }
                });
                return res;
            })
        }else{
            return [];
        }
    }

    


}