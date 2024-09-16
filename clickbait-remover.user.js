// ==UserScript==
// @name         Clickbait Remover for YouTube (Tampermonkey)
// @namespace    https://github.com/pietervanheijningen/clickbait-remover-for-youtube
// @version      1.0
// @description  Remove clickbait from YouTube video titles and thumbnails.
// @author       pietervanheijningen
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (typeof window.styleElement === 'undefined') { // Ensure the script runs only once
        window.styleElement = null;

        // Apply title and thumbnail modifications immediately
        applyChanges();

        // Observe for page changes (e.g., navigation or dynamically loaded content)
        const observer = new MutationObserver(applyChanges);
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for messages and update based on settings
        window.addEventListener('message', function(event) {
            const message = event.data;

            if (message.type === 'UPDATE_SETTINGS') {
                Object.keys(message.settings).forEach(function (change) {
                    switch (change) {
                        case 'preferred_thumbnail_file':
                            updateThumbnails(message.settings[change] || 'hq2');
                            break;
                        case 'video_title_format':
                            updateCSS(message.settings[change] || 'lowercase');
                            break;
                    }
                });
            }
        });

        function applyChanges() {
            // Default to "lowercase" for titles and "hq2" for thumbnails
            updateCSS('lowercase');
            updateThumbnails('hq2');
        }

        function updateCSS(format) {
            let appendingElement = false;

            if (window.styleElement === null) {
                appendingElement = true;
                window.styleElement = document.createElement('style');
            }

            let cssContent = '';
            switch (format) {
                case 'lowercase':
                    cssContent = `
                    #video-title,
                    .ytp-videowall-still-info-title,
                    .large-media-item-metadata > a > h3 > span,
                    .media-item-metadata > a > h3 > span,
                    .compact-media-item-headline > span {
                        text-transform: lowercase;
                    }
                    `;
                    break;
                case 'capitalize_first_letter':
                    cssContent = `
                    #video-title,
                    .ytp-videowall-still-info-title,
                    .large-media-item-metadata > a > h3 > span,
                    .media-item-metadata > a > h3 > span,
                    .compact-media-item-headline > span {
                        text-transform: lowercase;
                        display: block !important;
                    }
                    #video-title::first-letter,
                    .ytp-videowall-still-info-title::first-letter,
                    .large-media-item-metadata > a > h3 > span::first-letter,
                    .media-item-metadata > a > h3 > span::first-letter,
                    .compact-media-item-headline > span::first-letter {
                        text-transform: uppercase;
                    }
                    `;
                    break;
                case 'capitalise_words':
                    cssContent = `
                    #video-title,
                    .ytp-videowall-still-info-title,
                    .large-media-item-metadata > a > h3 > span,
                    .media-item-metadata > a > h3 > span,
                    .compact-media-item-headline > span {
                        text-transform: lowercase;
                        display: block !important;
                    }
                    #video-title::first-line,
                    .ytp-videowall-still-info-title::first-line,
                    .large-media-item-metadata > a > h3 > span::first-line,
                    .media-item-metadata > a > h3 > span::first-line,
                    .compact-media-item-headline > span::first-line {
                        text-transform: capitalize;
                    }
                    `;
                    break;
                case 'default':
                    window.styleElement.remove();
                    window.styleElement = null;
                    return;
            }

            window.styleElement.innerHTML = cssContent;

            if (appendingElement) {
                document.head.appendChild(window.styleElement);
            }
        }

        function updateThumbnails(newImage) {
            const imgElements = document.getElementsByTagName('img');

            for (let i = 0; i < imgElements.length; i++) {
                if (imgElements[i].src.match('https://i9?.ytimg.com/(vi|vi_webp)/.*/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg?.*')) {
                    let url = imgElements[i].src.replace(/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg/, `${newImage}.jpg`);
                    if (!url.match('.*stringtokillcache')) {
                        url += '?stringtokillcache';
                    }
                    imgElements[i].src = url;
                }
            }

            const backgroundImgElements = document.querySelectorAll('.ytp-videowall-still-image, .iv-card-image');

            for (let i = 0; i < backgroundImgElements.length; i++) {
                let styleAttribute = backgroundImgElements[i].getAttribute('style');

                if (styleAttribute.match('.*https://i9?.ytimg.com/(vi|vi_webp)/.*/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg?.*')) {
                    let newStyleAttribute = styleAttribute.replace(/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg/, `${newImage}.jpg`);
                    if (!newStyleAttribute.match('.*stringtokillcache.*')) {
                        newStyleAttribute = newStyleAttribute.replace(/"\);$/, '?stringtokillcache");');
                    }
                    backgroundImgElements[i].setAttribute('style', newStyleAttribute);
                }
            }
        }
    }
})();