'use strict';
var aws = require("aws-sdk");
const https = require("https");
var s3 = new aws.S3();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var cloudsearchdomain = new aws.CloudSearchDomain({endpoint: 'videosearch-domain.us-east-1.cloudsearch.amazonaws.com/'});
    console.log("cloudsearchdomain", cloudsearchdomain)
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    var newKey = key.split('.')[0];
    var str = newKey.lastIndexOf("/");
    newKey = newKey.substring(str+1);

    var params = {
        Bucket: bucket,
        Key: key
    }
    
    s3.getObject(params, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log('data.Body.toString()', data.Body.toString()); //this will log data to console
        var body = JSON.parse(data.Body.toString());
        
        var indexerDataStart = '[';
        var indexerData = '';
        var indexerDataEnd = ']';
        var undef;
        var fileEndPoint = "http://<<CloudFront End Point URL>>/inputvideo/"+newKey+".mp4";

        for(var i = 0; i < body.results.items.length; i++) {

            if (body.results.items[i].start_time != undef &&
                body.results.items[i].end_time != undef &&
                body.results.items[i].alternatives[0].confidence != undef &&
                body.results.items[i].alternatives[0].content != undef &&
                body.results.items[i].type != undef &&
                fileEndPoint != undef
            ) {
                if (i !=0){
                    indexerData = indexerData + ',';
                }
                indexerData = indexerData + '{\"type\": \"add\",';
                indexerData = indexerData + '\"id\":\"'+i+'\",';
                indexerData = indexerData + '\"fields\": {';
                    indexerData = indexerData + '\"start_time\":'+'\"'+body.results.items[i].start_time+'\"'+',';
                    indexerData = indexerData + '\"end_time\":'+'\"'+body.results.items[i].end_time+'\"'+',';
                    indexerData = indexerData + '\"confidence\":'+'\"'+body.results.items[i].alternatives[0].confidence+'\"'+',';
                    indexerData = indexerData + '\"content\":'+'\"'+body.results.items[i].alternatives[0].content+'\"'+',';
                    indexerData = indexerData + '\"type\":'+'\"'+body.results.items[i].type+'\"'+',';
                    indexerData = indexerData + '\"url\":'+'\"'+fileEndPoint+'\"';
                indexerData = indexerData + '}}';
            }
          }
        var csparams = {contentType: 'application/json', documents : (indexerDataStart+indexerData+indexerDataEnd) };

        cloudsearchdomain.uploadDocuments(csparams, function(err, data) {
            if(err) {
                console.log('Error uploading documents to cloudsearch', err, err.stack);
            } else {
                console.log('data',data)
                console.log("Uploaded Documents to cloud search successfully!");
            }
        });
    }
})
};
