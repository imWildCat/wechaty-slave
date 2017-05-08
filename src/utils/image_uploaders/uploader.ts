const imgurUploader = require('imgur-uploader');
const request = require('request');

import { getEnv } from '../others';

export async function uploadImage(imageStream: NodeJS.ReadableStream) {
    try {
        // const imagePath = await upload2Imgur(imageStream);
        const imagePath = await upload2Tietuku(imageStream);
        // console.log('+1:', imagePath);
        return imagePath;
    } catch (error) {
        console.error('Error while upload avatar:', error);
        return null;
    }
}

function upload2Imgur(imageStream: NodeJS.ReadableStream): Promise<string> {
    console.log('uploading image to imgur');
    const p = new Promise<string>((resolve, reject) => {
        imgurUploader(imageStream.read(), { title: 'Hello!' }).then(data => {
            console.log(data);
            /*
            {
                id: 'OB74hEa',
                link: 'http://i.imgur.com/jbhDywa.jpg',
                title: 'Hello!',
                date: Sun May 24 2015 00:02:41 GMT+0200 (CEST),
                type: 'image/jpg',
                ...
            }
            */
            if (data && data.link) {
                console.log('resolve:', data.link);
                resolve(data.link);
            } else {
                console.error('Error while uploading image: data is null');
                reject('Error while uploading image: data is null');
            }
        }, (error) => {
            reject(error);
        });
    })
    return p;
}

function upload2Tietuku(imageStream: NodeJS.ReadableStream): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const r = request.post('http://up.imgapi.com/', (error, httpResposne, body) => {
            if (error) {
                console.error('Error for networking: upload2Tietuku');
                reject(error);
                return;
            }
            // console.log('body', body);
            try {
                const responseJSON = JSON.parse(body);
                // {
                //     "width": "940",
                //     "height": "520",
                //     "type": "jpg",
                //     "size": "40856",
                //     "ubburl": "[img]http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62.jpg[\/img]",
                //     "linkurl": "http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62.jpg",
                //     "htmlurl": "<img src='http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62.jpg' \/>",
                //     "markdown": "![Markdown](http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62.jpg)",
                //     "s_url": "http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62s.jpg",
                //     "t_url": "http:\/\/i2.muimg.com\/6612\/72e267d878fd0d62t.jpg",
                //     "findurl": "a89f1ef340171dd6"
                // }
                const link = responseJSON.linkurl;
                resolve(link);
            } catch (error) {
                console.error('Error parsing json body: upload2Tietuku');
                reject(error);
            }
        });
        const form = r.form();
        form.append('httptype', '2');
        form.append('Token', getEnv('TIETUKU_KEY', null));
        form.append('file', imageStream, { filename: 'file' });
    });
}