window.onload = function () {
  const form = document.querySelector('form');
  const addButton = document.getElementById('addButton');
  const parentList = document.getElementById('parentList');
  const fileContainer = document.getElementById('fileContainer');

  // ----- Event listeners -----
  addButton.addEventListener('click', addURL, false);
  parentList.addEventListener('click', removeURL);
  form.addEventListener('submit', submitForm);
  fileContainer.addEventListener('change', addInputField);
  fileContainer.addEventListener('click', removeInputField);
};

// ----- Functions -----

// Function to add an input field once a file has been selected
function addInputField (e) {
  if (e.target && e.target.type === 'file') {
    const form = document.querySelector('form');
    var subFileContainer = document.createElement('div');
    var input = document.createElement('input');
    var br = document.createElement('br');
    input.setAttribute('type', 'file');
    input.multiple = false;
    input.classList.add('fileInput');

    // counting number of elements
    var number = form.getElementsByClassName('fileInput').length;
    input.id = 'file' + number;

    // adding remove element
    var removeFile = document.createElement('div');
    removeFile.appendChild(document.createTextNode('Remove file'));
    removeFile.classList.add('removeFile');

    subFileContainer.appendChild(input);
    subFileContainer.appendChild(removeFile);
    subFileContainer.appendChild(br);

    // finalising
    var fileContainer = document.getElementById('fileContainer');
    fileContainer.appendChild(subFileContainer);
  }
}

// Function to remove an input field
function removeInputField (e) {
  if (e.target && e.target.classList == 'removeFile') {
    e.target.parentNode.remove();
  }
}

// Function to remove urlFields
function removeURL (e) {
  if (e.target && e.target.classList == 'removeURL') {
    e.target.closest('li').remove();
  }
}

// Function to dynamically add sources (file or URL)
function addURL () {
  var ul = document.getElementById('parentList');
  var urlField = document.getElementById('urlField').value;
  if (urlField != '') {
    // TODO: add test to avid adding twice the same URL

    // creating the li object
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(urlField));

    // adding the remove addURL
    var removeURL = document.createElement('div');
    removeURL.appendChild(document.createTextNode('X'));
    removeURL.classList.add('removeURL');
    li.appendChild(removeURL);

    // finalising
    ul.appendChild(li);
  }
}

// function to submit form when ready
function submitForm () {
  event.preventDefault(); // preventing sending the request

  console.log('.. gathering files attached');
  // Gather files and begin FormData
  var formData = new FormData();
  // Append files to formData
  const fileNode = document.querySelectorAll("input[type='file']");
  for (var i = 0; i < fileNode.length; i++) {
    if (fileNode[i].value != '') {
      formData.append('files[]', fileNode[i].files[0]);
    }
  }
  // Append URL to formData
  const urlNode = document.querySelectorAll('li');
  for (var i = 0; i < urlNode.length; i++) {
    // retrieve the text
    var text = urlNode[i].childNodes[0].nodeValue;
    // add it to the formData
    formData.append('url[]', text);
  }

  if ((fileNode.length + urlNode.length) < 2) {
    const err = document.getElementById('return');
    alert('You need at least two documents selected!');
  } else {
    console.log('.. sending data to the server');

    const url = '/aggreg';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('ContentType', 'multipart/form-data');
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      // script taken from stakoverflow
      if (this.status === 200) {
        var filename = '';
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = typeof File === 'function'
          ? new File([this.response], filename, { type: type })
          : new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement('a');
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
                window.location = downloadUrl;
            } else {
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
            }
          } else {
            window.location = downloadUrl;
          }
          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };
    xhr.send(formData);
  }
}
