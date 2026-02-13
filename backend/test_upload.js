require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function testUpload() {
    console.log('--- TESTING UPLOAD TO "partitions" ---');
    const dummyBuffer = Buffer.from('test pdf content');
    const fileName = `test-${Date.now()}.txt`;

    try {
        const { data, error } = await supabase.storage
            .from('partitions')
            .upload(fileName, dummyBuffer, {
                contentType: 'text/plain',
                upsert: true
            });

        if (error) {
            console.error('UPLOAD ERROR:', error.message);
            console.error('Error Details:', JSON.stringify(error, null, 2));
        } else {
            console.log('UPLOAD SUCCESS:', data);
        }
    } catch (err) {
        console.error('UNHANDLED ERROR:', err);
    }
}

testUpload();
