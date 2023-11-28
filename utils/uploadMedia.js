
const uploadMedia = (req, name) => {
  let file = null;
  if (req.files[name] && req.files[name][0].filename) {
    file = req.files[name][0].filename;
  }

  return file;
}

const uploadMultiMedia = (req, name) => {
  let files = [];

  if (req.files[name] && req.files[name].length > 0) {
    for (let i = 0; i < req.files[name].length; i++) {
      files.push(req.files[name][i].filename);
    }
  }

  return files;
}

const updateUploadMedia = (req, name, editName) => {
  let file = null;

  if (req.files[name] && req.files[name][0].filename) {
    file = req.files[name][0].filename;
  } else if (req.body[editName]) {
    file = req.body[editName]
  }

  return file;
}

const updateMultiMedia = (req, name, editName) => {
  let files = [];

  if (req.files[name]?.length > 0) {
    const reqFiles = req.files[name];
    for (let i = 0; i < reqFiles.length; i++) {
      if (reqFiles[i][0].filename) {
        files.push(reqFiles[i][0].filename)
      } else {
        if (req.body[editName][i]) {
          files.push(req.body[editName][i])
        }
      }
    }
  }

  return files;
}

module.exports = {
  uploadMedia,
  uploadMultiMedia,
  updateUploadMedia,
  updateMultiMedia
}