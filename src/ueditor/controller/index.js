const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Base = require('./base.js');
const rename = think.promisify(fs.rename, fs);
const writeFile = think.promisify(fs.writeFile,fs);

const ueditorConfig = require('../config/ueditor.config.js');//
const UPLOAD_BASE_PATH = path.join(think.ROOT_PATH,'www/static/upload');
const UPLOAD_BASE_URL = '/static/upload/';

module.exports = class extends Base {
  async indexAction() {
    let action = this.get('action');
    if(action==='config'){
      this.json(ueditorConfig);
    }else if(action==='uploadimage'){
      const file = this.file(ueditorConfig.imageFieldName);
      if(file){
        const exts = ueditorConfig.imageAllowFiles;
        const fileExt = path.extname(file.name);
        if(exts.indexOf(fileExt)>=0){
          const maxSize = ueditorConfig.imageMaxSize;
          if(file.size<=maxSize){
              const fileName = moment().format('YYYYMMDDHHmmssx') + parseInt(Math.random()*100000000000000000) + fileExt;
              const filePath = path.join(UPLOAD_BASE_PATH,'images/'+fileName);
              think.mkdir(path.dirname(filePath));
              await rename(file.path, filePath);
              this.json({
                state:'SUCCESS',
                url:UPLOAD_BASE_URL+'images/'+fileName,
                title:fileName,
                original:file.name,
                size:file.size
              })
          }else{
            this.json({state:'文件太大，最大不能超过：'+maxSize/1024+'KB'});
          }
        }else{
          this.json({state:'文件格式错误，允许上传的格式有：'+exts.join('|')})
        }
      }else{
        this.json({state:'文件不存在'});
      }
    }else if(action==='uploadscrawl'){
      let data = this.post(ueditorConfig.scrawlFieldName);
      let buf = new Buffer(data,'base64');
      let maxSize = ueditorConfig.scrawlMaxSize;
      if(buf.length<=maxSize){
        const fileName = moment().format('YYYYMMDDHHmmssx') + parseInt(Math.random()*100000000000000000) + '.png';
        const filePath = path.join(UPLOAD_BASE_PATH,'images/'+fileName);
        await writeFile(filePath,buf);
        this.json({
          state:'SUCCESS',
          url:UPLOAD_BASE_URL+'images/'+fileName,
          title:fileName,
          original:fileName,
          size:buf.length
        });
      }else{
        this.json({state:'文件太大，最大不能超过：'+maxSize/1024+'KB'});
      }
    }else{
      this.json({});
    }
  }
};
