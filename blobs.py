
import requests
import datetime
import hmac
import hashlib
import base64

storage_account_name = 'dockerazurefuncblob'
storage_account_key = 'storage_account_key'
api_version = '2018-03-28'
request_time = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
data = "<StorageServiceProperties><DefaultServiceVersion>2012-02-12</DefaultServiceVersion></StorageServiceProperties>"
content_len = str(len(data))
print(content_len)

string_params = {
    'verb': 'PUT',
    'Content-Encoding': '',
    'Content-Language': '',
    'Content-Length': content_len,
    'Content-MD5': '',
    'Content-Type': 'application/xml',
    'Date': '',
    'If-Modified-Since': '',
    'If-Match': '',
    'If-None-Match': '',
    'If-Unmodified-Since': '',
    'Range': '',
    'CanonicalizedHeaders': 'x-ms-date:' + request_time + '\nx-ms-version:' + api_version + '\n',
    'CanonicalizedResource': '/' + storage_account_name + '/\ncomp:properties\nrestype:service'
}

string_to_sign = (string_params['verb'] + '\n'
                  + string_params['Content-Encoding'] + '\n'
                  + string_params['Content-Language'] + '\n'
                  + string_params['Content-Length'] + '\n'
                  + string_params['Content-MD5'] + '\n'
                  + string_params['Content-Type'] + '\n'
                  + string_params['Date'] + '\n'
                  + string_params['If-Modified-Since'] + '\n'
                  + string_params['If-Match'] + '\n'
                  + string_params['If-None-Match'] + '\n'
                  + string_params['If-Unmodified-Since'] + '\n'
                  + string_params['Range'] + '\n'
                  + string_params['CanonicalizedHeaders']
                  + string_params['CanonicalizedResource'])

signed_string = base64.b64encode(hmac.new(base64.b64decode(storage_account_key), msg=string_to_sign.encode('utf-8'), digestmod=hashlib.sha256).digest()).decode()

headers = {
    'x-ms-date' : request_time,
    'x-ms-version' : api_version,
    'Content-Type': 'application/xml',
    'Content-Length': content_len,
    'Authorization' : ('SharedKey ' + storage_account_name + ':' + signed_string)
}

url = ('https://' + storage_account_name + '.blob.core.windows.net/?restype=service&comp=properties')
data = "<StorageServiceProperties><DefaultServiceVersion>2012-02-12</DefaultServiceVersion></StorageServiceProperties>"


r = requests.put(url, headers = headers, data=data)

print(r)
