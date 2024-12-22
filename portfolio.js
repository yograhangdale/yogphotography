fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Log the data to the console to check the response
        const posts = data.data;
        let output = '';
        posts.forEach(post => {
            let media = post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM'
                ? post.media_url
                : post.thumbnail_url;
            let mediaElement;

            if (post.media_type === 'VIDEO') {
                mediaElement = `<video controls>
                                    <source src="${post.media_url}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>`;
            } else {
                mediaElement = `<img src="${media}" alt="${post.caption}" />`;
            }

            // Display the caption and post media
            output += `
                <div class="instagram-post">
                    <a href="${post.permalink}" target="_blank">
                        ${mediaElement}
                    </a>
                    <div class="caption">
                        <p>${post.caption || 'No caption available'}</p>
                    </div>
                </div>
            `;
        });
        document.getElementById('instagram-feed').innerHTML = output;
    })
    .catch(error => console.error('Error fetching Instagram posts:', error));
