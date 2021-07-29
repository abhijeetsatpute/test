var express = require('express');
var bodyParser = require('body-parser');
var path = require('path'), fs=require('fs');
var convert = require('./wsdl2swagger');
var app     = express();
const port  = 3000;
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('.'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/view/index.html');
});

app.post('/',urlencodedParser, (req, res, next) => {
    //console.log(req.body.PathToWsdl);
    if(req.body){
        var startPath = req.body.PathToWsdl;
        function fromDir(startPath,filter){
            //console.log('Starting from dir '+startPath+'/');
            if (!fs.existsSync(startPath)){
                console.log("No wsdl File",startPath);
                res.redirect('/');
            }
            var files=fs.readdirSync(startPath);
            for(var i=0;i<files.length;i++){
                var filename=path.join(startPath,files[i]);
                var stat = fs.lstatSync(filename);
                if (stat.isDirectory()){
                    fromDir(filename,filter); //recurse
                }
                else if (filename.indexOf(filter)>=0) {
                    //console.log('-- found: ',filename);
                    console.log('Wsdl found !.... Converting');
                    var found = filename;
                    var filenamewithext = (found.split(path.sep).join(path.posix.sep).split('/').slice(-1)[0])
                    convert.wsdl2swagger(found.split(path.sep).join(path.posix.sep)).then(()=>{
                        res.redirect('/download?file='+filenamewithext);
                    })
                    //console.log(filename.split(path.sep).join(path.posix.sep));
                };
            };
        };
        fromDir(startPath,'.wsdl');
    } else {
        res.redirect('/');
    }
    

    //var filename = input.split('/').slice(-1)[0];

})

app.get('/download', (req, res, next) => {
    if (req.query.file != undefined) {
    var passedFile = req.query.file;
    res.download('./converted/' + passedFile.split('.')[0]+'.yaml');
    } else {
        res.redirect('/');
    }
})

app.listen(process.env.PORT || port, () => console.log(`App listening at http://localhost:${port}`));