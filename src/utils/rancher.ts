import * as request from 'request-promise-native';

export async function getContainerNumer(): Promise<string> {
    try {
        const responseBody = await request.get('http://rancher-metadata.rancher.internal/2016-07-29/self/container/name');
        console.log(responseBody);
        const r = /\-(\d+)$/;
        const m = responseBody.match(r);
        if (m && m.length >= 2) {
            const num = m[1];
            return num;
        } else {
            return null;
        }
    } catch(error) {
        console.log('This app may not be running in a rancher container.');
        return null;
    }
}