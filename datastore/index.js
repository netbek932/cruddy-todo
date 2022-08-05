const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const sprintf = require('sprintf-js').sprintf;

var items = {};
const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw ('Could not create file');
    } else {
      var dirPath = path.join(exports.dataDir, id + '.txt');
      fs.writeFile(dirPath, text, (err) => {
        if (err) {
          throw err;
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, function (err, items) {
    if (err) {
      throw ('Unable to scan directory: ' + err);
    }
    var data = _.map(items, (id) => {
      id = zeroPaddedNumber(id.slice(0, -4));
      return { id: id, text: id };
    });

    callback(null, data);
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err, text) => {
    if (!text || err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), 'utf8', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          callback(new Error(`Could not update item with id: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
