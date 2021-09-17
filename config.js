module.exports = {
    folders:{
        build:'build',
        src: 'src'
    },
    mode: 'development',
    jsMod: 'webpack', // 'webpack' or false
    webpack:{
        entryFileName: 'entries.js',
        outputFileName: 'app.js'
    },

    serverMod: 'folder', //  'folder' or 'url'
    serverUrl: 'http://localhost/' // Url path if serverMod == url
}