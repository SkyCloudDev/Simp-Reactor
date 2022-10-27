// ==UserScript==
// @name Simping
// @namespace https://github.com/SkyCloudDev
// @author SkyCloudDev
// @description Downloads images and videos from posts
// @version 0.3
// @icon https://simp4.jpg.church/simpcityIcon192.png
// @license WTFPL; http://www.wtfpl.net/txt/copying/
// @match https://simpcity.su/threads/*
// @require https://code.jquery.com/jquery-3.3.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require https://unpkg.com/file-saver@2.0.4/dist/FileSaver.min.js
// @require https://cdn.jsdelivr.net/npm/m3u8-parser@4.5.2/dist/m3u8-parser.min.js
// @connect self
// @run-at document-start
// @grant GM_xmlhttpRequest
// @grant GM_download
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_log


// ==/UserScript==

// ----- Settings ----- //



// ----- End Settings ----- //



const customName = false;
/**
* If 'true' – trying to get video/gif links from iframes(like sendvid and imgur)
*/
const ALLOW_THREAD_TITLE_EMOJI = false;
/**
* Edit this to change the replacement for illegal characters.
* Bad things may happen if you set this to an empty string, and the
* resulting title after replacement contains illegal characters or phrases.
* @type {string} Illegal characters in the thread title will be replaced with this string.
*/
const ILLEGAL_CHAR_REPLACEMENT = '-';
/**
* Determines if a string is null or empty.
* @param {string} str The string to be tested.
* @returns {boolean} True if the string is null or empty, false if the string is not nul or empty.
*/
const isNullOrEmpty = (str) => {
    return !str;
};
/* globals jQuery JSZip saveAs */
/**
* Gets the thread title, removes illegal characters.
* @returns {string} String containing the thread title with illegal characters replaced.
*/

// Define file name regexps
const REGEX_EMOJI = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
const REGEX_WINDOWS = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$|([<>:"\/\\|?*])|(\.|\s)$/gi;

const getThreadTitle = () => {

    // Strip label buttons
    let threadTitle = [...document.querySelector('.p-title-value').childNodes].reduce((title, child) => {
        return child.nodeType === 3 && !isNullOrEmpty(child.textContent) ? (title += child.textContent.replace(/\n/g, '')) : '';
    });
    // Check for title in object
    if (typeof threadTitle === "object") {
        threadTitle = threadTitle['wholeText'];
    }
    threadTitle = threadTitle.trim();
    threadTitle = threadTitle.replace(/\n/g, '');
    threadTitle = threadTitle.toString();
    // Remove emoji from title
    if (!ALLOW_THREAD_TITLE_EMOJI) {
        threadTitle = threadTitle.replaceAll(REGEX_EMOJI, ILLEGAL_CHAR_REPLACEMENT);
    }
    threadTitle = threadTitle.replaceAll(REGEX_WINDOWS, ILLEGAL_CHAR_REPLACEMENT);
    threadTitle = threadTitle.trim();
    // Remove illegal chars and names (Windows)
    console.log("Thread Title: " + threadTitle);
    return threadTitle;
};


async function simp(post, fileName, altFileName) {
    var $text = $(post).children('a');

    $text.text('Simped');
    //Distribute some love for your downloaded post if it was actually successful
    let likeTag;
    let likeID;
    try {
        likeTag = post.parentNode.parentNode.parentNode.querySelector('.reaction--imageHidden');
        likeID = likeTag.getAttribute('href').replace("id=1", "id=35");
        likeTag.setAttribute("href", likeID);
        likeTag.click();
    } catch {
    }
}


function inputName(post, callback) {
    var postNumber = $(post).parent().find('li:last-child > a').text().trim();
    var threadTitle = getThreadTitle();
    if (customName && confirm('Do you wanna input name for the zip?')) {
        let zipName = prompt('Input name:', GM_getValue('last_name', ''));
        GM_setValue('last_name', zipName);
        callback(post, zipName ? `${threadTitle}/${postNumber}/${zipName}` : (GM_download ? `${threadTitle}/${postNumber}` : threadTitle + ' - ' + postNumber, `${threadTitle}/${postNumber}`));
    } else {
        callback(post, GM_download ? `${threadTitle}/${postNumber}` : threadTitle + ' - ' + postNumber, `${threadTitle}/${postNumber}`);
    }
}


jQuery(function ($) {
    $('.message-attribution-opposite')
        .map(function () { return $(this).children('li:first'); })
        .each(function () {
            var downloadLink = $('<li><a href="#" class="SimpSinglePost">Simp</a><li>');
            var $text = downloadLink.children('a');
            downloadLink.insertBefore($(this));
            downloadLink.click(function (e) {
                e.preventDefault();
                inputName(this, simp);
            });
        });
    // add 'download all' button
    var SimpAllLink = $('<a href="#" class="button--link button rippleButton" ID="SimpAllFiles">Simp All</a>');
    $("div.buttonGroup").css({'display': 'inline-flex', 'flex-wrap': 'wrap', 'align-items': 'center' }).prepend(SimpAllLink);

    // download all files on page
    $(document).on("click", "#SimpAllFiles", function (e) {
        e.preventDefault();
        var singlePosts = document.querySelectorAll(".SimpSinglePost");
        for (let i = 0; i < singlePosts.length; i++) {
            singlePosts[i].click();
        }
    });
});
