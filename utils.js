function shortenURL(url) {
    let newURL = url.replace('youtube.com/watch?v=', 'youtu.be/');
    newURL = newURL.replace('&start=', '&t=');
    newURL = newURL.split('&end')[0];
    return newURL;
}

module.exports = {
    shortenURL,
};