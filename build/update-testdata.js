var fs = require('fs');

var testdata = JSON.parse(fs.readFileSync('./test/testdata.json', { encoding: 'utf8' }));

fs.writeFileSync('./test/testdata.json', JSON.stringify(testdata, null, 2));
