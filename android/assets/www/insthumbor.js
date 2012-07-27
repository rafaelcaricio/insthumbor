var pictureSource;
var destinationType; 

document.addEventListener("deviceready",onDeviceReady,false);

function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

function changeStatus(status) {
    var statusSpan = document.getElementById('status');
    statusSpan.innerHTML = status;
}

function onPhotoSuccess(imageURI) {
    showPhoto(imageURI);
    uploadPhoto(imageURI);
}

function onPhotoFail(message) {
    alert('Failed because: ' + message);
}

function showPhoto(imageURI) {
    var image = document.getElementById('Image');
    image.style.display = 'block';
    image.src = imageURI;
}

function uploadSuccess(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);

    changeStatus("Response code: " +  r.response);
}

function uploadError(error) {
    alert("An error has occurred: Code = " = error.code);
}

function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="media";
    options.fileName="android_doidao.jpeg";
    options.mimeType="image/jpeg";

    var ft = new FileTransfer();

    var statusSpan = document.getElementById('status');
    changeStatus("Preparing to upload...");

    ft.upload(imageURI, "http://thumbor.caricio.com/upload", uploadSuccess, uploadError, options);

    changeStatus("Uploading...");
}

function capturePhoto() {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 50,
    destinationType: destinationType.FILE_URI });
}
