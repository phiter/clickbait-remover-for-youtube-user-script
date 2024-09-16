Clickbait remover for youtube, but as a user script

Based on: https://github.com/pietervanheijningen/clickbait-remover-for-youtube
You can update the settings via postmessages or by altering the local storage.

```js
window.postMessage({
    type: 'updateSettings',
    settings: {
        video_title_format: 'lowercase',
        preferred_thumbnail_file: 'hq2'
    }
}, "*");
```
