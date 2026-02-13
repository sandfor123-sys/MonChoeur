require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const { cloudinary } = require('./src/config/cloudinary');
const Chant = require('./src/models/Chant');

async function testUpdate() {
    console.log('--- DIAGNOSTIC: UPDATE CHANT ---');
    try {
        // Find a chant to test with
        const chants = await Chant.findAll({});
        if (chants.length === 0) {
            console.log('No chants found to test.');
            return;
        }
        const testChant = chants[0];
        console.log(`Testing with chant: ${testChant.titre} (ID: ${testChant.id})`);

        // Mock update call
        const mockBody = { titre: testChant.titre + ' (Updated)' };
        console.log('Calling Chant.update...');
        await Chant.update(testChant.id, mockBody);
        console.log('Chant.update successful.');

        // Test Supabase connectivity
        console.log('Testing Supabase storage access...');
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Supabase error:', error.message);
        } else {
            console.log('Supabase buckets found:', data.map(b => b.name));
            const bucketExists = data.find(b => b.name === 'partitions');
            if (bucketExists) {
                console.log('SUCCESS: "partitions" bucket found.');
            } else {
                console.error('ERROR: "partitions" bucket NOT found.');
            }
        }

    } catch (err) {
        console.error('CRITICAL ERROR during diagnostic:', err);
    }
}

testUpdate();
