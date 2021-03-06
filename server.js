/** 

 ** used to scrape food.com list of ingredients **/

'use strict';

const http = require('http');
const cheerio = require('cheerio');
const path = require('path');
const url = require('url');
var fs = require('fs');
var index = 1;
var chunk = '';
var arr = [];
   
  function up(index) { 
  chunk = '';
  http.get('http://www.food.com/services/mobile/fdc/search/sectionfront?pn='+index+'&searchTerm=&recordType=Ingredient', (res) => {
      
    res.on('data',(d) => {
      chunk += d;
    });
      
    res.on('end', () => {
      handleRes(chunk,function() {
        checkDone(function(index) {
          if (index === 100) {
            arr = arr.join('\n');
            fs.writeFile('./speechAssets/customSlotTypes/LIST_OF_INGREDIENTS', arr, function(e) {
              if (e) {
                throw e;
              }
              console.log('done');
            });
          } else {
            up(index);
          } 
        });
      });
    });  
  }).on('error',(e)=> {
    console.log('error',e);
  });
}

function handleRes(data,cb) {
  data = JSON.parse(data);  
  for (var i = 0; i < data.response.results.length; i++) {
        arr.push(data.response.results[i].title);
  }

  cb(); 
}
 
function checkDone(cb) {
  return cb(index+=1);
}

/*call function */
up(index);
