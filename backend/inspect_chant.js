const http = require('http');
const fs = require('fs');

http.get('http://localhost:5000/api/chants', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const chants = JSON.parse(data);
            if (chants.length > 0) {
                fs.writeFileSync('chant_dump.json', JSON.stringify(chants[0], null, 2));
                console.log('Chant dumped to chant_dump.json');
            } else {
                console.log('No chants found');
            }
        } catch (e) {
            console.error(e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
